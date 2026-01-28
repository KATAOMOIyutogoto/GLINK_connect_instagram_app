/**
 * Instagram データリポジトリ
 * Supabaseへのデータアクセスを抽象化
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { encrypt, decrypt } from '@/lib/crypto';

/**
 * アカウント情報（アプリケーション層）
 */
export interface InstagramAccount {
  igUserId: string;
  username?: string;
  accountType?: string;
  accessToken: string; // 復号化済み
  tokenType: string;
  scopes?: string[];
  expiresIn?: number;
  connectedAt: string;
  tokenExpiresAt?: string;
  lastRefreshedAt?: string;
}

/**
 * アカウント情報（表示用、トークンなし）
 */
export interface InstagramAccountView {
  igUserId: string;
  username?: string;
  tokenType: string;
  connectedAt: string;
  tokenExpiresAt?: string;
  lastRefreshedAt?: string;
  mediaLastFetchedAt?: string;
  storiesLastFetchedAt?: string;
}

/**
 * アカウント情報を保存（upsert）
 * トークンは暗号化して保存
 */
export async function saveAccount(account: InstagramAccount): Promise<void> {
  const {
    igUserId,
    username,
    accountType,
    accessToken,
    tokenType,
    scopes,
    expiresIn,
    connectedAt,
    tokenExpiresAt,
    lastRefreshedAt,
  } = account;

  console.log('💾 Saving account to Supabase:', {
    igUserId,
    username,
    accountType,
    hasToken: !!accessToken,
  });

  // 1. instagram_accounts をupsert
  const { data: accountData, error: accountError } = await supabaseAdmin
    .from('instagram_accounts')
    .upsert(
      {
        ig_user_id: igUserId,
        ig_username: username || null,
        account_type: accountType || null,
        connected_at: connectedAt,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'ig_user_id',
      }
    )
    .select('id')
    .single();

  if (accountError) {
    console.error('Failed to upsert instagram_accounts:', accountError);
    throw new Error(`Failed to save account: ${accountError.message}`);
  }

  const accountId = accountData.id;

  // 2. トークンを暗号化
  const encryptedToken = await encrypt(accessToken);

  // 3. instagram_credentials をupsert
  const expiresAt = tokenExpiresAt || (expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : null);

  const { error: credError } = await supabaseAdmin
    .from('instagram_credentials')
    .upsert(
      {
        account_id: accountId,
        encrypted_access_token: encryptedToken,
        token_type: tokenType,
        scopes: scopes || null,
        expires_at: expiresAt,
        last_refreshed_at: lastRefreshedAt || new Date().toISOString(),
      },
      {
        onConflict: 'account_id',
      }
    );

  if (credError) {
    console.error('Failed to upsert instagram_credentials:', credError);
    throw new Error(`Failed to save credentials: ${credError.message}`);
  }

  // 4. instagram_fetch_cursors を初期化（存在しない場合のみ）
  const { error: cursorError } = await supabaseAdmin
    .from('instagram_fetch_cursors')
    .upsert(
      {
        account_id: accountId,
        media_last_fetched_at: null,
        stories_last_fetched_at: null,
      },
      {
        onConflict: 'account_id',
        ignoreDuplicates: true, // 既存レコードは更新しない
      }
    );

  if (cursorError) {
    console.error('Failed to initialize instagram_fetch_cursors:', cursorError);
    // カーソルの初期化失敗は致命的ではないのでログのみ
  }
}

/**
 * アカウント情報を取得（トークンは復号化）
 */
export async function getAccount(igUserId: string): Promise<InstagramAccount | null> {
  // 1. アカウント情報を取得
  const { data: accountData, error: accountError } = await supabaseAdmin
    .from('instagram_accounts')
    .select('*')
    .eq('ig_user_id', igUserId)
    .single();

  if (accountError || !accountData) {
    return null;
  }

  // 2. 認証情報を取得
  const { data: credData, error: credError } = await supabaseAdmin
    .from('instagram_credentials')
    .select('*')
    .eq('account_id', accountData.id)
    .single();

  if (credError || !credData) {
    return null;
  }

  // 3. トークンを復号化
  const accessToken = await decrypt(credData.encrypted_access_token);

  // 4. expiresIn を計算（expires_atから）
  let expiresIn: number | undefined;
  if (credData.expires_at) {
    const expiresAtMs = new Date(credData.expires_at).getTime();
    const nowMs = Date.now();
    expiresIn = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
  }

  return {
    igUserId: accountData.ig_user_id,
    username: accountData.ig_username || undefined,
    accessToken,
    tokenType: credData.token_type || 'Bearer',
    scopes: credData.scopes || undefined,
    expiresIn,
    connectedAt: accountData.connected_at,
    tokenExpiresAt: credData.expires_at || undefined,
    lastRefreshedAt: credData.last_refreshed_at || undefined,
  };
}

