# ✅ Vercel KV → Supabase 移行完了

## 📋 変更内容サマリー

### 削除されたファイル
- ❌ `lib/store.ts` (KV実装)

### 新規作成されたファイル
- ✅ `lib/supabaseAdmin.ts` - Supabase管理クライアント
- ✅ `lib/repo/instagramRepo.ts` - データリポジトリ層
- ✅ `types/supabase.ts` - Supabase型定義
- ✅ `supabase/schema.sql` - データベーススキーマ
- ✅ `scripts/migrate-kv-to-supabase.ts` - 移行スクリプト
- ✅ `SUPABASE_MIGRATION.md` - 移行ガイド
- ✅ `MIGRATION_COMPLETED.md` - このファイル

### 変更されたファイル
- 🔄 `package.json` - 依存関係の更新
- 🔄 `app/api/instagram/callback/route.ts` - リポジトリ参照に変更
- 🔄 `app/api/instagram/status/route.ts` - リポジトリ参照に変更
- 🔄 `app/api/instagram/refresh/route.ts` - リポジトリ参照に変更
- 🔄 `app/connected/page.tsx` - リポジトリ参照に変更
- 🔄 `env.example` - Supabase環境変数に更新
- 🔄 `scripts/check-env.js` - Supabase環境変数をチェック
- 🔄 `README.md` - Supabase使用を明記
- 🔄 `DEPLOYMENT.md` - デプロイ手順を更新
- 🔄 `PROJECT_SUMMARY.md` - 技術スタック更新

---

## 🗄 データベース設計

### テーブル構成

```sql
instagram_accounts          -- アカウント情報
├── id (UUID PK)
├── ig_user_id (TEXT UNIQUE)
├── ig_username (TEXT)
├── account_type (TEXT)
├── connected_at (TIMESTAMPTZ)
└── ...

instagram_credentials       -- 認証情報（トークン）
├── id (UUID PK)
├── account_id (UUID FK) → instagram_accounts
├── encrypted_access_token (TEXT)  -- AES-256-GCM暗号化
├── token_type (TEXT)
├── expires_at (TIMESTAMPTZ)
└── ...

instagram_fetch_cursors     -- 取得カーソル
├── id (UUID PK)
├── account_id (UUID FK) → instagram_accounts
├── media_last_fetched_at (TIMESTAMPTZ)
└── stories_last_fetched_at (TIMESTAMPTZ)

instagram_media             -- メディア履歴（将来のBot用）
├── id (UUID PK)
├── account_id (UUID FK) → instagram_accounts
├── ig_media_id (TEXT)
└── ...

instagram_stories           -- ストーリー履歴（将来のBot用）
├── id (UUID PK)
├── account_id (UUID FK) → instagram_accounts
├── ig_story_id (TEXT)
└── ...

instagram_job_runs          -- ジョブ実行ログ
├── id (UUID PK)
├── job_name (TEXT)
├── account_id (UUID FK) → instagram_accounts
├── status (TEXT)
└── ...
```

### RLS設定
- **現在**: RLS有効化済み、ポリシーなし
- **理由**: SERVICE_ROLE_KEYでアクセス（RLSバイパス）
- **将来**: ユーザー認証実装時にポリシー追加可能

---

## 🚀 次のステップ

### 1. 依存関係のインストール

```powershell
npm install
```

これにより以下がインストールされます:
- `@supabase/supabase-js@^2.39.3`
- `tsx@^4.7.0` (移行スクリプト用)

### 2. Supabaseプロジェクトのセットアップ

詳細は [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) を参照してください。

