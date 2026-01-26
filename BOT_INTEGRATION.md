# Bot連携ガイド

## 📋 概要

このアプリは、顧客のInstagramアカウントからアクセストークンを取得・保存し、後続のBotがそのトークンを使用して投稿・ストーリーをダウンロードできるようにします。

**重要**: このアプリは**Instagram API with Instagram Login**を使用しています。
- ✅ 顧客はInstagramアカウントだけでログイン可能
- ✅ FacebookアカウントやFacebookページへの接続は不要
- ✅ より簡単なオンボーディング

---

## 🔑 Bot用APIエンドポイント

### トークン取得

**エンドポイント:**
```
GET /api/instagram/token?igUserId={igUserId}
```

**パラメータ:**
- `igUserId` (必須): Instagram Business Account ID

**レスポンス（成功時）:**
```json
{
  "success": true,
  "igUserId": "17841405309211844",
  "username": "example_user",
  "accessToken": "EAABwzLix...",
  "tokenType": "Bearer",
  "expiresIn": 5183944,
  "tokenExpiresAt": "2026-03-20T12:00:00.000Z",
  "endpoints": {
    "media": "https://graph.instagram.com/17841405309211844/media",
    "stories": "https://graph.instagram.com/17841405309211844/stories"
  }
}
```

**レスポンス（エラー時）:**
```json
{
  "success": false,
  "error": "Account not found"
}
```

**ステータスコード:**
- `200`: 成功
- `400`: パラメータ不足
- `401`: トークン期限切れ
- `404`: アカウントが見つからない
- `500`: サーバーエラー

---

## 📥 投稿の取得

### 基本的な取得

```typescript
// 1. トークンを取得（Vercel Dashboardで確認したプロダクションURLを使用）
const tokenRes = await fetch(
  'https://glink-instagram-oauth.vercel.app/api/instagram/token?igUserId=17841405309211844'
);
const { accessToken, endpoints } = await tokenRes.json();

// 2. 投稿を取得
const mediaRes = await fetch(
  `${endpoints.media}?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${accessToken}`
);
const { data } = await mediaRes.json();

// data には投稿の配列が含まれる
```

### 取得可能なフィールド

- `id`: メディアID
- `caption`: キャプション
- `media_type`: メディアタイプ（IMAGE, VIDEO, CAROUSEL_ALBUM）
- `media_url`: メディアファイルURL
- `thumbnail_url`: サムネイルURL（動画の場合）
- `timestamp`: 投稿日時
- `permalink`: 投稿のパーマリンク
- `like_count`: いいね数
- `comments_count`: コメント数

### ページネーション

```typescript
let nextUrl = `${endpoints.media}?fields=id,media_url&access_token=${accessToken}`;

while (nextUrl) {
  const response = await fetch(nextUrl);
  const { data, paging } = await response.json();
  
  // データを処理
  for (const media of data) {
    console.log(media.media_url);
  }
  
  // 次のページがあるか確認
  nextUrl = paging?.next || null;
}
```

---

## 📸 ストーリーの取得

### 基本的な取得

```typescript
// 1. トークンを取得（Vercel Dashboardで確認したプロダクションURLを使用）
const tokenRes = await fetch(
  'https://glink-instagram-oauth.vercel.app/api/instagram/token?igUserId=17841405309211844'
);
const { accessToken, endpoints } = await tokenRes.json();

// 2. ストーリーを取得（24時間以内のもののみ）
const storiesRes = await fetch(
  `${endpoints.stories}?fields=id,media_type,media_url,timestamp&access_token=${accessToken}`
);
const { data } = await storiesRes.json();
```

### 注意事項

⚠️ **ストーリーの制限:**
- 投稿後24時間以内のもののみ取得可能
- ライブ動画のストーリーは含まれない
- リシェアで作成された新しいストーリーは返されない

---

## 💾 メディアファイルのダウンロード

### 画像のダウンロード

```typescript
const mediaUrl = mediaData.data[0].media_url;
const response = await fetch(mediaUrl);
const blob = await response.blob();

// ファイルとして保存
const buffer = Buffer.from(await blob.arrayBuffer());
fs.writeFileSync('image.jpg', buffer);
```

