/**
 * アプリケーション全体で使用する型定義
 */

export interface InstagramAccount {
  igUserId: string;
  username?: string;
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  connectedAt: string;
  tokenExpiresAt?: string;
  lastRefreshedAt?: string;
}

export interface StoredAccount extends Omit<InstagramAccount, 'accessToken'> {
  encryptedToken: string;
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

export interface InstagramConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
}
