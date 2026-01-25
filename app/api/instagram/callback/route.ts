/**
 * Instagram OAuth コールバックエンドポイント
 * GET /api/instagram/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, exchangeForLongLivedToken, getUserProfile } from '@/lib/instagram';
import { saveAccount } from '@/lib/repo/instagramRepo';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // エラーレスポンスの処理
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/connect?error=OAuth+error:+${error}`, request.nextUrl.origin)
    );
  }

  // code または state が欠けている
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/connect?error=Missing+code+or+state', request.nextUrl.origin)
    );
  }

  try {
    // state を検証（CSRF対策）
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;

    if (!savedState || savedState !== state) {
      console.error('State mismatch:', { savedState, receivedState: state });
      return NextResponse.redirect(
        new URL('/connect?error=Invalid+state+(CSRF+check+failed)', request.nextUrl.origin)
      );
    }

    // state Cookie を削除
    cookieStore.delete('oauth_state');

    // 1. 認可コードをアクセストークンに交換
    console.log('Exchanging code for token...');
    const tokenResponse = await exchangeCodeForToken(code);

    let finalAccessToken = tokenResponse.access_token;
    let expiresIn = tokenResponse.expires_in;

    // 2. 短期トークンを長期トークンに交換（Instagram Graph API）
    try {
      console.log('Attempting to exchange for long-lived token...');
      const longLivedResponse = await exchangeForLongLivedToken(tokenResponse.access_token);
      finalAccessToken = longLivedResponse.access_token;
      expiresIn = longLivedResponse.expires_in;
      console.log('Long-lived token obtained');
    } catch (longLivedError) {
      console.warn('Long-lived token exchange failed (using short-lived token):', longLivedError);
      // 長期トークン交換に失敗した場合は短期トークンをそのまま使用
    }

    // 3. ユーザープロフィールを取得（Instagram Graph API経由）
    const userProfile = await getUserProfile(finalAccessToken);

    // 4. アカウント情報を保存
    const now = new Date();
    const tokenExpiresAt = expiresIn
      ? new Date(now.getTime() + expiresIn * 1000).toISOString()
      : undefined;

    // Instagram Graph APIでは userProfile.id がInstagram Business Account ID
    const igUserId = userProfile.id;
    console.log('Saving account:', {
      igUserId,
      username: userProfile.username,
      hasToken: !!finalAccessToken,
      tokenType: tokenResponse.token_type,
      expiresIn,
    });

    try {
      await saveAccount({
        igUserId,
        username: userProfile.username,
        accessToken: finalAccessToken,
        tokenType: tokenResponse.token_type,
        expiresIn,
        connectedAt: now.toISOString(),
        tokenExpiresAt,
        lastRefreshedAt: now.toISOString(),
      });

      console.log('✅ Account saved successfully:', igUserId);
    } catch (saveError) {
      console.error('❌ Failed to save account:', saveError);
      const errorDetails = saveError instanceof Error ? saveError.message : String(saveError);
      throw new Error(`Failed to save account to database: ${errorDetails}`);
    }

    // 5. 接続済みページにリダイレクト
    return NextResponse.redirect(new URL('/connected', request.nextUrl.origin));
  } catch (error) {
    console.error('Callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown+error';
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent(errorMessage)}`, request.nextUrl.origin)
    );
  }
}
