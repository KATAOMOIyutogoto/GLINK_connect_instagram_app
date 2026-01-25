# Instagram API 比較：投稿・ストーリー取得について

## 📊 結論

**投稿・ストーリーのダウンロードには、Instagram Graph API（ビジネス/クリエイターアカウント）が必要です。**

個人アカウントでは、投稿・ストーリーのダウンロードは公式APIでは**不可能**です。

---

## 🔍 詳細比較

### Instagram Basic Display API（個人アカウント用）

| 機能 | 対応状況 | 備考 |
|------|---------|------|
| **プロフィール情報取得** | ✅ 可能 | 基本的な情報のみ |
| **自分の投稿取得** | ⚠️ 限定的 | 一部の投稿のみ取得可能 |
| **ストーリー取得** | ❌ **不可能** | ストーリーAPIは提供されていない |
| **投稿のダウンロード** | ❌ **不可能** | メディアファイルのダウンロードは不可 |
| **他人の投稿取得** | ❌ 不可能 | 自分の投稿のみ |

**制限事項:**
- 個人アカウント専用
- 投稿・ストーリーのダウンロード機能は提供されていない
- 主にプロフィール情報と限定的な投稿情報のみ

---

### Instagram Graph API（ビジネス/クリエイターアカウント用）

| 機能 | 対応状況 | 備考 |
|------|---------|------|
| **プロフィール情報取得** | ✅ 可能 | 詳細な情報取得可能 |
| **自分の投稿取得** | ✅ **可能** | 全投稿（画像、動画、カルーセル、Reels） |
| **ストーリー取得** | ✅ **可能** | 24時間以内のストーリー |
| **投稿のダウンロード** | ✅ **可能** | メディアファイルURL取得可能 |
| **ストーリーのダウンロード** | ✅ **可能** | メディアファイルURL取得可能 |
| **インサイト取得** | ✅ 可能 | エンゲージメントデータなど |

**エンドポイント:**
- **投稿取得**: `GET /{ig-user-id}/media`
- **ストーリー取得**: `GET /{ig-user-id}/stories`
- **メディア詳細**: `GET /{ig-media-id}`

**必要な権限:**
- `instagram_basic`
- `pages_read_engagement`
- `instagram_manage_insights`（インサイト取得の場合）

---

## 📋 ストーリー取得の制限事項

Instagram Graph APIでストーリーを取得する場合、以下の制限があります：

1. **24時間制限**: ストーリーは投稿後24時間以内のみ取得可能
2. **ライブ動画除外**: ライブ動画のストーリーは含まれない
3. **リシェア除外**: リシェアで作成された新しいストーリーは返されない
4. **キャプション**: 複数のキャプションがあっても1つのみ返される

---

## 🎯 あなたの要件への回答

### Q: ログインした人の投稿・ストーリーをダウンロードしたい

**A: Instagram Graph API（ビジネス/クリエイターアカウント）が必要です。**

### Q: プロアカウントのみでできないのか？

**A: はい、プロアカウント（ビジネス/クリエイター）のみで可能です。**

個人アカウントでは、投稿・ストーリーのダウンロードは**公式APIでは不可能**です。

---

## 🔧 実装に必要なこと

### 1. アカウントタイプの確認
- Instagramアカウントを**ビジネスアカウント**または**クリエイターアカウント**に変更
- Instagramアプリで「設定」→「アカウントタイプとツール」から変更可能

### 2. Facebookページとの接続
- Facebookページを作成
- InstagramアカウントをFacebookページに接続

### 3. Meta Developer Portalの設定
- Facebook Login製品を追加
- Instagram Graph API製品を追加
- 必要な権限を設定

### 4. コードの実装
- Instagram Graph APIを使用（現在のコードはBasic Display API）
- 投稿取得エンドポイント: `/{ig-user-id}/media`
- ストーリー取得エンドポイント: `/{ig-user-id}/stories`

---

## 📝 まとめ

| 項目 | 個人アカウント | ビジネス/クリエイターアカウント |
|------|---------------|----------------------------|
| **投稿取得** | ❌ 不可能 | ✅ 可能 |
| **ストーリー取得** | ❌ 不可能 | ✅ 可能（24時間以内） |
| **メディアダウンロード** | ❌ 不可能 | ✅ 可能 |
| **使用API** | Basic Display API | Graph API |
| **認証方法** | Instagram Login | Facebook Login経由 |

**結論**: 投稿・ストーリーのダウンロードには、**必ずビジネス/クリエイターアカウントとInstagram Graph APIが必要**です。

---

## 🔗 参考リンク

- [Instagram Graph API - Media](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/)
- [Instagram Graph API - Stories](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/stories/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
