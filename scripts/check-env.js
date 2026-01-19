#!/usr/bin/env node

/**
 * 環境変数チェックスクリプト
 * 使い方: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 環境変数をチェック中...\n');

// .env.local ファイルの存在確認
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local ファイルが見つかりません');
  console.log('💡 env.example をコピーして .env.local を作成してください\n');
  process.exit(1);
}

// .env.local を読み込む
require('dotenv').config({ path: envPath });

const requiredVars = [
  'IG_APP_ID',
  'IG_APP_SECRET',
  'IG_REDIRECT_URI',
  'IG_SCOPES',
  'ENCRYPTION_KEY_BASE64',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

let allOk = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`❌ ${varName} が設定されていません`);
    allOk = false;
  } else {
    // 値の一部だけ表示（セキュリティのため）
    const displayValue = value.length > 20 
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : value.substring(0, 5) + '...';
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('');

if (!allOk) {
  console.log('❌ 一部の環境変数が未設定です');
  console.log('💡 .env.local ファイルを確認してください\n');
  process.exit(1);
}

// ENCRYPTION_KEY_BASE64 のバイト数チェック
try {
  const keyBase64 = process.env.ENCRYPTION_KEY_BASE64;
  const keyBuffer = Buffer.from(keyBase64, 'base64');
  
  if (keyBuffer.length !== 32) {
    console.log(`❌ ENCRYPTION_KEY_BASE64 は32バイトである必要があります（現在: ${keyBuffer.length}バイト）`);
    console.log('💡 node scripts/generate-encryption-key.js で新しいキーを生成してください\n');
    process.exit(1);
  } else {
    console.log('✅ ENCRYPTION_KEY_BASE64 は正しいサイズです (32バイト)');
  }
} catch (error) {
  console.log('❌ ENCRYPTION_KEY_BASE64 の形式が不正です');
  console.log('💡 node scripts/generate-encryption-key.js で新しいキーを生成してください\n');
  process.exit(1);
}

console.log('\n✅ 全ての環境変数が正しく設定されています！');
console.log('🚀 npm run dev でアプリを起動できます\n');
