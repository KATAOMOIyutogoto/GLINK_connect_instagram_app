# Meta Developer Portal 設定手順（この画面から）

## 📍 現在の画面について

この画面は「InstagramビジネスログインによるAPI設定」ページです。ここから設定を行います。

---

## ✅ 必須設定項目

### 1. コールバックURLの設定（最重要）

**セクション2「Webhooksを設定する」** の **「コールバックURL」** フィールドに以下を入力：

#### 本番環境（Vercel）:
```
https://glink-instagram-oauth-2tusvv6jo-commongiftedtokyo.vercel.app/api/instagram/callback
```

#### ローカル開発環境（テスト用）:
```
http://localhost:3000/api/instagram/callback
```

**注意**: 
- 両方のURLを設定することも可能です（複数行で入力）
- 末尾のスラッシュに注意（`/callback` と `/callback/` は別物）
- 入力後、**「確認して保存」** ボタンをクリック

#### 「トークンを認証」フィールドについて

**「トークンを認証」** フィールドは、**Webhookの検証トークン（Verify Token）**です。

**このアプリケーションの目的（OAuth認証でトークンを取得）では、Webhookは必須ではありません。**

**設定方法（2つの選択肢）:**

1. **Webhookを使用しない場合（推奨）**:
   - フィールドを**空のまま**にする
   - または、任意の文字列を入力（例: `webhook_verify_token_123`）
   - このアプリケーションではWebhookエンドポイントを実装していないため、空のままで問題ありません

2. **Webhookを使用する場合（将来の拡張用）**:
   - 任意の文字列を設定（例: `my_secure_verify_token_2024`）
   - このトークンは、MetaがWebhook URLを検証する際に使用されます
   - アプリケーション側でWebhookエンドポイントを実装し、このトークンを検証する必要があります

**推奨**: 現時点では、**空のまま**または**任意の文字列**を入力して保存してください。OAuth認証フロー自体には影響しません。

---

### 2. セクション3「Instagramビジネスログインを設定する」

**「設定する」** ボタンをクリックして、以下を設定：

#### OAuth Redirect URIs（リダイレクトURI）:

以下のURIを追加：

```
http://localhost:3000/api/instagram/callback
https://glink-instagram-oauth-2tusvv6jo-commongiftedtokyo.vercel.app/api/instagram/callback
```

**重要**: 
- この設定は「Instagramビジネスログイン」の設定で行います
- 「Facebook Login」の設定ではありません

---

### 3. セクション1「アクセストークンを生成する」

開発・テスト用にInstagramアカウントを追加：

1. **「アカウントを追加」** ボタンをクリック
2. テスト用のInstagramビジネス/クリエイターアカウントを追加
3. 「ロール」タブで「Instagram Tester」ロールを割り当て

**注意**: 
- 本番環境では、顧客が自分でOAuth認証を行うため、このステップは必須ではありません
- 開発・テスト時のみ必要です

---

## ⚠️ 重要な注意事項

### セクション1の警告について

「Instagram APIへようこそ」セクションに以下の警告があります：

> 「ハッシュタグやインサイトをトラッキングできるようにしたい場合は、API setup with Facebook login.に切り替えてください。」

**この警告について**:
- 投稿・ストーリーの**ダウンロード**には、通常「Instagram API with Instagram Login」で対応可能です
- ハッシュタグのトラッキングや詳細なインサイト分析が必要な場合のみ、Facebook Loginが必要になる可能性があります
- まずは現在の設定で動作確認を行い、必要に応じて切り替えを検討してください

---

## 📋 設定チェックリスト

設定が完了したら、以下を確認：

- [ ] セクション2の「コールバックURL」に正しいURLが入力されている
- [ ] セクション3の「Instagramビジネスログイン」でOAuth Redirect URIsが設定されている
- [ ] アプリタイプが「Business」になっている（「設定」→「基本設定」で確認）
- [ ] 環境変数 `IG_REDIRECT_URI` がコールバックURLと一致している

---

## 🔄 設定後の確認

1. 設定を保存後、アプリで「Instagram で認証」ボタンをクリック
2. リダイレクト先を確認：
   - ✅ Instagramのログイン画面 → 正常
   - ❌ Facebookのログイン画面 → 設定を再確認

---

## 🆘 トラブルシューティング

### まだFacebook認証に飛ぶ場合

1. **コールバックURLが正しく設定されているか確認**
   - セクション2の「コールバックURL」フィールドを確認
   - セクション3の「OAuth Redirect URIs」も確認

2. **アプリタイプを確認**
   - 「設定」→「基本設定」→「アプリの種類」が「ビジネス」になっているか

3. **製品の確認**
   - 「Instagram API with Instagram Login」が追加されているか
   - 「Instagram Graph API」や「Facebook Login」が優先されていないか

---

## 📞 次のステップ

設定完了後、以下を実行：

1. アプリで接続を試す
2. リダイレクト先を確認
3. 問題があれば、Vercelのログで生成されたURLを確認

設定が完了したら、お知らせください！