### 動画のダウンロード

```typescript
const videoUrl = mediaData.data[0].media_url; // media_type が VIDEO の場合
const response = await fetch(videoUrl);
const blob = await response.blob();

const buffer = Buffer.from(await blob.arrayBuffer());
fs.writeFileSync('video.mp4', buffer);
```

### カルーセル（複数画像）の処理

```typescript
// カルーセルの場合、children エンドポイントで子メディアを取得
if (media.media_type === 'CAROUSEL_ALBUM') {
  const childrenRes = await fetch(
    `https://graph.instagram.com/${media.id}/children?fields=media_url,media_type&access_token=${accessToken}`
  );
  const { data: children } = await childrenRes.json();
  
  // 各子メディアをダウンロード
  for (const child of children) {
    // ダウンロード処理
  }
}
```

---

## 🔄 エラーハンドリング

### トークン期限切れ

```typescript
const tokenRes = await fetch(
  'https://glink-instagram-oauth.vercel.app/api/instagram/token?igUserId=17841405309211844'
);
const data = await tokenRes.json();

if (!data.success && data.error.includes('expired')) {
  // トークンリフレッシュAPIを呼び出す
  const refreshRes = await fetch(
    'https://glink-instagram-oauth.vercel.app/api/instagram/refresh',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igUserId: '17841405309211844' }),
    }
  );
  // リフレッシュ後、再度トークンを取得
}
```

### レート制限

Instagram Graph APIにはレート制限があります。エラーレスポンスを確認:

```typescript
const response = await fetch(mediaUrl);
if (!response.ok) {
  const error = await response.json();
  if (error.error?.code === 4) {
    // レート制限エラー
    // リトライロジックを実装
  }
}
```

---

## 📊 データベースへの保存（オプション）

取得したメディアをSupabaseに保存する場合:

```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 投稿を保存
await supabaseAdmin.from('instagram_media').upsert({
  account_id: accountId,
  ig_media_id: media.id,
  media_type: media.media_type,
  permalink: media.permalink,
  media_url: media.media_url,
  caption: media.caption,
  posted_at: media.timestamp,
  raw: media, // 完全なレスポンスを保存
});
```

---

## 🔐 セキュリティ

- ✅ トークンは暗号化されて保存されています
- ✅ Bot用APIは必要に応じて認証を追加してください
- ✅ トークンは絶対にログに出力しないでください

---

## 📝 実装例（完全版）

```typescript
async function downloadUserMedia(igUserId: string) {
  try {
    // 1. トークン取得（Vercel Dashboardで確認したプロダクションURLを使用）
    const tokenRes = await fetch(
      `https://glink-instagram-oauth.vercel.app/api/instagram/token?igUserId=${igUserId}`
    );
    const { accessToken, endpoints } = await tokenRes.json();
    
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }
    
    // 2. 投稿を取得
    const mediaRes = await fetch(
      `${endpoints.media}?fields=id,media_type,media_url,caption,timestamp&access_token=${accessToken}`
    );
    const { data: posts } = await mediaRes.json();
    
    // 3. ストーリーを取得
    const storiesRes = await fetch(
      `${endpoints.stories}?fields=id,media_type,media_url,timestamp&access_token=${accessToken}`
    );
    const { data: stories } = await storiesRes.json();
    
    // 4. ダウンロード
    const downloads = [];
    
    // 投稿をダウンロード
    for (const post of posts) {
      const fileRes = await fetch(post.media_url);
      const blob = await fileRes.blob();
      downloads.push({
        type: 'post',
        id: post.id,
        url: post.media_url,
        data: blob,
      });
    }
    
    // ストーリーをダウンロード
    for (const story of stories) {
      const fileRes = await fetch(story.media_url);
      const blob = await fileRes.blob();
      downloads.push({
        type: 'story',
        id: story.id,
        url: story.media_url,
        data: blob,
      });
    }
    
    return downloads;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}
```

---

## 🔗 参考リンク

- [Instagram Graph API - Media](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/)
- [Instagram Graph API - Stories](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/stories/)
- [Instagram Graph API - IG Media](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/)
