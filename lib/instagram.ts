/**
 * Instagram API with Instagram Login 連携ユーティリティ
 * ビジネス/クリエイターアカウント向け（Facebookアカウント不要）
 * 
 * 2024年7月リリースの新しい方式
 * - 顧客はInstagramアカウントだけでログイン可能
 * - Facebookページへの接続が不要
 * - より簡単なオンボーディング
 * 
 * このAPIは投稿・ストーリーのダウンロードに必要です
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
  user_id?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  name?: string;
  account_type?: string;
}

/**
 * 環境変数からInstagram設定を取得
 */
export function getInstagramConfig(): InstagramConfig {
  const appId = process.env.IG_APP_ID;
  const appSecret = process.env.IG_APP_SECRET;
  const redirectUri = process.env.IG_REDIRECT_URI;
  // 新しいスコープ（Instagram API with Instagram Login用）
  // 注意: 2025年1月27日以降、古いスコープは非推奨
  const scopes = process.env.IG_SCOPES?.split(',') || [
    'instagram_business_basic',
  ];

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Instagram configuration is incomplete');
  }

  return { appId, appSecret, redirectUri, scopes };
}

/**
 * OAuth認可URLを生成（Instagram Login経由）
 * 顧客はInstagramアカウントだけでログイン可能（Facebookアカウント不要）
 * 
 * 注意: Meta Developer Portalで「Instagram API with Instagram Login」が
 * 正しく設定されていない場合、Facebook認証画面にリダイレクトされる可能性があります。
 */
export function generateAuthUrl(state: string): string {
  const config = getInstagramConfig();
  
  // デバッグ: 設定値を確認
  console.log('🔧 Instagram Config:', {
    appId: config.appId,
    redirectUri: config.redirectUri,
    scopes: config.scopes,
    oauthBase: IG_OAUTH_BASE,
  });
  
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(','),
    response_type: 'code',
    state,
  });

  const authUrl = `${IG_OAUTH_BASE}/authorize?${params.toString()}`;
  
  // デバッグ用: URLが正しく生成されているか確認
  console.log('🔗 Generated OAuth URL:', authUrl);
  console.log('📋 Expected base URL: https://api.instagram.com/oauth/authorize');
  console.log('📋 Actual base URL:', authUrl.split('?')[0]);
  console.log('⚠️  If URL starts with https://www.facebook.com, check Meta Developer Portal settings');
  
  // URLの検証
  if (authUrl.startsWith('https://www.facebook.com')) {
    console.error('❌ ERROR: URL is redirecting to Facebook! This should not happen.');
    console.error('❌ Check Meta Developer Portal settings for "Instagram API with Instagram Login"');
  }
  
  return authUrl;
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
 * 短期トークンを長期トークンに交換
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
 * Instagram API with Instagram Loginでは、直接Instagramアカウント情報を取得
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  try {
    const response = await fetch(
      `${IG_GRAPH_BASE}/me?fields=id,username,account_type&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch user profile:', errorText);
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
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