/**
 * 接続済みアカウント一覧を取得（トークンは含まない）
 */
export async function listAccounts(): Promise<InstagramAccountView[]> {
  console.log('📋 Fetching accounts list...');

  // JOINして一括取得
  const { data, error } = await supabaseAdmin
    .from('instagram_accounts')
    .select(`
      ig_user_id,
      ig_username,
      connected_at,
      instagram_credentials(
        token_type,
        expires_at,
        last_refreshed_at
      ),
      instagram_fetch_cursors(
        media_last_fetched_at,
        stories_last_fetched_at
      )
    `)
    .order('connected_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to list accounts:', error);
    throw new Error(`Failed to list accounts: ${error.message}`);
  }

  console.log('✅ Accounts fetched:', data?.length || 0, 'accounts');
  console.log('Raw data:', JSON.stringify(data, null, 2));

  return (data || []).map((row: any) => ({
    igUserId: row.ig_user_id,
    username: row.ig_username || undefined,
    tokenType: row.instagram_credentials?.[0]?.token_type || 'Bearer',
    connectedAt: row.connected_at,
    tokenExpiresAt: row.instagram_credentials?.[0]?.expires_at || undefined,
    lastRefreshedAt: row.instagram_credentials?.[0]?.last_refreshed_at || undefined,
    mediaLastFetchedAt: row.instagram_fetch_cursors?.[0]?.media_last_fetched_at || undefined,
    storiesLastFetchedAt: row.instagram_fetch_cursors?.[0]?.stories_last_fetched_at || undefined,
  }));
}

/**
 * アカウントを削除
 */
export async function deleteAccount(igUserId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('instagram_accounts')
    .delete()
    .eq('ig_user_id', igUserId);

  if (error) {
    console.error('Failed to delete account:', error);
    throw new Error(`Failed to delete account: ${error.message}`);
  }
}

/**
 * トークンを更新
 */
export async function updateAccountToken(
  igUserId: string,
  accessToken: string,
  expiresIn?: number
): Promise<void> {
  // 既存アカウントを取得
  const existingAccount = await getAccount(igUserId);
  if (!existingAccount) {
    throw new Error(`Account ${igUserId} not found`);
  }

  // トークンを暗号化
  const encryptedToken = await encrypt(accessToken);

  const now = new Date().toISOString();
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : null;

  // アカウントIDを取得
  const { data: accountData } = await supabaseAdmin
    .from('instagram_accounts')
    .select('id')
    .eq('ig_user_id', igUserId)
    .single();

  if (!accountData) {
    throw new Error(`Account ${igUserId} not found`);
  }

  // 認証情報を更新
  const { error } = await supabaseAdmin
    .from('instagram_credentials')
    .update({
      encrypted_access_token: encryptedToken,
      expires_at: expiresAt,
      last_refreshed_at: now,
    })
    .eq('account_id', accountData.id);

  if (error) {
    console.error('Failed to update token:', error);
    throw new Error(`Failed to update token: ${error.message}`);
  }
}

/**
 * ジョブ実行を記録
 */
export async function logJobRun(params: {
  jobName: string;
  accountId?: string;
  status: 'running' | 'success' | 'failure';
  errorMessage?: string;
  details?: any;
}): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('instagram_job_runs')
    .insert({
      job_name: params.jobName,
      account_id: params.accountId || null,
      status: params.status,
      error_message: params.errorMessage || null,
      details: params.details || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to log job run:', error);
    throw new Error(`Failed to log job run: ${error.message}`);
  }

  return data.id;
}

/**
 * ジョブ実行を完了
 */
export async function finishJobRun(
  jobId: string,
  status: 'success' | 'failure',
  errorMessage?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('instagram_job_runs')
    .update({
      finished_at: new Date().toISOString(),
      status,
      error_message: errorMessage || null,
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to finish job run:', error);
    throw new Error(`Failed to finish job run: ${error.message}`);
  }
}
