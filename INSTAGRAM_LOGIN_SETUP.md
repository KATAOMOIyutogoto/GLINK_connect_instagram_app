# Instagram API with Instagram Login セットアップガイド

## ⚠️ 重要: Facebook認証に飛ぶ場合の対処法

もし「Instagram で認証」ボタンをクリックしてFacebook認証画面に飛ぶ場合は、**Meta Developer Portalの設定が正しくない可能性があります**。

---

## 🔍 確認事項

### 1. アプリタイプの確認

1. [Meta for Developers](https://developers.facebook.com/apps/) にアクセス
2. アプリを選択
3. 「設定」→「基本設定」を開く
4. **アプリタイプ**を確認：
   - ✅ **「Business」** である必要があります
   - ❌ 「Consumer」では使用できません

### 2. 正しい製品の追加

**重要**: 「Instagram Graph API」や「Facebook Login」ではなく、**「Instagram API with Instagram Login」**を追加する必要があります。

#### 手順:

1. アプリダッシュボードで「製品を追加」をクリック
2. **「Instagram API with Instagram Login」**を検索して追加
   - ⚠️ 「Instagram Graph API」ではない
   - ⚠️ 「Facebook Login」ではない
   - ✅ **「Instagram API with Instagram Login」**を選択

3. 製品を追加後、「Instagram API with Instagram Login」の設定を開く

### 3. OAuth Redirect URIs の設定

「Instagram API with Instagram Login」の設定で、以下を追加：

```
http://localhost:3000/api/instagram/callback
https://glink-instagram-oauth-2tusvv6jo-commongiftedtokyo.vercel.app/api/instagram/callback
```

**注意**: 
- 「Facebook Login」の設定ではなく、「Instagram API with Instagram Login」の設定で行う
- 両方の設定がある場合は、正しい方を使用

### 4. スコープの確認

「Instagram API with Instagram Login」の設定で、以下のスコープが有効になっているか確認：

- ✅ `instagram_business_basic`（必須）

環境変数 `IG_SCOPES` も確認：
```bash
IG_SCOPES=instagram_business_basic
```

---

## 🔧 トラブルシューティング

### 問題1: まだFacebook認証に飛ぶ

**原因**: Meta Developer Portalで「Instagram API with Instagram Login」が正しく設定されていない

**解決策**:
1. アプリダッシュボードで「Instagram API with Instagram Login」が追加されているか確認
2. 「Instagram Graph API」や「Facebook Login」を削除（必要に応じて）
3. 「Instagram API with Instagram Login」の設定で、OAuth Redirect URIsを正しく設定
4. アプリを再保存

### 問題2: 「Invalid platform app」エラー

**原因**: アプリタイプが「Consumer」になっている、または正しい製品が追加されていない

**解決策**:
1. アプリタイプを「Business」に変更（新しいアプリを作成する必要がある場合も）
2. 「Instagram API with Instagram Login」を追加

### 問題3: OAuth URLが正しく生成されていない

**確認方法**:
1. ブラウザの開発者ツール（F12）を開く
2. 「Network」タブを開く
3. 「Instagram で認証」ボタンをクリック
4. リダイレクト先のURLを確認

**正しいURLの形式**:
```
https://api.instagram.com/oauth/authorize?client_id=...&redirect_uri=...&scope=instagram_business_basic&response_type=code&state=...
```

**間違ったURLの形式**（Facebook認証）:
```
https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=...&scope=...
```

---

## 📋 チェックリスト

セットアップが完了したら、以下を確認：

- [ ] アプリタイプが「Business」である
- [ ] 「Instagram API with Instagram Login」が追加されている
- [ ] OAuth Redirect URIsが正しく設定されている
- [ ] スコープ `instagram_business_basic` が有効になっている
- [ ] 環境変数 `IG_SCOPES=instagram_business_basic` が設定されている
- [ ] OAuth URLが `https://api.instagram.com/oauth/authorize` で始まっている

---

## 🔗 参考リンク

- [Instagram API with Instagram Login - 公式ドキュメント](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/)
- [Get Started Guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started/)
- [Migration Guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/migration-guide/)

---

## 💡 補足

「Instagram API with Instagram Login」は2024年7月にリリースされた新しい方式です。以前の「Instagram Graph API with Facebook Login」とは異なる製品です。

正しく設定されていれば、顧客はInstagramアカウントだけでログインでき、Facebook認証画面には飛びません。
