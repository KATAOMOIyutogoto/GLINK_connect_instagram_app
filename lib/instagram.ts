/**
 * Instagram API 連携ユーティリティ
 * OAuth認可フローとトークン交換
 */

const IG_OAUTH_BASE = 'https://api.instagram.com/oauth';
const IG_GRAPH_BASE = 'https://graph.instagram.com';

export interface InstagramConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user_id: string;
}

export interface UserProfile {
  id: string;
  username?: string;
}

/**
 * 環境変数からInstagram設定を取得
 */
export function getInstagramConfig(): InstagramConfig {
  const appId = process.env.IG_APP_ID;
  const appSecret = process.env.IG_APP_SECRET;
  const redirectUri = process.env.IG_REDIRECT_URI;
  const scopes = process.env.IG_SCOPES?.split(',') || ['instagram_basic'];

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Instagram configuration is incomplete');
  }

  return { appId, appSecret, redirectUri, scopes };
}

/**
 * OAuth認可URLを生成
 */
export function generateAuthUrl(state: string): string {
  const config = getInstagramConfig();
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(','),
    response_type: 'code',
    state,
  });

  return `${IG_OAUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * 認可コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const config = getInstagramConfig();

  const formData = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
    code,
  });

  try {
    const response = await fetch(`${IG_OAUTH_BASE}/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    return data as TokenResponse;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * アクセストークンを長期トークンに交換
 * Instagram Basic Display API の場合に使用
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<TokenResponse> {
  const config = getInstagramConfig();

  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: config.appSecret,
    access_token: shortLivedToken,
  });

  try {
    const response = await fetch(`${IG_GRAPH_BASE}/access_token?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Long-lived token exchange failed:', errorText);
      throw new Error(`Long-lived token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    return data as TokenResponse;
  } catch (error) {
    console.error('Error exchanging for long-lived token:', error);
    throw error;
  }
}

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  try {
    const response = await fetch(
      `${IG_GRAPH_BASE}/me?fields=id,username&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch user profile:', errorText);
      // プロフィール取得失敗は致命的ではないので、IDのみ返す
      return { id: 'unknown' };
    }

    const data = await response.json();
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { id: 'unknown' };
  }
}

/**
 * トークンをリフレッシュ（長期トークンの更新）
 */
export async function refreshLongLivedToken(accessToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: accessToken,
  });

  try {
    const response = await fetch(`${IG_GRAPH_BASE}/refresh_access_token?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return data as TokenResponse;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}
