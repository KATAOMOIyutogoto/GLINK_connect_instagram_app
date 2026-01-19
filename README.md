# Instagram OAuth 連携アプリ (GLINK_v2)

Next.js (App Router) + TypeScript で構築された、Instagram公式API連携のWebアプリケーションです。  
複数のInstagramプロアカウントを安全に接続し、後続のBotがアクセストークンを使用できる状態にします。

> **📢 重要**: このプロジェクトは**Supabase (Postgres)** を使用しています。  
> Vercel KVからの移行については [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) を参照してください。

## 🎯 主な機能

- ✅ Instagram OAuth 2.0 認証フロー
- ✅ アクセストークンの暗号化保存 (AES-256-GCM)
- ✅ CSRF対策 (state パラメータ検証)
- ✅ 長期トークンへの自動交換
- ✅ 接続済みアカウント一覧表示
- ✅ トークンリフレッシュ機能
- ✅ **Supabase (Postgres)** によるデータ保存
- ✅ 将来のBot連携を見据えた拡張可能なDB設計
- ✅ Vercelへワンクリックデプロイ可能

## 📁 プロジェクト構造

```
GLINK_v2/
├── app/
│   ├── api/
│   │   └── instagram/
│   │       ├── login/route.ts       # OAuth開始
│   │       ├── callback/route.ts    # OAuth コールバック
│   │       ├── status/route.ts      # アカウント一覧API
│   │       └── refresh/route.ts     # トークン更新API
│   ├── connect/
│   │   └── page.tsx                 # 接続画面
│   ├── connected/
│   │   └── page.tsx                 # 接続済みアカウント一覧
│   ├── layout.tsx                   # ルートレイアウト
│   ├── page.tsx                     # トップページ
│   └── globals.css                  # グローバルスタイル
├── lib/
│   ├── crypto.ts                    # 暗号化/復号化ユーティリティ
│   ├── supabaseAdmin.ts             # Supabase管理クライアント
│   ├── repo/
│   │   └── instagramRepo.ts         # Instagram データリポジトリ
│   └── instagram.ts                 # Instagram API クライアント
├── supabase/
│   └── schema.sql                   # データベーススキーマ
├── types/
│   └── supabase.ts                  # Supabase型定義
├── .env.example                     # 環境変数のテンプレート
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🚀 セットアップ

### 1. Meta Developer アプリの作成

1. [Meta for Developers](https://developers.facebook.com/) にアクセス
2. 新しいアプリを作成（タイプ: "Consumer" または "Business"）
3. **Instagram Basic Display API** または **Instagram Graph API** を追加
4. **OAuth設定**を構成:
   - **Valid OAuth Redirect URIs** に以下を追加:
     - ローカル: `http://localhost:3000/api/instagram/callback`
     - 本番: `https://your-domain.vercel.app/api/instagram/callback`
5. **App ID** と **App Secret** をメモ

### 2. プロジェクトのクローン

```bash
cd c:\Users\team4\Desktop\development\GLINK_v2
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 暗号化キーの生成

トークン暗号化用の32バイトキーを生成:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

出力された文字列をコピーしてください。

### 5. 環境変数の設定

`.env.local` ファイルを作成（`.env.example`を参考に）:

```bash
# Instagram App Credentials
IG_APP_ID=your_instagram_app_id
IG_APP_SECRET=your_instagram_app_secret
IG_REDIRECT_URI=http://localhost:3000/api/instagram/callback
IG_SCOPES=instagram_basic,pages_read_engagement

# Encryption Key (手順4で生成したもの)
ENCRYPTION_KEY_BASE64=your_generated_32_byte_key_in_base64

# Supabase (手順6で取得)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 6. Supabase のセットアップ

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力:
   - **Name**: `glink-instagram-oauth` (任意)
   - **Database Password**: 強力なパスワードを設定
   - **Region**: `Northeast Asia (Tokyo)` 推奨
4. プロジェクト作成完了後、「Settings」→「API」を開く
5. 以下をコピー:
   - **URL**: `https://xxxxx.supabase.co`
   - **Service Role Key** (`service_role` キー)
6. 「SQL Editor」でスキーマを作成:
   - `supabase/schema.sql` の内容をコピー＆ペースト
   - 「Run」をクリック

詳細は [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) を参照してください。

### 7. ローカル実行

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 🌐 Vercel へのデプロイ

### 方法1: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### 方法2: GitHub連携

