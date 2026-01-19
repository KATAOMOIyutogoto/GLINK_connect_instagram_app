/**
 * トークン更新エンドポイント（長期トークンのリフレッシュ）
 * POST /api/instagram/refresh
 * Body: { igUserId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccount, updateAccountToken } from '@/lib/repo/instagramRepo';
import { refreshLongLivedToken } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { igUserId } = body;

    if (!igUserId) {
      return NextResponse.json(
        { success: false, error: 'igUserId is required' },
        { status: 400 }
      );
    }

    // アカウント情報を取得
    const account = await getAccount(igUserId);
    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // トークンをリフレッシュ
    console.log('Refreshing token for:', igUserId);
    const refreshedToken = await refreshLongLivedToken(account.accessToken);

    // 更新されたトークンを保存
    await updateAccountToken(
      igUserId,
      refreshedToken.access_token,
      refreshedToken.expires_in
    );

    console.log('Token refreshed successfully for:', igUserId);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresIn: refreshedToken.expires_in,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
