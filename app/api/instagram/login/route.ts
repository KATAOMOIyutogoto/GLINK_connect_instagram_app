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

    // 環境変数を確認
    console.log('🔍 Environment Variables Check:');
    console.log('  IG_APP_ID:', process.env.IG_APP_ID ? '✅ Set' : '❌ Missing');
    console.log('  IG_APP_SECRET:', process.env.IG_APP_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  IG_REDIRECT_URI:', process.env.IG_REDIRECT_URI || '❌ Missing');
    console.log('  IG_SCOPES:', process.env.IG_SCOPES || '❌ Missing (will use default: instagram_business_basic)');
    
    // Instagram 認可 URL を生成
    const authUrl = generateAuthUrl(state);
    
    // デバッグ: 生成されたURLをログ出力
    console.log('🔗 Final OAuth URL:', authUrl);
    console.log('📋 URL starts with:', authUrl.split('?')[0]);
    
    // URL検証
    if (!authUrl.startsWith('https://api.instagram.com/oauth/authorize')) {
      console.error('❌ CRITICAL ERROR: OAuth URL is incorrect!');
      console.error('❌ Expected: https://api.instagram.com/oauth/authorize');
      console.error('❌ Actual:', authUrl.split('?')[0]);
      throw new Error('Invalid OAuth URL generated. Check configuration.');
    }

    // 認可URLにリダイレクト
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      new URL('/connect?error=Failed+to+start+OAuth+flow', process.env.IG_REDIRECT_URI || 'http://localhost:3000')
    );
  }
}
