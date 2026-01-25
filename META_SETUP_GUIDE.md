# Meta Developer Portal 設定ガイド

## 🔧 Instagram Graph API の設定手順

### 1. Facebook Login 製品を追加

1. [Meta for Developers](https://developers.facebook.com/apps/) にアクセス
2. あなたのアプリを選択
3. 左メニューから **「製品を追加」** をクリック
4. **「Facebook Login」** を探して **「設定」** をクリック

### 2. Facebook Login の設定

1. **「設定」** タブを開く
2. **「有効なOAuthリダイレクトURI」** に以下を追加：

   **ローカル開発環境:**
   ```
   http://localhost:3000/api/instagram/callback
   ```

   **本番環境:**
   ```
   https://glink-instagram-oauth-2zj9d8ee1-commongiftedtokyo.vercel.app/api/instagram/callback
   ```

3. **「変更を保存」** をクリック

### 3. 必要な権限（スコープ）の設定

1. 左メニューから **「Instagram Graph API」** を探して **「設定」** をクリック
   - もし表示されない場合は、**「製品を追加」** から **「Instagram Graph API」** を追加

2. 以下の権限が必要です：
   - `instagram_basic` - 基本的なプロフィール情報
   - `pages_show_list` - Facebookページ一覧の取得
   - `pages_read_engagement` - エンゲージメントデータの読み取り
   - `instagram_manage_insights` - インサイトの管理（オプション）

### 4. アプリの種類を確認

1. **「設定」→「ベーシック」** を開く
2. **「アプリの種類」** を確認：
   - **「ビジネス」** または **「コンシューマー」** が推奨
   - **「テスト」** の場合は、テストユーザーを追加する必要があります

### 5. Instagram ビジネスアカウントの準備

⚠️ **重要**: Instagram Graph APIを使用するには、以下の条件が必要です：

1. **Instagramアカウントがビジネスアカウントまたはクリエイターアカウントであること**
   - 個人アカウントでは使用できません
   - Instagramアプリで **「設定」→「アカウントタイプとツール」** から変更可能

2. **FacebookページにInstagramアカウントが紐づいていること**
   - Facebookページを作成
   - InstagramアカウントをFacebookページに接続

### 6. テストユーザーの追加（開発モードの場合）

1. 左メニューから **「ロール」→「ロール」** を開く
2. **「テストユーザーを追加」** をクリック
3. テストしたいFacebookアカウントのメールアドレスを入力
4. そのアカウントでログインして、アプリへのアクセスを承認

---

## 🔍 トラブルシューティング

### エラー: "Invalid platform app"

**原因**: Facebook Login製品が追加されていない、または設定が不完全

**解決策**:
1. Facebook Login製品が追加されているか確認
2. Valid OAuth Redirect URIsが正しく設定されているか確認
3. アプリの種類が「ビジネス」または「コンシューマー」になっているか確認

### エラー: "No Instagram Business Account found"

**原因**: FacebookページにInstagramアカウントが紐づいていない

**解決策**:
1. Facebookページを作成
2. Instagramアカウントをビジネスアカウントに変更
3. FacebookページにInstagramアカウントを接続

### エラー: "Redirect URI mismatch"

**原因**: Redirect URIが一致していない

**解決策**:
1. Meta Developer Portalの **「有効なOAuthリダイレクトURI」** を確認
2. 環境変数 `IG_REDIRECT_URI` と完全に一致しているか確認
3. 末尾のスラッシュに注意（`/callback` と `/callback/` は別物）

---

## 📋 チェックリスト

- [ ] Facebook Login製品を追加
- [ ] Valid OAuth Redirect URIsを設定（ローカル + 本番）
- [ ] Instagram Graph API製品を追加
- [ ] 必要なスコープを設定
- [ ] Instagramアカウントをビジネスアカウントに変更
- [ ] FacebookページにInstagramアカウントを接続
- [ ] テストユーザーを追加（開発モードの場合）
- [ ] 環境変数 `IG_SCOPES` を確認

---

## 🔗 参考リンク

- [Meta for Developers](https://developers.facebook.com/apps/)
- [Instagram Graph API ドキュメント](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Login 設定](https://developers.facebook.com/docs/facebook-login/web)
