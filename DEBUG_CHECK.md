# デバッグチェックリスト

## 🔍 プロジェクト側の確認結果

### ✅ コード側は正しく設定されています

1. **OAuthエンドポイント**: `https://api.instagram.com/oauth/authorize` ✅
2. **スコープ**: `instagram_business_basic` ✅
3. **Graph APIエンドポイント**: `https://graph.instagram.com` ✅

### ⚠️ 修正した点

1. **`next.config.js`**: デフォルトスコープを `instagram_business_basic` に変更
2. **デバッグログ**: より詳細なログを追加

---

## 🔍 実際に生成されるURLを確認する方法

### 方法1: ローカル開発環境

1. ターミナルで `npm run dev` を実行
2. ブラウザで `http://localhost:3000/connect` にアクセス
3. 「Instagram で認証」ボタンをクリック
4. **ターミナルのログを確認**:
   ```
   🔍 Environment Variables Check:
     IG_APP_ID: ✅ Set
     IG_APP_SECRET: ✅ Set
     IG_REDIRECT_URI: http://localhost:3000/api/instagram/callback
     IG_SCOPES: instagram_business_basic
   🔧 Instagram Config:
     appId: 757544923541140
     redirectUri: http://localhost:3000/api/instagram/callback
     scopes: ['instagram_business_basic']
     oauthBase: https://api.instagram.com/oauth
   🔗 Generated OAuth URL: https://api.instagram.com/oauth/authorize?...
   📋 URL starts with: https://api.instagram.com/oauth/authorize
   ```

### 方法2: Vercelのログ

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを開く
3. 「Deployments」→ 最新のデプロイメントを開く
4. 「Functions」タブでログを確認
5. `/api/instagram/login` のログを探す

---

## ❌ もしFacebook URLが生成されている場合

ログに以下が表示される場合：

```
❌ CRITICAL ERROR: OAuth URL is incorrect!
❌ Expected: https://api.instagram.com/oauth/authorize
❌ Actual: https://www.facebook.com/...
```

**これはコード側の問題ではなく、Meta Developer Portalの設定が原因です。**

---

## 🔧 確認すべきポイント

### 1. 環境変数が正しく読み込まれているか

ログで以下を確認：
- `IG_APP_ID: ✅ Set`
- `IG_SCOPES: instagram_business_basic`

もし `❌ Missing` と表示される場合、環境変数が設定されていません。

### 2. 生成されるURLが正しいか

ログで以下を確認：
- `📋 URL starts with: https://api.instagram.com/oauth/authorize`

もし `https://www.facebook.com` で始まる場合、Meta Developer Portalの設定を確認してください。

### 3. スコープが正しいか

ログで以下を確認：
- `scopes: ['instagram_business_basic']`

もし `['instagram_basic', 'pages_read_engagement']` などが表示される場合、環境変数 `IG_SCOPES` を確認してください。

---

## 🎯 次のステップ

1. **ローカルで動作確認**
   - `npm run dev` を実行
   - ログを確認
   - 生成されるURLを確認

2. **Vercelの環境変数を確認**
   - `IG_SCOPES=instagram_business_basic` が設定されているか
   - すべての環境変数が設定されているか

3. **Meta Developer Portalの設定を再確認**
   - セクション3のOAuth Redirect URIsが正しく保存されているか
   - アプリタイプが「ビジネス」になっているか

---

## 📞 ログの共有

ログを確認したら、以下を共有してください：

1. 生成されるURL（`🔗 Generated OAuth URL:` の行）
2. 環境変数の状態（`🔍 Environment Variables Check:` のセクション）
3. エラーメッセージ（もしあれば）

これらの情報があれば、問題の原因を特定できます。
