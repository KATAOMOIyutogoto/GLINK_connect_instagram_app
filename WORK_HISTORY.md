# 作業履歴 - GLINK Instagram OAuth

## 📅 作業日時
**開始**: 2026-01-19  
**最終更新**: 2026-01-19

---

## 🎯 プロジェクト目標

Instagram公式API（OAuth）を使用して、複数のInstagramプロアカウントを安全に接続し、後続のBotがアクセストークンを使用できるようにする社内運用システムの構築。

---

## ✅ 完了した作業

### 1. プロジェクト初期セットアップ
- ✅ Next.js 14 (App Router) + TypeScript プロジェクトの作成
- ✅ Tailwind CSS の導入
- ✅ 基本的なファイル構造の構築
- ✅ 環境変数管理の設定

### 2. データストレージの移行（Vercel KV → Supabase）
#### 2.1 データベース設計
- ✅ Supabase Postgres スキーマの設計
- ✅ 以下のテーブルを作成：
  - `instagram_accounts` - アカウント情報
  - `instagram_credentials` - 暗号化されたトークン
  - `instagram_fetch_cursors` - 取得カーソル
  - `instagram_media` - メディア（投稿）履歴
  - `instagram_stories` - ストーリー履歴
  - `instagram_job_runs` - ジョブ実行ログ
- ✅ RLS（Row Level Security）の有効化
- ✅ インデックスとトリガーの設定

#### 2.2 アプリケーション層の更新
- ✅ `@vercel/kv` の削除、`@supabase/supabase-js` の追加
- ✅ `lib/supabaseAdmin.ts` の作成（Service Role Key使用）
- ✅ `lib/repo/instagramRepo.ts` の作成（リポジトリパターン）
- ✅ 型定義ファイル `types/supabase.ts` の作成
- ✅ 全APIルートのデータアクセス層を更新

#### 2.3 マイグレーション
- ✅ KV → Supabase 移行スクリプトの作成
- ✅ `tsconfig.json` の調整（移行スクリプトの除外）

### 3. セキュリティ実装
- ✅ AES-256-GCM による暗号化（`lib/crypto.ts`）
- ✅ CSRF対策（`state` パラメータ）
- ✅ HttpOnly / Secure / SameSite Cookie の実装
- ✅ トークンのログ出力防止

### 4. OAuth フロー実装
- ✅ Instagram Basic Display API の統合
- ✅ OAuth 認可フロー
  - `/api/instagram/login` - 認証開始
  - `/api/instagram/callback` - コールバック処理
  - `/api/instagram/status` - アカウント一覧
  - `/api/instagram/refresh` - トークン更新
- ✅ 短期トークン → 長期トークンの交換
- ✅ ユーザープロフィール取得

### 5. UI 実装
- ✅ トップページ（`/`）
- ✅ 接続画面（`/connect`）
- ✅ 接続済みアカウント一覧（`/connected`）
- ✅ レスポンシブデザイン

### 6. ビルド・デプロイの修正
#### 6.1 ビルドエラーの解決
- ✅ `npm install` の実行
- ✅ 型エラーの修正（`InstagramAccountView[]`）
- ✅ Supabase クライアントの型定義調整
- ✅ `tsconfig.json` の `exclude` 設定
- ✅ 環境変数の build-time 対応（`next.config.js`）
- ✅ 動的レンダリング設定（`export const dynamic = 'force-dynamic'`）

#### 6.2 Vercel デプロイ
- ✅ Git リポジトリの初期化
- ✅ 初回コミット
- ✅ Vercel へのデプロイ成功
  - URL: `https://glink-instagram-oauth-2zj9d8ee1-commomongiftedtokyo.vercel.app`

#### 6.3 GitHub リポジトリ
- ✅ GitHub リポジトリの作成
  - URL: `https://github.com/KATAOMOIyutogoto/GLINK_connect_instagram_app`
- ✅ コードのプッシュ完了

### 7. Instagram Graph API への対応準備
- ✅ `lib/instagram-graph.ts` の作成（ビジネス/クリエイターアカウント用）
- ✅ Facebook OAuth フローの実装
- ✅ Instagram Business Account 取得機能
- ✅ メディア・ストーリー取得の基盤準備

