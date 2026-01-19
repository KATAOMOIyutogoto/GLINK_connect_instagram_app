/**
 * 暗号化・復号化ユーティリティ (AES-256-GCM)
 * トークンを安全に保存するために使用
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits

/**
 * 環境変数から暗号化キーを取得
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyBase64 = process.env.ENCRYPTION_KEY_BASE64;
  if (!keyBase64) {
    throw new Error('ENCRYPTION_KEY_BASE64 is not set');
  }

  const keyBuffer = Buffer.from(keyBase64, 'base64');
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY_BASE64 must be 32 bytes');
  }

  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 文字列を暗号化
 * @param plaintext 暗号化する文字列
 * @returns "iv.ciphertext.tag" 形式のbase64文字列
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH * 8 },
      key,
      data
    );

    // cipherBuffer には暗号文とタグが含まれる
    const cipherArray = new Uint8Array(cipherBuffer);
    
    // IV, ciphertext, tag を base64 エンコードして結合
    const ivBase64 = Buffer.from(iv).toString('base64');
    const cipherBase64 = Buffer.from(cipherArray).toString('base64');

    return `${ivBase64}.${cipherBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * 暗号化された文字列を復号化
 * @param encrypted "iv.ciphertext.tag" 形式のbase64文字列
 * @returns 復号化された文字列
 */
export async function decrypt(encrypted: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const parts = encrypted.split('.');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, cipherBase64] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const cipherBuffer = Buffer.from(cipherBase64, 'base64');

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH * 8 },
      key,
      cipherBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * ランダムな state 値を生成 (CSRF対策)
 */
export function generateState(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(randomBytes).toString('base64url');
}
