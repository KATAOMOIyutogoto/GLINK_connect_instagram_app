#!/usr/bin/env node

/**
 * KV (Redis) → Supabase (Postgres) 移行スクリプト
 * 
 * 使い方:
 *   npx tsx scripts/migrate-kv-to-supabase.ts
 * 
 * 前提条件:
 *   1. .env.local に KV_REST_API_URL / KV_REST_API_TOKEN が設定済み
 *   2. .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定済み
 *   3. Supabaseのスキーマが作成済み（supabase/schema.sql実行済み）
 * 
 * 注意:
 *   - このスクリプトは一度だけ実行してください
 *   - 既存のSupabaseデータは上書きされます（upsert）
 *   - 実行後、KV関連の環境変数は削除してください
 */

import { createClient } from '@vercel/kv';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 環境変数を読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface KVStoredAccount {
  igUserId: string;
  username?: string;
  encryptedToken: string;
  tokenType: string;
  expiresIn?: number;
  connectedAt: string;
  tokenExpiresAt?: string;
  lastRefreshedAt?: string;
}

// 環境変数チェック
const requiredEnvVars = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ 環境変数 ${varName} が設定されていません`);
    process.exit(1);
  }
}

// KVクライアント
const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Supabaseクライアント
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const ACCOUNT_INDEX_KEY = 'ig:account:index';
const accountKey = (igUserId: string) => `ig:account:${igUserId}`;

async function migrate() {
  console.log('🚀 KV → Supabase 移行を開始します...\n');

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  try {
    // 1. KVからアカウントID一覧を取得
    console.log('📋 KVからアカウント一覧を取得中...');
    const igUserIds = await kv.smembers<string>(ACCOUNT_INDEX_KEY);

    if (!igUserIds || igUserIds.length === 0) {
      console.log('ℹ️  KVに保存されているアカウントはありません');
      return;
    }

    console.log(`✅ ${igUserIds.length} 件のアカウントが見つかりました\n`);

    // 2. 各アカウントを移行
    for (const igUserId of igUserIds) {
      try {
        console.log(`📦 ${igUserId} を移行中...`);

        // KVからアカウント情報を取得
        const kvAccount = await kv.get<KVStoredAccount>(accountKey(igUserId));

        if (!kvAccount) {
          console.log(`⚠️  ${igUserId}: KVにデータが見つかりません（スキップ）`);
          continue;
        }

        // 3. instagram_accounts をupsert
        const { data: accountData, error: accountError } = await supabase
          .from('instagram_accounts')
          .upsert(
            {
              ig_user_id: kvAccount.igUserId,
              ig_username: kvAccount.username || null,
              connected_at: kvAccount.connectedAt,
              last_seen_at: new Date().toISOString(),
            },
            {
              onConflict: 'ig_user_id',
            }
          )
          .select('id')
          .single();

        if (accountError) {
          throw new Error(`instagram_accounts upsert失敗: ${accountError.message}`);
        }

        const accountId = accountData.id;

        // 4. instagram_credentials をupsert
        const expiresAt = kvAccount.tokenExpiresAt || null;

        const { error: credError } = await supabase
          .from('instagram_credentials')
          .upsert(
            {
              account_id: accountId,
              encrypted_access_token: kvAccount.encryptedToken, // KVの暗号化済みトークンをそのまま使用
              token_type: kvAccount.tokenType,
              expires_at: expiresAt,
              last_refreshed_at: kvAccount.lastRefreshedAt || kvAccount.connectedAt,
            },
            {
              onConflict: 'account_id',
            }
          );

        if (credError) {
          throw new Error(`instagram_credentials upsert失敗: ${credError.message}`);
        }

        // 5. instagram_fetch_cursors を初期化
        const { error: cursorError } = await supabase
          .from('instagram_fetch_cursors')
          .upsert(
            {
              account_id: accountId,
              media_last_fetched_at: null,
              stories_last_fetched_at: null,
            },
            {
              onConflict: 'account_id',
              ignoreDuplicates: true,
            }
          );

        if (cursorError) {
          console.log(`  ⚠️  カーソル初期化失敗（無視）: ${cursorError.message}`);
        }

        console.log(`  ✅ ${igUserId} を移行しました`);
        successCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ ${igUserId} の移行に失敗: ${errorMsg}`);
        errors.push(`${igUserId}: ${errorMsg}`);
        failureCount++;
      }
    }

    // 3. サマリー表示
    console.log('\n' + '='.repeat(50));
    console.log('📊 移行結果サマリー');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${successCount} 件`);
    console.log(`❌ 失敗: ${failureCount} 件`);
    console.log(`📦 合計: ${igUserIds.length} 件`);

    if (errors.length > 0) {
      console.log('\n❌ エラー詳細:');
      errors.forEach((err) => console.log(`  - ${err}`));
    }

    if (successCount > 0) {
      console.log('\n✅ 移行が完了しました！');
      console.log('\n次のステップ:');
      console.log('1. Supabaseで移行されたデータを確認してください');
      console.log('2. アプリを再起動してSupabaseから読み取れることを確認してください');
      console.log('3. 確認後、.env.local からKV関連の環境変数を削除してください:');
      console.log('   - KV_URL');
      console.log('   - KV_REST_API_URL');
      console.log('   - KV_REST_API_TOKEN');
      console.log('   - KV_REST_API_READ_ONLY_TOKEN');
      console.log('4. package.json から @vercel/kv を削除してください');
      console.log('5. lib/store.ts を削除してください（もう使われていません）');
    }
  } catch (error) {
    console.error('\n❌ 移行中に予期しないエラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