1. GitHub リポジトリにプッシュ
2. [Vercel Dashboard](https://vercel.com/new) で **Import Project**
3. リポジトリを選択
4. 環境変数を設定:
   - `IG_APP_ID`
   - `IG_APP_SECRET`
   - `IG_REDIRECT_URI` (例: `https://your-app.vercel.app/api/instagram/callback`)
   - `IG_SCOPES`
   - `ENCRYPTION_KEY_BASE64`
5. **Deploy** をクリック

### デプロイ後の設定

1. Vercel ダッシュボードで **KV** データベースを作成
2. プロジェクトに KV を接続（環境変数が自動注入されます）
3. Meta Developer Portal で **Valid OAuth Redirect URIs** を更新:
   - `https://your-app.vercel.app/api/instagram/callback` を追加

## 🔐 セキュリティ

### 実装済みのセキュリティ対策

- ✅ **トークン暗号化**: AES-256-GCM で暗号化してKVに保存
- ✅ **CSRF対策**: OAuth state パラメータの検証
- ✅ **HttpOnly Cookie**: state の保存に使用
- ✅ **Secure Cookie**: 本番環境では HTTPS のみ
- ✅ **SameSite Cookie**: CSRF攻撃を防止
- ✅ **ログ保護**: トークン/コードをログ出力しない

### 注意事項

- ⚠️ `ENCRYPTION_KEY_BASE64` は**絶対に公開しない**でください
- ⚠️ `.env.local` をGitにコミットしないでください（`.gitignore`に含まれています）
- ⚠️ 本番環境では必ず HTTPS を使用してください

## 📝 使い方

### ユーザーフロー

1. トップページで「Instagram を接続」をクリック
2. `/connect` ページに移動し、「Instagram で認証」をクリック
3. Instagram (Meta) の OAuth 画面で認証・同意
4. コールバックでトークンが自動的に暗号化されてKVに保存
5. `/connected` ページで接続済みアカウント一覧を確認

### API エンドポイント

#### `GET /api/instagram/login`
OAuth認証フローを開始

#### `GET /api/instagram/callback`
OAuth コールバック（Instagram からのリダイレクト先）

#### `GET /api/instagram/status`
接続済みアカウント一覧を取得

```bash
curl http://localhost:3000/api/instagram/status
```

#### `POST /api/instagram/refresh`
トークンをリフレッシュ

```bash
curl -X POST http://localhost:3000/api/instagram/refresh \
  -H "Content-Type: application/json" \
  -d '{"igUserId": "123456789"}'
```

## 🤖 Bot との連携（今後の拡張）

保存されたトークンを使用して、Botがメディアやストーリーを取得できます:

```typescript
import { getAccount } from '@/lib/store';

// Bot 側の実装例
async function fetchUserMedia(igUserId: string) {
  const account = await getAccount(igUserId);
  if (!account) {
    throw new Error('Account not found');
  }

  const response = await fetch(
    `https://graph.instagram.com/${igUserId}/media?fields=id,caption,media_type,media_url,timestamp&access_token=${account.accessToken}`
  );

  return await response.json();
}
```

## 🔧 トラブルシューティング

### OAuth リダイレクトエラー

**エラー**: "Redirect URI mismatch"

**解決策**:
- Meta Developer Portal の **Valid OAuth Redirect URIs** が正確に一致していることを確認
- 末尾のスラッシュに注意（`/callback` と `/callback/` は別物）
- プロトコル（`http` vs `https`）を確認

### Supabase 接続エラー

**エラー**: "Failed to connect to Supabase"

**解決策**:
- 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているか確認
- `SERVICE_ROLE_KEY` を使用していることを確認（`anon` キーではない）
- Supabaseのスキーマが作成済みか確認（`supabase/schema.sql`）

### 暗号化エラー

**エラー**: "ENCRYPTION_KEY_BASE64 must be 32 bytes"

**解決策**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
で新しいキーを生成して `.env.local` に設定

### トークン期限切れ

Instagram の長期トークンは**60日間**有効です。定期的にリフレッシュが必要です:

```bash
curl -X POST https://your-app.vercel.app/api/instagram/refresh \
  -H "Content-Type: application/json" \
  -d '{"igUserId": "YOUR_IG_USER_ID"}'
```

**推奨**: Vercel Cron Jobs で自動リフレッシュを実装

## 📋 次にやること（TODO）

- [ ] トークン自動リフレッシュ（Vercel Cron Jobs）
- [ ] アカウント削除機能
- [ ] トークン期限アラート
- [ ] Bot 用のメディア取得APIエンドポイント（DBスキーマは作成済み）
- [ ] ストーリー取得APIエンドポイント（DBスキーマは作成済み）
- [ ] ジョブ実行ログの表示
- [ ] エラーログの Sentry 連携
- [ ] 管理者認証（現在は誰でもアクセス可能）
- [ ] Supabase RLSポリシーの追加（認証実装時）

## 🛠 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (Postgres)
- **暗号化**: Web Crypto API (AES-256-GCM)
- **デプロイ**: Vercel
- **API**: Instagram Basic Display API / Instagram Graph API

## 📄 ライセンス

社内利用のため、ライセンスは設定されていません。

## 🙋 サポート

問題が発生した場合は、以下を確認してください:

1. Meta Developer Portal の設定（特に Redirect URI）
2. 環境変数が正しく設定されているか
3. KV データベースが接続されているか
4. Vercel のデプロイログ

---

**作成日**: 2026-01-19  
**バージョン**: 0.1.0  
**目的**: 社内運用 - Instagram プロアカウント連携
