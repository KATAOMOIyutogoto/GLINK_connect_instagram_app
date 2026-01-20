/**
 * Instagram Graph API 連携ユーティリティ
 * ビジネス/クリエイターアカウント向け
 */

const FB_OAUTH_BASE = 'https://www.facebook.com/v18.0/dialog/oauth';
const FB_GRAPH_BASE = 'https://graph.facebook.com/v18.0';

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
  const scopes = process.env.IG_SCOPES?.split(',') || [
    'instagram_basic',
    'pages_show_list',
    'pages_read_engagement',
  ];

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Instagram configuration is incomplete');
  }

  return { appId, appSecret, redirectUri, scopes };
}

/**
 * OAuth認可URLを生成（Facebook経由でInstagramアカウントに接続）
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

  return `${FB_OAUTH_BASE}?${params.toString()}`;
}

/**
 * 認可コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const config = getInstagramConfig();

  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    code,
    redirect_uri: config.redirectUri,
  });

  try {
    const response = await fetch(`${FB_GRAPH_BASE}/oauth/access_token?${params.toString()}`, {
      method: 'GET',
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
    grant_type: 'fb_exchange_token',
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  try {
    const response = await fetch(`${FB_GRAPH_BASE}/oauth/access_token?${params.toString()}`, {
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
 * FacebookページからInstagramビジネスアカウントIDを取得
 */
export async function getInstagramBusinessAccount(accessToken: string): Promise<{
  instagram_business_account?: { id: string };
  id: string;
  name: string;
}> {
  try {
    const response = await fetch(
      `${FB_GRAPH_BASE}/me/accounts?fields=instagram_business_account,id,name&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch pages:', errorText);
      throw new Error(`Failed to fetch pages: ${response.status}`);
    }

    const data = await response.json();
    
    // Instagram Business Accountが紐づいているページを探す
    const pageWithInstagram = data.data?.find(
      (page: any) => page.instagram_business_account
    );

    if (!pageWithInstagram) {
      throw new Error('No Instagram Business Account found');
    }

    return pageWithInstagram;
  } catch (error) {
    console.error('Error fetching Instagram business account:', error);
    throw error;
  }
}

/**
 * Instagramビジネスアカウントのプロフィールを取得
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  try {
    // まずFacebookページからInstagram Business Accountを取得
    const pageData = await getInstagramBusinessAccount(accessToken);
    
    if (!pageData.instagram_business_account) {
      throw new Error('Instagram Business Account not found');
    }

    const igAccountId = pageData.instagram_business_account.id;

    // Instagramアカウントの詳細を取得
    const response = await fetch(
      `${FB_GRAPH_BASE}/${igAccountId}?fields=id,username,name,account_type&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Instagram profile:', errorText);
      return { id: igAccountId };
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
  const config = getInstagramConfig();

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: accessToken,
  });

  try {
    const response = await fetch(`${FB_GRAPH_BASE}/oauth/access_token?${params.toString()}`, {
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