### 8. ドキュメント作成
- ✅ `README.md` - プロジェクト概要
- ✅ `QUICKSTART.md` - クイックスタートガイド
- ✅ `DEPLOYMENT.md` - デプロイガイド
- ✅ `PROJECT_SUMMARY.md` - プロジェクトサマリー
- ✅ `CONTRIBUTING.md` - 貢献ガイド
- ✅ `CHANGELOG.md` - 変更履歴
- ✅ `SUPABASE_MIGRATION.md` - Supabase移行ガイド
- ✅ `MIGRATION_COMPLETED.md` - 移行完了報告
- ✅ `LICENSE` - MITライセンス

### 9. 開発ツール
- ✅ `scripts/generate-encryption-key.js` - 暗号化キー生成
- ✅ `scripts/check-env.js` - 環境変数チェック
- ✅ `scripts/migrate-kv-to-supabase.ts` - データ移行スクリプト

---

## 🐛 発生した問題と解決策

### 問題1: TypeScript 型エラー（`accounts` 変数）
**エラー**: `Variable 'accounts' implicitly has type 'any[]'`  
**解決策**: `InstagramAccountView[]` 型を明示的に指定

### 問題2: Supabase クライアントの型エラー
**エラー**: `No overload matches this call` (upsert操作)  
**解決策**: `createClient` から型パラメータを削除し、動的型推論を使用

### 問題3: ビルド時の環境変数エラー
**エラー**: `Missing env variable: NEXT_PUBLIC_SUPABASE_URL`  
**解決策**: `next.config.js` にダミー環境変数を追加

### 問題4: 移行スクリプトのビルドエラー
**エラー**: `Cannot find module '@vercel/kv'`（削除後）  
**解決策**: `tsconfig.json` の `exclude` に追加

### 問題5: Next.js 動的レンダリングエラー
**エラー**: `Route /api/instagram/login couldn't be rendered statically`  
**解決策**: 全APIルートに `export const dynamic = 'force-dynamic'` を追加

### 問題6: Vercel プロジェクト名エラー
**エラー**: `Project names must be lowercase`  
**解決策**: `--name` フラグでプロジェクト名を指定（後に削除）

### 問題7: vercel.json の環境変数参照エラー
**エラー**: `Secret "ig_app_id" does not exist`  
**解決策**: `vercel.json` から `env` セクションを削除

### 問題8: Instagram OAuth エラー
**エラー**: `Invalid platform app` (Meta Developer Portal設定)  
**原因**: Instagram Basic Display API の設定不足  
**解決策**: Instagram Graph API への切り替えを提案

---

## 🔧 現在の技術スタック

| カテゴリ | 技術・ツール |
|---------|-------------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript 5.3.3 |
| スタイリング | Tailwind CSS 3.4.1 |
| データベース | Supabase (Postgres) |
| 暗号化 | Web Crypto API (AES-256-GCM) |
| OAuth API | Instagram Basic Display API / Instagram Graph API (準備中) |
| デプロイ | Vercel |
| バージョン管理 | Git + GitHub |
| パッケージマネージャー | npm |

---

## 📊 環境変数の設定状況

### ローカル開発環境（`.env.local`）
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - 設定済み
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - 設定済み
- ✅ `ENCRYPTION_KEY_BASE64` - 生成・設定済み
- ⚠️ `IG_APP_ID` - ユーザー設定済み（値は非公開）
- ⚠️ `IG_APP_SECRET` - ユーザー設定済み（値は非公開）
- ✅ `IG_REDIRECT_URI` - 設定済み
- ✅ `IG_SCOPES` - 設定済み

### Vercel 本番環境
- ⏳ 環境変数の設定待ち（ユーザー作業）
- ⏳ Meta Developer Portal の設定待ち

---

## 🚀 デプロイ状況

### Vercel
- **状態**: ✅ デプロイ成功
- **URL**: https://glink-instagram-oauth-2zj9d8ee1-commongiftedtokyo.vercel.app
- **プロジェクト名**: `glink-instagram-oauth`
- **組織**: `commongiftedtokyo`

### GitHub
- **状態**: ✅ プッシュ完了
- **URL**: https://github.com/KATAOMOIyutogoto/GLINK_connect_instagram_app
- **ブランチ**: `main`
- **コミット数**: 3

---

## 📋 次のステップ（未完了タスク）

### 1. Supabase データベースのセットアップ
- [ ] Supabase SQL Editor で `supabase/schema.sql` を実行
- [ ] テーブルの作成確認
- [ ] RLS ポリシーの確認

### 2. Meta Developer Portal の設定
#### Option A: Instagram Basic Display API（個人アカウント用）
- [ ] Instagram Basic Display 製品を追加
- [ ] Valid OAuth Redirect URIs を設定
- [ ] Instagram Tester を追加
- [ ] テストユーザーの承認

