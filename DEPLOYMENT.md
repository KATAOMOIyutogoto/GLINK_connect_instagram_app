# 📦 Vercel デプロイガイド

このガイドでは、アプリケーションを Vercel にデプロイする手順を説明します。

## 前提条件

- Vercel アカウント
- GitHub アカウント（推奨）
- Meta Developer アプリが作成済み

## 方法1: GitHub 連携デプロイ（推奨）

### ステップ 1: GitHub リポジトリを作成

```powershell
cd c:\Users\team4\Desktop\development\GLINK_v2

# Gitリポジトリを初期化
git init

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Instagram OAuth app"

# GitHubに新しいリポジトリを作成（GitHub CLIを使用する場合）
gh repo create glink-instagram-oauth --private --source=. --push

# または、GitHub Webからリポジトリを作成して手動でpush
# git remote add origin https://github.com/YOUR_USERNAME/glink-instagram-oauth.git
# git branch -M main
# git push -u origin main
```

### ステップ 2: Vercel でインポート

1. [Vercel Dashboard](https://vercel.com/new) にアクセス
2. 「Import Git Repository」をクリック
3. GitHub アカウントを接続（まだの場合）
4. `glink-instagram-oauth` リポジトリを選択
5. 「Import」をクリック

### ステップ 3: 環境変数を設定

「Environment Variables」セクションで以下を追加:

| Name | Value | Environment |
|------|-------|-------------|
| `IG_APP_ID` | `あなたのInstagram App ID` | Production, Preview, Development |
| `IG_APP_SECRET` | `あなたのInstagram App Secret` | Production, Preview, Development |
| `IG_REDIRECT_URI` | `https://your-app.vercel.app/api/instagram/callback` | Production |
| `IG_REDIRECT_URI` | `https://your-app-*.vercel.app/api/instagram/callback` | Preview |
| `IG_REDIRECT_URI` | `http://localhost:3000/api/instagram/callback` | Development |
| `IG_SCOPES` | `instagram_basic,pages_read_engagement` | All |
| `ENCRYPTION_KEY_BASE64` | `[生成したキー]` | All |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `[Service Role Key]` | All |

⚠️ **重要**: `IG_REDIRECT_URI` は環境ごとに異なる値を設定してください。

### ステップ 4: Supabase データベースの作成

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力して作成
4. 「SQL Editor」で `supabase/schema.sql` を実行
5. 「Settings」→「API」から以下をコピー:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Vercel の環境変数に追加（ステップ3参照）

詳細は [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) を参照してください。

### ステップ 5: デプロイ

「Deploy」ボタンをクリックしてデプロイを開始します。

### ステップ 6: Meta Developer Portal を更新

1. [Meta for Developers](https://developers.facebook.com/) でアプリを開く
2. 「Instagram Basic Display」→「Basic Display」
3. 「Valid OAuth Redirect URIs」に以下を追加:
   ```
   https://your-app.vercel.app/api/instagram/callback
   ```
4. 「変更を保存」

### ステップ 7: 動作確認

1. `https://your-app.vercel.app` にアクセス
2. 「Instagram を接続」をテスト
3. OAuth フローが正常に完了することを確認

## 方法2: Vercel CLI デプロイ

### ステップ 1: Vercel CLI をインストール

```powershell
npm install -g vercel
```

### ステップ 2: ログイン

```powershell
vercel login
```

### ステップ 3: プロジェクトをリンク

```powershell
cd c:\Users\team4\Desktop\development\GLINK_v2
vercel
```

対話形式で以下を選択:
- Set up and deploy: `Y`
- Which scope: `あなたのアカウント`
- Link to existing project: `N`
- Project name: `glink-instagram-oauth`
- Directory: `./`
- Override settings: `N`

### ステップ 4: 環境変数を設定

```powershell
# Production環境の環境変数を設定
vercel env add IG_APP_ID production
vercel env add IG_APP_SECRET production
vercel env add IG_REDIRECT_URI production
vercel env add IG_SCOPES production
vercel env add ENCRYPTION_KEY_BASE64 production
```

各コマンド実行後、値を入力します。

### ステップ 5: 本番デプロイ

```powershell
vercel --prod
```

### ステップ 6: KV を接続

1. Vercel Dashboard でプロジェクトを開く
2. 上記「方法1」のステップ4と同じ手順で KV を接続

## デプロイ後の確認事項

### ✅ チェックリスト

- [ ] アプリが正常にアクセスできる
- [ ] Meta Developer Portal の Redirect URI が正しく設定されている
- [ ] 環境変数が全て設定されている
- [ ] Vercel KV が接続されている
- [ ] OAuth フローが動作する
- [ ] トークンが暗号化されてKVに保存される
- [ ] 接続済みアカウント一覧が表示される

### 🔍 トラブルシューティング

#### デプロイは成功したが、OAuth エラーが発生

**原因**: Meta Developer Portal の Redirect URI が不一致

**解決策**:
1. Vercel でデプロイされたドメインを確認（例: `glink-instagram-oauth.vercel.app`）
2. Meta Developer Portal で正確に `https://glink-instagram-oauth.vercel.app/api/instagram/callback` を追加
3. プロトコル（`https`）、ドメイン、パスが完全一致していることを確認

#### KV 接続エラー

**原因**: 環境変数が設定されていない

**解決策**:
1. Vercel Dashboard → Storage → KV データベースを開く
2. 「Connect to Project」でプロジェクトを選択
3. 環境変数が追加されたことを確認
4. 再デプロイ: `vercel --prod` または GitHub に push

#### 環境変数が反映されない

**原因**: デプロイ時に環境変数が更新されていない

**解決策**:
```powershell
# 再デプロイ
vercel --prod --force
```

または Vercel Dashboard で「Redeploy」をクリック

## カスタムドメインの設定（オプション）

### ステップ 1: ドメインを追加

1. Vercel Dashboard でプロジェクトを開く
2. 「Settings」→「Domains」
3. カスタムドメインを入力（例: `instagram.your-company.com`）
4. DNS 設定を更新（Vercel が指示を表示）

### ステップ 2: 環境変数を更新

```powershell
vercel env rm IG_REDIRECT_URI production
vercel env add IG_REDIRECT_URI production
# 値: https://instagram.your-company.com/api/instagram/callback
```

### ステップ 3: Meta Developer Portal を更新

「Valid OAuth Redirect URIs」に以下を追加:
```
https://instagram.your-company.com/api/instagram/callback
```

### ステップ 4: 再デプロイ

```powershell
vercel --prod
```

## 自動トークンリフレッシュの設定（推奨）

Instagram の長期トークンは60日で期限切れになるため、自動更新を設定します。

### Vercel Cron Jobs を使用

1. `vercel.json` に以下を追加:

```json
{
  "crons": [
    {
      "path": "/api/instagram/refresh-all",
      "schedule": "0 0 * * *"
    }
  ]
}
```

2. `/api/instagram/refresh-all` エンドポイントを作成（今後の拡張）

3. Git に push してデプロイ

## モニタリングとログ

### Vercel のログを確認

```powershell
# リアルタイムログ
vercel logs --follow

# 最新のログ
vercel logs
```

### Vercel Dashboard でログを確認

1. プロジェクトを開く
2. 「Deployments」タブ
3. デプロイメントをクリック
4. 「Functions」タブでログを表示

## セキュリティのベストプラクティス

- ✅ 環境変数を絶対に公開しない
- ✅ `ENCRYPTION_KEY_BASE64` を定期的にローテーション
- ✅ Vercel のアクセスログを定期的に確認
- ✅ 不要になったトークンは削除
- ✅ IP制限（必要に応じて Vercel の Firewall 機能を使用）

## 次のステップ

- トークン自動更新の実装
- 管理者認証の追加
- アラート通知の設定（Slack, Email）
- 監視ダッシュボードの構築

---

**最終更新**: 2026-01-19
