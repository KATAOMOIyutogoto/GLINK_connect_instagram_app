/**
 * Supabase管理クライアント（サーバーサイド専用）
 * 
 * 重要: このファイルはサーバーサイド（API routes）でのみ使用してください。
 * SERVICE_ROLE_KEYはクライアントに露出させないこと。
 * 
 * SERVICE_ROLE_KEYを使用することでRLSをバイパスします。
 */

import { createClient } from '@supabase/supabase-js';

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl && typeof window === 'undefined') {
  console.warn('⚠️ Missing env variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  console.warn('⚠️ Missing env variable: SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Supabase管理クライアント
 * RLSをバイパスして全データにアクセス可能
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * サーバー専用であることを確認
 */
if (typeof window !== 'undefined') {
  console.error('⚠️ WARNING: supabaseAdmin is being used on the client side!');
}