1. [Supabase Dashboard](https://app.supabase.com/) でプロジェクト作成
2. SQL Editorで `supabase/schema.sql` を実行
3. Project Settings > API から以下を取得:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. 環境変数の設定

`.env.local` を更新:

```env
# Instagram (既存)
IG_APP_ID=...
IG_APP_SECRET=...
IG_REDIRECT_URI=http://localhost:3000/api/instagram/callback
IG_SCOPES=instagram_basic,pages_read_engagement
ENCRYPTION_KEY_BASE64=...

# Supabase (新規)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# KV (移行用、一時的に残す)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

### 4. KVからSupabaseへデータ移行

⚠️ **既存データがある場合のみ実行してください**

```powershell
npm run migrate
```

または

```powershell
npx tsx scripts/migrate-kv-to-supabase.ts
```

### 5. 動作確認

```powershell
# 環境変数チェック
npm run check-env

# 開発サーバー起動
npm run dev
```

ブラウザで確認:
- `http://localhost:3000/connected` - 移行データが表示されること
- `/connect` から新規接続してSupabaseに保存されること

### 6. KV関連のクリーンアップ

移行が完了したら:

1. `.env.local` からKV環境変数を削除:
   ```
   # 以下を削除
   KV_URL=
   KV_REST_API_URL=
   KV_REST_API_TOKEN=
   KV_REST_API_READ_ONLY_TOKEN=
   ```

2. Vercel環境変数からもKV関連を削除

3. Vercel KVデータベースを削除（オプション）

---

## 📊 移行前後の比較

### データストア

| 項目 | KV (Before) | Supabase (After) |
|------|-------------|------------------|
| データベース | Redis | Postgres |
| パッケージ | `@vercel/kv` | `@supabase/supabase-js` |
| ストレージ層 | `lib/store.ts` | `lib/repo/instagramRepo.ts` |
| キー構造 | `ig:account:index`, `ig:account:{id}` | リレーショナルテーブル |
| クエリ | Key-Value操作 | SQL (JOIN, 集計等) |
| 管理画面 | Vercel Dashboard | Supabase Dashboard |
| RLS | なし | あり（将来の認証対応） |
| 拡張性 | 限定的 | 高い（テーブル追加容易） |

### セキュリティ

両方とも以下を維持:
- ✅ トークンのAES-256-GCM暗号化
- ✅ 環境変数による機密情報管理
- ✅ サーバーサイドのみでの操作

追加のセキュリティ:
- ✅ Supabase RLS（将来の認証対応の下地）

---

## 🔧 トラブルシューティング

### ビルドエラー

**エラー**: `Cannot find module '@/lib/store'`

**解決策**:
```powershell
# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

### 型エラー

**エラー**: `Cannot find module '@/types/supabase'`

**解決策**:
- VSCodeの場合: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- ビルドして確認: `npm run build`

### Supabase接続エラー

**エラー**: "Missing env variable: NEXT_PUBLIC_SUPABASE_URL"

**解決策**:
```powershell
# 環境変数を確認
Get-Content .env.local | Select-String "SUPABASE"

# Next.jsを再起動
npm run dev
```

### 移行スクリプトエラー

**エラー**: "環境変数が設定されていません"

**解決策**:
- `.env.local` に全ての環境変数（KV + Supabase）が設定されているか確認
- `SUPABASE_SERVICE_ROLE_KEY` が正しいか確認（`anon`キーではなく`service_role`キー）

---

## ✅ チェックリスト

移行完了確認:

- [ ] `npm install` が成功した
- [ ] Supabaseプロジェクトが作成された
- [ ] `supabase/schema.sql` が実行された
- [ ] `.env.local` にSupabase環境変数が設定された
- [ ] `npm run check-env` が成功した
- [ ] `npm run dev` でアプリが起動した
- [ ] `/connected` でデータが表示される
- [ ] 新規接続が正常に動作する
- [ ] KV関連の環境変数を削除した
- [ ] Vercel環境変数が更新された
- [ ] 本番環境にデプロイされた

---

## 📝 主要コード例

### アカウント保存

```typescript
import { saveAccount } from '@/lib/repo/instagramRepo';

await saveAccount({
  igUserId: '123456789',
  username: 'example_user',
  accessToken: 'EAAxxxx...',
  tokenType: 'Bearer',
  connectedAt: new Date().toISOString(),
  tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
});
```

### アカウント取得

```typescript
import { getAccount } from '@/lib/repo/instagramRepo';

const account = await getAccount('123456789');
if (account) {
  console.log('Access Token:', account.accessToken); // 復号化済み
}
```

### 一覧取得

```typescript
import { listAccounts } from '@/lib/repo/instagramRepo';

const accounts = await listAccounts();
// トークンは含まれない（表示用）
```

---

## 🎉 移行完了！

お疲れさまでした。より柔軟で拡張可能なSupabaseベースのシステムに移行されました。

次の拡張候補:
1. **メディア取得Bot** - `instagram_media` テーブルに保存
2. **ストーリー取得Bot** - `instagram_stories` テーブルに保存
3. **ジョブスケジューリング** - Vercel Cron Jobsで定期実行
4. **統計ダッシュボード** - 取得件数、エンゲージメント等の可視化
5. **ユーザー認証** - Supabase AuthとRLSポリシーの追加

質問やサポートが必要な場合は、GitHubのIssuesで報告してください。
