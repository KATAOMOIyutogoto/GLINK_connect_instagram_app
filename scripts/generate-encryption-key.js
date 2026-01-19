#!/usr/bin/env node

/**
 * 暗号化キー生成スクリプト
 * 使い方: node scripts/generate-encryption-key.js
 */

const crypto = require('crypto');

console.log('🔐 暗号化キー生成中...\n');

const key = crypto.randomBytes(32).toString('base64');

console.log('✅ 32バイトの暗号化キーが生成されました:\n');
console.log(key);
console.log('\n📋 この値を .env.local の ENCRYPTION_KEY_BASE64 に設定してください\n');
console.log('例:');
console.log(`ENCRYPTION_KEY_BASE64=${key}`);
console.log('');
