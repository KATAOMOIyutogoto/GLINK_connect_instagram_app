-- ============================================
-- Instagram OAuth - Supabase Schema
-- ============================================
-- このSQLはSupabase SQL Editorで実行してください
--
-- 目的:
-- 1. Instagram OAuth連携のアカウント・トークン管理
-- 2. 後続Botによるメディア・ストーリー取得履歴の蓄積
-- 3. ジョブ実行ログの記録
--
-- セキュリティ:
-- - RLSは有効化するが、アプリはSERVICE_ROLE_KEYで操作（RLSバイパス）
-- - ブラウザからの直接アクセスは想定しない
-- - 将来のユーザー認証対応に備えた下地
-- ============================================

BEGIN;

-- ============================================
-- 1. 拡張の有効化
-- ============================================
-- UUID生成用（Supabaseではデフォルトで利用可能）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. updated_at自動更新関数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. instagram_accounts テーブル
-- ============================================
-- 接続済みInstagramアカウント（プロアカウント）情報
CREATE TABLE IF NOT EXISTS instagram_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ig_user_id TEXT NOT NULL UNIQUE,        -- Instagram Graph APIのUser ID
    ig_username TEXT,                       -- Instagramユーザー名（取得できた場合）
    account_type TEXT,                      -- business/creator等（不明ならnull）
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,               -- 最終アクティブ日時
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_updated_at 
    ON instagram_accounts(updated_at DESC);

-- RLS有効化
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;

-- updated_atトリガー
CREATE TRIGGER update_instagram_accounts_updated_at
    BEFORE UPDATE ON instagram_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. instagram_credentials テーブル
-- ============================================
-- アクセストークン（AES-256-GCM暗号化して保存）
CREATE TABLE IF NOT EXISTS instagram_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    encrypted_access_token TEXT NOT NULL,  -- AES-256-GCMで暗号化
    token_type TEXT,                       -- Bearer等
    scopes TEXT[],                         -- 付与されたスコープ
    expires_at TIMESTAMPTZ,                -- トークン失効日時
    last_refreshed_at TIMESTAMPTZ,         -- 最終リフレッシュ日時
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_instagram_credentials_expires_at 
    ON instagram_credentials(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instagram_credentials_last_refreshed 
    ON instagram_credentials(last_refreshed_at DESC);

-- RLS有効化
ALTER TABLE instagram_credentials ENABLE ROW LEVEL SECURITY;

-- updated_atトリガー
CREATE TRIGGER update_instagram_credentials_updated_at
    BEFORE UPDATE ON instagram_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. instagram_fetch_cursors テーブル
-- ============================================
-- 取得カーソル（差分取得の基準）
CREATE TABLE IF NOT EXISTS instagram_fetch_cursors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    media_last_fetched_at TIMESTAMPTZ,     -- メディア最終取得日時
    stories_last_fetched_at TIMESTAMPTZ,   -- ストーリー最終取得日時
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE instagram_fetch_cursors ENABLE ROW LEVEL SECURITY;

-- updated_atトリガー
CREATE TRIGGER update_instagram_fetch_cursors_updated_at
    BEFORE UPDATE ON instagram_fetch_cursors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. instagram_media テーブル
-- ============================================
-- 投稿メディア（Bot用、将来の取得データ格納先）
CREATE TABLE IF NOT EXISTS instagram_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    ig_media_id TEXT NOT NULL,             -- Instagram側のメディアID
    media_type TEXT,                       -- IMAGE/VIDEO/CAROUSEL_ALBUM等
    permalink TEXT,                        -- 投稿URL
    media_url TEXT,                        -- メディアファイルURL
    thumbnail_url TEXT,                    -- サムネイルURL
    caption TEXT,                          -- キャプション
    posted_at TIMESTAMPTZ,                 -- 投稿日時
    raw JSONB,                             -- APIレスポンス全体（必要に応じて）
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(account_id, ig_media_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_instagram_media_account_posted 
    ON instagram_media(account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_media_ig_media_id 
    ON instagram_media(ig_media_id);
CREATE INDEX IF NOT EXISTS idx_instagram_media_posted_at 
    ON instagram_media(posted_at DESC);

-- RLS有効化
ALTER TABLE instagram_media ENABLE ROW LEVEL SECURITY;

-- updated_atトリガー
CREATE TRIGGER update_instagram_media_updated_at
    BEFORE UPDATE ON instagram_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. instagram_stories テーブル
-- ============================================
-- ストーリー（Bot用）
CREATE TABLE IF NOT EXISTS instagram_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    ig_story_id TEXT NOT NULL,             -- Instagram側のストーリーID
    media_type TEXT,                       -- IMAGE/VIDEO
    permalink TEXT,
    media_url TEXT,
    posted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,                -- ストーリー寿命（24時間）
    raw JSONB,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(account_id, ig_story_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_instagram_stories_account_posted 
    ON instagram_stories(account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_stories_expires_at 
    ON instagram_stories(expires_at) WHERE expires_at IS NOT NULL;

-- RLS有効化
ALTER TABLE instagram_stories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. instagram_job_runs テーブル
-- ============================================
-- ジョブ実行ログ（Bot/更新タスクの履歴）
CREATE TABLE IF NOT EXISTS instagram_job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,                -- fetch_media/fetch_stories/refresh_tokens等
    account_id UUID REFERENCES instagram_accounts(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running', -- running/success/failure
    error_message TEXT,
    details JSONB,                         -- 件数、レート制限、APIレスポンス等
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_instagram_job_runs_job_name 
    ON instagram_job_runs(job_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_job_runs_account 
    ON instagram_job_runs(account_id, started_at DESC) WHERE account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instagram_job_runs_status 
    ON instagram_job_runs(status, started_at DESC);

-- RLS有効化
ALTER TABLE instagram_job_runs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLSポリシー（将来の認証対応用の下地）
-- ============================================
-- 現時点ではSERVICE_ROLE_KEYを使用するため、ポリシーは不要
-- 将来ユーザー認証を追加する場合に備えて有効化のみ

-- 例: 認証なしでは全拒否（デフォルト）
-- CREATE POLICY "Deny all for anonymous" ON instagram_accounts FOR ALL USING (false);
-- CREATE POLICY "Deny all for anonymous" ON instagram_credentials FOR ALL USING (false);

-- 将来的には auth.uid() を使ったポリシーを追加可能:
-- CREATE POLICY "Allow authenticated users" ON instagram_accounts 
--     FOR SELECT USING (auth.role() = 'authenticated');

COMMIT;

-- ============================================
-- セットアップ完了
-- ============================================
-- 以下のコマンドでテーブル確認:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--
-- RLS確認:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
