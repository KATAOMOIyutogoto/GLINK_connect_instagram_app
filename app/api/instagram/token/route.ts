/**
 * Bot用: アクセストークン取得エンドポイント
 * GET /api/instagram/token?igUserId={igUserId}
 * 
 * 後続のBotが使用するためのトークン取得API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccount } from '@/lib/repo/instagramRepo';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const igUserId = searchParams.get('igUserId');

    if (!igUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'igUserId parameter is required',
        },
        { status: 400 }
      );
    }

    // アカウント情報を取得（トークンは復号化済み）
    const account = await getAccount(igUserId);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found',
        },
        { status: 404 }
      );
    }

    // トークンが有効か確認（期限切れチェック）
    const isExpired = account.tokenExpiresAt
      ? new Date(account.tokenExpiresAt) < new Date()
      : false;

    if (isExpired) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token has expired. Please refresh the token.',
          tokenExpiresAt: account.tokenExpiresAt,
        },
        { status: 401 }
      );
    }

    // Bot用に必要な情報のみ返す
    return NextResponse.json({
      success: true,
      igUserId: account.igUserId,
      username: account.username,
      accessToken: account.accessToken,
      tokenType: account.tokenType,
      expiresIn: account.expiresIn,
      tokenExpiresAt: account.tokenExpiresAt,
      // Botがメディア取得に使用するエンドポイント情報
      endpoints: {
        media: `https://graph.facebook.com/v18.0/${account.igUserId}/media`,
        stories: `https://graph.facebook.com/v18.0/${account.igUserId}/stories`,
      },
    });
  } catch (error) {
    console.error('Token API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
