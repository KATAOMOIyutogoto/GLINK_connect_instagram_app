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
    console.log('Token response:', {
      user_id: tokenResponse.user_id,
      expires_in: tokenResponse.expires_in
    });

    let finalAccessToken = tokenResponse.access_token;
    let expiresIn = tokenResponse.expires_in;
    let igUserId = tokenResponse.user_id; // Instagram User IDをトークンレスポンスから取得

    // 2. 短期トークンを長期トークンに交換（Instagram Graph API）
    try {
      console.log('Attempting to exchange for long-lived token...');
      const longLivedResponse = await exchangeForLongLivedToken(tokenResponse.access_token);
      finalAccessToken = longLivedResponse.access_token;
      expiresIn = longLivedResponse.expires_in;
      console.log('✅ Long-lived token obtained, expires_in:', expiresIn);
    } catch (longLivedError) {
      console.warn('⚠️  Long-lived token exchange failed (using short-lived token):', longLivedError);
      // 長期トークン交換に失敗した場合は短期トークンをそのまま使用
    }

    // 3. ユーザープロフィールを取得（オプション - usernameを取得するため）
    let username: string | undefined;
    try {
      console.log('📋 Attempting to fetch user profile for username...');
      const userProfile = await getUserProfile(finalAccessToken);
      console.log('✅ User profile fetched:', userProfile);
      username = userProfile.username;
      // user_idがまだない場合はここで取得
      if (!igUserId) {
        igUserId = userProfile.id;
      }
    } catch (profileError) {
      console.warn('⚠️  Failed to fetch user profile (will use user_id from token):', profileError);
      // usernameは取得できないが、user_idがあれば続行可能
    }

    // 4. アカウント情報を保存
    const now = new Date();
    const tokenExpiresAt = expiresIn
      ? new Date(now.getTime() + expiresIn * 1000).toISOString()
      : undefined;

    // Instagram User IDの検証
    if (!igUserId) {
      console.error('❌ Failed to get Instagram User ID from token response');
      throw new Error('Instagram User ID is missing');
    }

    console.log('Saving account:', {
      igUserId,
      username,
      hasToken: !!finalAccessToken,
      tokenType: tokenResponse.token_type,
      expiresIn,
    });

    try {
      await saveAccount({
        igUserId,
        username,
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
