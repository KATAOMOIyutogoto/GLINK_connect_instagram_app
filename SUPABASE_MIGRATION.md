# 🔄 Supabase移行ガイド

このドキュメントでは、Vercel KV（Redis）からSupabase（Postgres）への移行手順を説明します。

## 📋 移行の概要

### 変更内容

- **データストア**: Vercel KV → Supabase (Postgres)
- **削除**: `@vercel/kv` パッケージ、`lib/store.ts`
- **追加**: `@supabase/supabase-js`、`lib/supabaseAdmin.ts`、`lib/repo/instagramRepo.ts`
- **DB設計**: 将来のBot連携（メディア/ストーリー取得）を見据えた拡張可能な設計

### メリット

✅ SQLの柔軟なクエリ（JOIN、集計等）  
✅ リレーショナルデータモデル  
✅ 将来の機能拡張がしやすい（メディア/ストーリー/ジョブログ）  
✅ Supabaseの管理画面でデータを直接確認可能  
✅ バックアップとスケーリングが容易

---

## 🚀 移行手順

### ステップ1: Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力:
   - **Name**: `glink-instagram-oauth` (任意)
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` 推奨
4. 「Create new project」をクリック（数分かかります）

### ステップ2: Supabaseの接続情報を取得

プロジェクトが作成されたら:

1. Supabase Dashboard で「Settings」→「API」を開く
2. 以下の情報をコピー:
   - **URL**: `https://xxxxx.supabase.co`
   - **Service Role Key** (`service_role` と表示されているキー)
   
   ⚠️ **重要**: `anon` キーではなく、**`service_role`** キーを使用してください

### ステップ3: SQLスキーマの実行

1. Supabase Dashboard で「SQL Editor」を開く
2. 「New Query」をクリック
3. `supabase/schema.sql` の内容をコピー＆ペースト
4. 「Run」をクリックして実行

確認:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

以下のテーブルが作成されていることを確認:
- `instagram_accounts`
- `instagram_credentials`
- `instagram_fetch_cursors`
- `instagram_media`
- `instagram_stories`
- `instagram_job_runs`

### ステップ4: 環境変数の設定

`.env.local` に以下を追加:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（service_role key）

# 既存の環境変数（そのまま維持）
IG_APP_ID=...
IG_APP_SECRET=...
IG_REDIRECT_URI=...
IG_SCOPES=...
ENCRYPTION_KEY_BASE64=...

# 移行用（一時的に残す、移行後削除）
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### ステップ5: 依存関係のインストール

```powershell
npm install
```

これにより以下がインストールされます:
- `@supabase/supabase-js` (新規)
- `tsx` (移行スクリプト実行用)

### ステップ6: KVからSupabaseへデータ移行

⚠️ **移行前の確認**:
- Supabaseのスキーマが作成済みであること
- `.env.local` に全ての環境変数が設定されていること
- KVに保存されているデータがあること（なければこのステップはスキップ）

移行スクリプトを実行:

```powershell
npm run migrate
```

または:

```powershell
npx tsx scripts/migrate-kv-to-supabase.ts
```

実行結果の例:
```
🚀 KV → Supabase 移行を開始します...

📋 KVからアカウント一覧を取得中...
✅ 3 件のアカウントが見つかりました

📦 123456789 を移行中...
  ✅ 123456789 を移行しました
📦 987654321 を移行中...
  ✅ 987654321 を移行しました

==================================================
📊 移行結果サマリー
==================================================
✅ 成功: 3 件
❌ 失敗: 0 件
📦 合計: 3 件

✅ 移行が完了しました！
```

### ステップ7: 移行後の確認

1. **Supabaseでデータを確認**:
   - Supabase Dashboard → Table Editor
   - `instagram_accounts` にデータが存在すること
   - `instagram_credentials` に暗号化されたトークンが存在すること

2. **アプリで動作確認**:
   ```powershell
   npm run dev
   ```
   - `http://localhost:3000/connected` にアクセス
   - 移行されたアカウント一覧が表示されることを確認

3. **新規接続のテスト**:
   - `/connect` から新しいInstagramアカウントを接続
   - Supabaseにデータが保存されることを確認

### ステップ8: KV関連のクリーンアップ

移行が正常に完了したら、KV関連を削除:

1. **環境変数の削除** (`.env.local`):
   ```env
   # 以下を削除
   KV_URL=
   KV_REST_API_URL=
   KV_REST_API_TOKEN=
   KV_REST_API_READ_ONLY_TOKEN=
   ```

2. **Vercel環境変数の削除**:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - KV関連の変数をすべて削除

3. **Vercel KVデータベースの削除**（オプション）:
   - Vercel Dashboard → Storage → KV
   - 不要になったKVデータベースを削除

---

