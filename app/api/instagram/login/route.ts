/**
 * Instagram OAuth ログイン開始エンドポイント
 * GET /api/instagram/login
 */

import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/instagram';
import { generateState } from '@/lib/crypto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // CSRF対策用の state を生成
    const state = generateState();

    // state を HttpOnly Cookie に保存
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10分
      path: '/',
    });

    // Instagram 認可 URL を生成
    const authUrl = generateAuthUrl(state);
    
    // デバッグ: 生成されたURLをログ出力
    console.log('🔗 Generated OAuth URL:', authUrl);
    console.log('📋 OAuth URL should be: https://api.instagram.com/oauth/authorize');

    // 認可URLにリダイレクト
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      new URL('/connect?error=Failed+to+start+OAuth+flow', process.env.IG_REDIRECT_URI || 'http://localhost:3000')
    );
  }
}
