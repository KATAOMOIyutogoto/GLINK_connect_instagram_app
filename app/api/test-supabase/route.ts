/**
 * Supabase接続テスト用APIエンドポイント
 * GET /api/test-supabase
 */

import { NextResponse } from 'next/server';
import { listAccounts } from '@/lib/repo/instagramRepo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });

    const accounts = await listAccounts();

    return NextResponse.json({
      success: true,
      accountCount: accounts.length,
      accounts: accounts.map(acc => ({
        igUserId: acc.igUserId,
        username: acc.username,
        connectedAt: acc.connectedAt,
      })),
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    });
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }, { status: 500 });
  }
}
