# Vercel URL確認ガイド

## 🔴 ミスの原因

以前、間違ったVercel URL（`glink-instagram-oauth-mrzabjjmo-commongiftedtokyo.vercel.app`）を使用していました。

### なぜこのミスが発生したか

1. **Vercel CLIの出力をそのまま使用**
   - `vercel --prod` コマンドを実行すると、デプロイメント固有のURLが表示される
   - 例: `https://glink-instagram-oauth-{hash}-{team}.vercel.app`
   - これは**一時的なデプロイメントURL**であり、プロダクションURLではない

2. **Vercelには2種類のURLがある**
   - **プロダクションURL**: `https://{project-name}.vercel.app`（永続的、推奨）
   - **デプロイメント固有URL**: `https://{project-name}-{hash}-{team}.vercel.app`（一時的）

3. **確認方法が不十分だった**
   - CLIの出力をそのまま信頼してしまった
   - Vercel Dashboardで実際のURLを確認しなかった

---

## ✅ 正しい確認方法

### 方法1: Vercel Dashboardで確認（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. **「Settings」→「Domains」** を開く
4. **「Production」** のURLを確認
   - 例: `https://glink-instagram-oauth.vercel.app`

### 方法2: プロジェクト設定から確認

1. Vercel Dashboardでプロジェクトを開く
2. **「Settings」→「General」** を開く
3. **「Project Name」** を確認
4. プロダクションURLは `https://{project-name}.vercel.app` の形式

### 方法3: 実際にアクセスして確認

1. ブラウザで `https://glink-instagram-oauth.vercel.app` にアクセス
2. 正常に表示されれば、それが正しいプロダクションURL

---

## 📝 環境変数の設定

### ローカル開発環境（`.env.local`）

```env
IG_REDIRECT_URI=http://localhost:3000/api/instagram/callback
```

### 本番環境（Vercel Dashboard）

```env
IG_REDIRECT_URI=https://glink-instagram-oauth.vercel.app/api/instagram/callback
```

**重要**: 
- ローカル開発用と本番環境用で異なるURLを使用
- Vercel Dashboardで環境変数を設定する際は、**プロダクションURL**を使用

---

## 🔍 確認チェックリスト

- [ ] Vercel DashboardでプロダクションURLを確認した
- [ ] 環境変数 `IG_REDIRECT_URI` に正しいプロダクションURLが設定されている
- [ ] Meta Developer PortalのOAuth Redirect URIに正しいURLが設定されている
- [ ] 実際にブラウザでアクセスして動作確認した

---

## 🆘 トラブルシューティング

### URLが分からない場合

1. Vercel Dashboardにアクセス
2. プロジェクトを選択
3. 「Settings」→「Domains」で確認
4. または、プロジェクト名から推測: `https://{project-name}.vercel.app`

### 複数のURLが表示される場合

- **プロダクションURL**（`https://{project-name}.vercel.app`）を使用
- デプロイメント固有URL（`https://{project-name}-{hash}-{team}.vercel.app`）は使用しない

---

## 💡 今後のベストプラクティス

1. **常にVercel Dashboardで確認**
   - CLIの出力をそのまま使用しない
   - Dashboardで実際のURLを確認する

2. **環境変数の管理**
   - ローカル開発用と本番環境用を明確に分ける
   - `.env.local` はローカル開発用のみ

3. **ドキュメントの更新**
   - 正しいURLをドキュメントに記載
   - チーム内で共有する