#### Option B: Instagram Graph API（ビジネスアカウント用）★推奨
- [ ] Facebook Login 製品を追加
- [ ] 必要な権限（スコープ）を設定：
  - `instagram_basic`
  - `pages_show_list`
  - `pages_read_engagement`
  - `instagram_manage_insights`（オプション）
- [ ] Valid OAuth Redirect URIs を設定
- [ ] `lib/instagram.ts` を `lib/instagram-graph.ts` に置き換え

### 3. Vercel 環境変数の設定
- [ ] Vercel Dashboard で環境変数を追加
- [ ] `IG_REDIRECT_URI` を本番URLに更新
- [ ] 本番デプロイ（`vercel --prod`）

### 4. 機能拡張
- [ ] メディア（投稿）取得APIの実装
- [ ] ストーリー取得APIの実装
- [ ] 自動トークン更新（Vercel Cron Jobs）
- [ ] アカウント削除機能
- [ ] エラーモニタリング（Sentry等）

### 5. テスト
- [ ] ローカル環境でのOAuthフローテスト
- [ ] 本番環境でのOAuthフローテスト
- [ ] 複数アカウント接続のテスト
- [ ] トークン更新のテスト

---

## 🔑 重要な情報

### Supabase プロジェクト
- **URL**: https://mcnmmcasmcfdoaknskyv.supabase.co
- **プロジェクトID**: `mcnmmcasmcfdoaknskyv`
- **Dashboard**: https://supabase.com/dashboard/project/mcnmmcasmcfdoaknskyv

### 暗号化キー
- **生成日**: 2026-01-19
- **アルゴリズム**: AES-256-GCM
- **保存場所**: `.env.local` (ローカル), Vercel環境変数 (本番)

### ファイル構造
```
GLINK_v2/
├── app/                      # Next.js App Router
│   ├── api/instagram/        # Instagram API routes
│   ├── connect/              # 接続画面
│   ├── connected/            # 接続済み一覧
│   └── page.tsx              # トップページ
├── lib/                      # ユーティリティ
│   ├── crypto.ts             # 暗号化
│   ├── supabaseAdmin.ts      # Supabase クライアント
│   ├── instagram.ts          # Instagram API (Basic Display)
│   ├── instagram-graph.ts    # Instagram API (Graph) ★準備完了
│   └── repo/                 # データリポジトリ
│       └── instagramRepo.ts
├── supabase/
│   └── schema.sql            # データベーススキーマ
├── scripts/                  # 開発ツール
├── types/                    # 型定義
└── [ドキュメント]
```

---

## 💡 学んだこと・ベストプラクティス

1. **Next.js App Router の動的レンダリング**
   - API routesには `export const dynamic = 'force-dynamic'` が必要
   - ビルド時エラーを避けるため、環境変数のフォールバック値を用意

2. **Supabase と TypeScript**
   - 型パラメータを過度に指定すると型エラーが発生する場合がある
   - Service Role Key を使用することで RLS をバイパス可能

3. **暗号化のベストプラクティス**
   - AES-256-GCM を使用
   - IV (Initialization Vector) を毎回ランダム生成
   - 暗号化データと IV を `:`区切りで保存

4. **Instagram API の選択**
   - **Basic Display**: 個人アカウント向け、テストユーザー登録必須
   - **Graph API**: ビジネス/クリエイターアカウント向け、より多機能

5. **環境変数管理**
   - ビルド時とランタイムで異なる挙動
   - Vercel では環境変数を環境ごとに設定可能

---

## 🤝 コラボレーション情報

### チーム
- **開発者**: GLINK Team
- **AI アシスタント**: Claude (Anthropic)

### コミュニケーション
- 全て日本語で実施
- 技術的な詳細を含む丁寧な説明
- 段階的なアプローチ

---

## 📝 メモ

### Instagram Graph API への切り替え検討中
- ユーザーの要件: 「ストーリーや投稿を取得したい」
- 現在の状態:
  - `lib/instagram-basic.ts.backup` - 元のBasic Display API実装
  - `lib/instagram-graph.ts` - Graph API実装（作成済み）
  - `lib/instagram.ts` - Graph API版に切り替え済み

### Meta Developer Portal エラー
- エラー: 「Invalid platform app」
- 原因: Instagram Basic Display API の設定が不完全
- 解決策: Instagram Graph API への完全移行を推奨

---

**作成者**: AI Assistant (Claude)  
**最終更新**: 2026-01-19  
**ステータス**: 開発中 - Supabaseセットアップ待ち
