/**
 * 接続済みアカウント一覧取得エンドポイント（内部用API）
 * GET /api/instagram/status
 */

import { NextResponse } from 'next/server';
import { listAccounts } from '@/lib/repo/instagramRepo';

export async function GET() {
  try {
    const accounts = await listAccounts();

    return NextResponse.json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accounts',
      },
      { status: 500 }
    );
  }
}
