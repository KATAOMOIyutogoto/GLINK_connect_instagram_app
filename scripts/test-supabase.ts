/**
 * Supabase接続テストスクリプト
 * データベースの接続とテーブルの存在を確認
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む（インポートより先に実行）
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// 環境変数から直接クライアントを作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function testSupabase() {
  console.log('🔍 Supabase接続テストを開始...\n');

  // 1. 環境変数の確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 環境変数チェック:');
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ 設定済み' : '❌ 未設定'}\n`);

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ 環境変数が不足しています。.env.localを確認してください。');
    process.exit(1);
  }

  // 2. テーブルの存在確認
  const tables = [
    'instagram_accounts',
    'instagram_credentials',
    'instagram_fetch_cursors',
    'instagram_media',
    'instagram_stories',
    'instagram_job_runs',
  ];

  console.log('📊 テーブル存在確認:');
  for (const tableName of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`  ${tableName}: ❌ テーブルが存在しません`);
        } else {
          console.log(`  ${tableName}: ⚠️  エラー (${error.message})`);
        }
      } else {
        console.log(`  ${tableName}: ✅ 存在します`);
      }
    } catch (err) {
      console.log(`  ${tableName}: ❌ エラー (${err instanceof Error ? err.message : String(err)})`);
    }
  }

  // 3. 接続テスト（簡単なクエリ）
  console.log('\n🔌 接続テスト:');
  try {
    const { data, error } = await supabaseAdmin
      .from('instagram_accounts')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`  ❌ 接続エラー: ${error.message}`);
      console.log(`  エラーコード: ${error.code}`);
      if (error.code === 'PGRST116') {
        console.log('\n💡 解決策: Supabase SQL Editorで schema.sql を実行してください');
        console.log('   👉 https://supabase.com/dashboard/project/mcnmmcasmcfdoaknskyv/sql');
      }
    } else {
      console.log('  ✅ Supabaseへの接続成功');
    }
  } catch (err) {
    console.log(`  ❌ 予期しないエラー: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 4. 既存データの確認
  console.log('\n📦 既存データ確認:');
  try {
    const { data: accounts, error } = await supabaseAdmin
      .from('instagram_accounts')
      .select('ig_user_id, ig_username, connected_at')
      .order('connected_at', { ascending: false })
      .limit(10);

    if (error) {
      console.log(`  ⚠️  データ取得エラー: ${error.message}`);
    } else {
      console.log(`  📊 接続済みアカウント数: ${accounts?.length || 0}件`);
      if (accounts && accounts.length > 0) {
        console.log('  アカウント一覧:');
        accounts.forEach((acc, idx) => {
          console.log(`    ${idx + 1}. ${acc.ig_username || 'N/A'} (${acc.ig_user_id})`);
        });
      }
    }
  } catch (err) {
    console.log(`  ⚠️  エラー: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log('\n✨ テスト完了');
}

// 実行
testSupabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ テスト実行エラー:', err);
    process.exit(1);
  });
