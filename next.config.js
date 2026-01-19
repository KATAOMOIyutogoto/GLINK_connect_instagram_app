/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // ビルド時のデフォルト環境変数（実際の値は .env.local で上書き）
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-role-key',
    IG_APP_ID: process.env.IG_APP_ID || 'dummy-app-id',
    IG_APP_SECRET: process.env.IG_APP_SECRET || 'dummy-app-secret',
    IG_REDIRECT_URI: process.env.IG_REDIRECT_URI || 'http://localhost:3000/api/instagram/callback',
    IG_SCOPES: process.env.IG_SCOPES || 'instagram_basic',
    ENCRYPTION_KEY_BASE64: process.env.ENCRYPTION_KEY_BASE64 || 'dGhpc2lzYWR1bW15a2V5Zm9yYnVpbGR0aW1lMzJieXRlcw==',
  },
}

module.exports = nextConfig
