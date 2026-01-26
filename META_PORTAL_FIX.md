# 「Invalid platform app」エラー修正ガイド

## 🔴 エラーの原因

「Invalid platform app」エラーは、Meta Developer Portalの設定が正しくない場合に発生します。

## ✅ 修正手順

### 1. Meta Developer Portalでアプリの種類を確認

1. [Meta for Developers](https://developers.facebook.com/) にログイン
2. アプリを選択（App ID: `757544923541140`）
3. **「設定」→「基本設定」** を開く
4. **「アプリの種類」** が **「ビジネス」** になっているか確認
   - ❌ 「なし」や「個人」になっている場合は、**「ビジネス」に変更**

### 2. 「Instagram API with Instagram Login」プロダクトを追加

1. 左メニューから **「プロダクト」** をクリック
2. **「Instagram API with Instagram Login」** を探す
3. まだ追加されていない場合は、**「追加」** をクリック

### 3. OAuth Redirect URIを本番環境のURLに設定

OAuth Redirect URIの設定場所は、Meta Developer PortalのUIによって異なる場合があります。以下のいずれかの場所を確認してください：

#### 方法A: 基本設定から
1. **「設定」→「基本設定」** を開く
2. **「有効なOAuthリダイレクトURI」** または **「Valid OAuth Redirect URIs」** のセクションを探す
3. 以下を追加：
   ```
   https://glink-instagram-oauth.vercel.app/api/instagram/callback
   ```
   - 注意: 末尾にスラッシュ（`/`）は不要
   - 完全なURLを正確に入力
4. **「変更を保存」** をクリック

#### 方法B: プロダクト設定から
1. **「プロダクト」→「Instagram API with Instagram Login」→「設定」** を開く
2. **「Instagramビジネスログインを設定する」** または **「OAuth設定」** セクションを探す
3. 上記のURLを追加

#### 方法C: 見つからない場合
「Instagram API with Instagram Login」では、OAuth Redirect URIの設定が不要な場合があります。その場合は、**Instagram Testerの追加（次のステップ）が最も重要**です。

### 4. Instagram Testerとして追加（最重要！）

**⚠️ これが最も重要なステップです！「Invalid platform app」エラーの主な原因は、Instagram Testerとして追加されていないことです。**

1. **「ロール」→「ロール」** を開く
2. **「Instagramテスター」** セクションを探す
3. **「Instagramテスターを追加」** をクリック
4. テストするInstagramアカウントのユーザー名を入力
5. **「追加」** をクリック
6. テストするInstagramアカウントで、Instagramアプリを開く
7. **「設定」→「アプリとウェブサイト」** を開く
8. 招待を受け入れる

### 5. Vercelの環境変数を確認

Vercel Dashboardで以下が設定されているか確認：

```
IG_APP_ID=757544923541140
IG_APP_SECRET=4999f85e6e5d381e50fdb34485b6fc34
IG_REDIRECT_URI=https://glink-instagram-oauth.vercel.app/api/instagram/callback
IG_SCOPES=instagram_business_basic
```

**重要**: `IG_REDIRECT_URI` が本番環境のURLになっているか確認してください。

---

## 🔍 確認チェックリスト

- [ ] アプリの種類が「ビジネス」になっている
- [ ] 「Instagram API with Instagram Login」プロダクトが追加されている
- [ ] OAuth Redirect URIに本番環境のURLが設定されている
- [ ] テストするInstagramアカウントが「Instagramテスター」として追加されている
- [ ] Vercelの環境変数 `IG_REDIRECT_URI` が本番環境のURLになっている

---

## 📝 注意事項

1. **アプリの種類を変更した場合**: 変更が反映されるまで数分かかる場合があります
2. **OAuth Redirect URI**: 完全一致が必要です。末尾のスラッシュやパスの違いでエラーになります
3. **Instagramテスター**: 必ず「Instagramテスター」として追加してください。「一般テスター」では動作しません

---

## 🆘 まだエラーが発生する場合

1. **ブラウザのキャッシュをクリア**
2. **シークレット/プライベートモードで試す**
3. **Instagramアカウントの「設定」→「アプリとウェブサイト」で、以前の認証を削除**
4. **数分待ってから再度試す**（設定の反映に時間がかかる場合があります）
