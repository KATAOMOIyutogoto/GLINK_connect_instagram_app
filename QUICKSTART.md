# 🚀 クイックスタートガイド

このガイドでは、5分でローカル環境でアプリを起動する手順を説明します。

## 前提条件

- Node.js 18以上がインストールされていること
- Meta Developer アカウント
- Vercel アカウント（KV データベース用）

## ステップ 1: Meta Developer アプリを作成

1. [Meta for Developers](https://developers.facebook.com/) にログイン
2. 「マイアプリ」→「アプリを作成」
3. アプリタイプを選択（Consumer または Business）
4. アプリ名を入力して作成
5. 左メニューから「Instagram Basic Display」を追加（または「Instagram Graph API」）
6. 設定ページで以下をメモ:
   - **Instagram App ID**: `123456789012345`
   - **Instagram App Secret**: `abcd1234...`
7. 「Valid OAuth Redirect URIs」に以下を追加:
   ```
   http://localhost:3000/api/instagram/callback
   ```
8. 「変更を保存」

## ステップ 2: Vercel KV を作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「Storage」タブ → 「Create Database」
3. 「KV」を選択
4. データベース名を入力（例: `glink-instagram-kv`）
5. リージョンを選択（推奨: `NRT1 (Tokyo)` または近い場所）
6. 「Create」をクリック
7. 「.env.local」タブを開き、以下をコピー:
   ```
   KV_URL=...
   KV_REST_API_URL=...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```

## ステップ 3: プロジェクトをセットアップ

```powershell
# プロジェクトディレクトリに移動
cd c:\Users\team4\Desktop\development\GLINK_v2

# 依存関係をインストール
npm install

# 暗号化キーを生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# 出力例: "rT8fKp3mL9xQ2wN5vJ7hR6uY4sA1bC8dE0fG9hI3jK4="
```

## ステップ 4: 環境変数を設定

`.env.local` ファイルを作成:

```powershell
Copy-Item env.example .env.local
```

`.env.local` を編集（メモ帳またはVS Code）:

```env
# ステップ1でメモした値
IG_APP_ID=123456789012345
IG_APP_SECRET=abcd1234efgh5678ijkl9012mnop3456
IG_REDIRECT_URI=http://localhost:3000/api/instagram/callback
IG_SCOPES=instagram_basic,pages_read_engagement

# ステップ3で生成した値
ENCRYPTION_KEY_BASE64=rT8fKp3mL9xQ2wN5vJ7hR6uY4sA1bC8dE0fG9hI3jK4=

# ステップ2でコピーした値
KV_URL=rediss://default:***@clever-turtle-12345.upstash.io:6379
KV_REST_API_URL=https://clever-turtle-12345.upstash.io
KV_REST_API_TOKEN=AY***********************************************wNw==
KV_REST_API_READ_ONLY_TOKEN=Ar***********************************************1Q==
```

## ステップ 5: アプリを起動

```powershell
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ステップ 6: Instagram を接続

1. 「Instagram を接続」ボタンをクリック
2. Instagram アカウントでログイン
3. アクセス許可を確認して「許可」
4. コールバック後、自動的に接続済みページにリダイレクトされます

## 🎉 完了！

接続済みページでアカウント情報が表示されていれば成功です。

## トラブルシューティング

### 「Redirect URI mismatch」エラー

→ Meta Developer Portal の「Valid OAuth Redirect URIs」が正確に `http://localhost:3000/api/instagram/callback` と一致しているか確認

### 「Failed to connect to KV」エラー

→ `.env.local` の KV 環境変数が正しくコピーされているか確認

### 「ENCRYPTION_KEY_BASE64 must be 32 bytes」エラー

→ 暗号化キーを再生成して `.env.local` に貼り付け

### ポート3000が使用中

```powershell
# 別のポートで起動
npm run dev -- -p 3001
```

Meta Developer Portal の Redirect URI も `http://localhost:3001/api/instagram/callback` に更新してください。

## 次のステップ

- [README.md](./README.md) で詳細な機能を確認
- Vercel にデプロイして本番環境で使用
- Bot からトークンを使用してメディアを取得