## 🌐 Vercelへのデプロイ

### 新しい環境変数の設定

Vercel Dashboard で以下を追加:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Production, Preview, Development |

⚠️ **セキュリティ注意**:
- `SUPABASE_SERVICE_ROLE_KEY` は**絶対にGitにコミットしない**
- ブラウザ側で使用しない（サーバーサイドのみ）

### デプロイ

```powershell
# Gitにコミット
git add .
git commit -m "feat: Migrate from Vercel KV to Supabase"
git push

# Vercel CLI でデプロイ
vercel --prod
```

---

## 📊 データベース設計

### テーブル一覧

1. **instagram_accounts** - 接続済みアカウント情報
2. **instagram_credentials** - アクセストークン（暗号化）
3. **instagram_fetch_cursors** - 取得カーソル（差分取得用）
4. **instagram_media** - 投稿メディア（将来のBot用）
5. **instagram_stories** - ストーリー（将来のBot用）
6. **instagram_job_runs** - ジョブ実行ログ

### ER図（概要）

```
instagram_accounts (1) ─── (1) instagram_credentials
       │
       ├── (1) ─── (1) instagram_fetch_cursors
       │
       ├── (1) ─── (N) instagram_media
       │
       ├── (1) ─── (N) instagram_stories
       │
       └── (1) ─── (N) instagram_job_runs
```

### 拡張ポイント

将来、Botで以下が実装可能:

1. **メディア取得**:
   ```typescript
   // 例: 定期的にメディアを取得してinstagram_mediaに保存
   async function fetchAndStoreMedia(accountId: string) {
     const media = await fetchInstagramMedia(accountId);
     await supabase.from('instagram_media').insert(media);
   }
   ```

2. **ストーリー取得**:
   ```typescript
   async function fetchAndStoreStories(accountId: string) {
     const stories = await fetchInstagramStories(accountId);
     await supabase.from('instagram_stories').insert(stories);
   }
   ```

3. **ジョブログ**:
   ```typescript
   const jobId = await logJobRun({
     jobName: 'fetch_media',
     accountId,
     status: 'running',
   });
   // ... 処理 ...
   await finishJobRun(jobId, 'success');
   ```

---

## 🔐 セキュリティ

### RLS（Row Level Security）

- **現状**: RLSは有効化されているが、ポリシーは未設定
- **理由**: アプリは `SERVICE_ROLE_KEY` で操作（RLSバイパス）
- **将来**: ユーザー認証を追加する場合、auth.uid()ベースのポリシーを追加可能

### SERVICE_ROLE_KEY の取り扱い

✅ **やること**:
- サーバーサイド（API routes）でのみ使用
- 環境変数で管理
- Vercelの環境変数に設定

❌ **やってはいけないこと**:
- クライアント側（ブラウザ）で使用
- Gitにコミット
- ログに出力

---

## 🐛 トラブルシューティング

### 移行スクリプトが失敗する

**エラー**: "環境変数が設定されていません"

**解決策**:
- `.env.local` に全ての環境変数が設定されているか確認
- `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が正しいか確認

### Supabaseに接続できない

**エラー**: "Missing env variable: NEXT_PUBLIC_SUPABASE_URL"

**解決策**:
```powershell
# 環境変数を確認
Get-Content .env.local | Select-String "SUPABASE"

# Next.jsを再起動
npm run dev
```

### RLS policy violation

**エラー**: "new row violates row-level security policy"

**解決策**:
- `SERVICE_ROLE_KEY` を使用しているか確認（`anon` キーではない）
- `lib/supabaseAdmin.ts` が正しくインポートされているか確認

### 型エラーが出る

**エラー**: "Cannot find module '@/types/supabase'"

**解決策**:
```powershell
# TypeScriptを再起動（VSCodeの場合）
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# ビルドして確認
npm run build
```

---

## 📝 チェックリスト

移行が完了したら、以下を確認:

- [ ] Supabaseプロジェクトが作成された
- [ ] SQLスキーマが実行された
- [ ] 環境変数が設定された（ローカル & Vercel）
- [ ] KVからSupabaseへデータが移行された
- [ ] `/connected` で移行データが表示される
- [ ] 新規接続が正常に動作する
- [ ] KV関連の環境変数が削除された
- [ ] Vercelにデプロイされた
- [ ] 本番環境で動作確認した

---

## 🎉 移行完了！

お疲れさまでした！これで、より柔軟で拡張可能なSupabaseベースのシステムに移行されました。

次のステップ:
1. Botによるメディア/ストーリー取得機能の実装
2. ジョブスケジューリング（Vercel Cron Jobs）の設定
3. ダッシュボードの拡張（統計、グラフ等）

質問がある場合は、GitHubのIssuesで報告してください。
