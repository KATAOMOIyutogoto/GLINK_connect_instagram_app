/**
 * Supabase Database型定義
 * 
 * 注: 本来は `supabase gen types typescript` で自動生成すべきですが、
 * 最小構成として手動で定義しています。
 */

export interface Database {
  public: {
    Tables: {
      instagram_accounts: {
        Row: {
          id: string;
          ig_user_id: string;
          ig_username: string | null;
          account_type: string | null;
          connected_at: string;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ig_user_id: string;
          ig_username?: string | null;
          account_type?: string | null;
          connected_at?: string;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ig_user_id?: string;
          ig_username?: string | null;
          account_type?: string | null;
          connected_at?: string;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      instagram_credentials: {
        Row: {
          id: string;
          account_id: string;
          encrypted_access_token: string;
          token_type: string | null;
          scopes: string[] | null;
          expires_at: string | null;
          last_refreshed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          encrypted_access_token: string;
          token_type?: string | null;
          scopes?: string[] | null;
          expires_at?: string | null;
          last_refreshed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          encrypted_access_token?: string;
          token_type?: string | null;
          scopes?: string[] | null;
          expires_at?: string | null;
          last_refreshed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      instagram_fetch_cursors: {
        Row: {
          id: string;
          account_id: string;
          media_last_fetched_at: string | null;
          stories_last_fetched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          media_last_fetched_at?: string | null;
          stories_last_fetched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          media_last_fetched_at?: string | null;
          stories_last_fetched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      instagram_media: {
        Row: {
          id: string;
          account_id: string;
          ig_media_id: string;
          media_type: string | null;
          permalink: string | null;
          media_url: string | null;
          thumbnail_url: string | null;
          caption: string | null;
          posted_at: string | null;
          raw: any | null;
          first_seen_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          ig_media_id: string;
          media_type?: string | null;
          permalink?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          caption?: string | null;
          posted_at?: string | null;
          raw?: any | null;
          first_seen_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          ig_media_id?: string;
          media_type?: string | null;
          permalink?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          caption?: string | null;
          posted_at?: string | null;
          raw?: any | null;
          first_seen_at?: string;
          updated_at?: string;
        };
      };
      instagram_stories: {
        Row: {
          id: string;
          account_id: string;
          ig_story_id: string;
          media_type: string | null;
          permalink: string | null;
          media_url: string | null;
          posted_at: string | null;
          expires_at: string | null;
          raw: any | null;
          first_seen_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          ig_story_id: string;
          media_type?: string | null;
          permalink?: string | null;
          media_url?: string | null;
          posted_at?: string | null;
          expires_at?: string | null;
          raw?: any | null;
          first_seen_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          ig_story_id?: string;
          media_type?: string | null;
          permalink?: string | null;
          media_url?: string | null;
          posted_at?: string | null;
          expires_at?: string | null;
          raw?: any | null;
          first_seen_at?: string;
        };
      };
      instagram_job_runs: {
        Row: {
          id: string;
          job_name: string;
          account_id: string | null;
          started_at: string;
          finished_at: string | null;
          status: string;
          error_message: string | null;
          details: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_name: string;
          account_id?: string | null;
          started_at?: string;
          finished_at?: string | null;
          status?: string;
          error_message?: string | null;
          details?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_name?: string;
          account_id?: string | null;
          started_at?: string;
          finished_at?: string | null;
          status?: string;
          error_message?: string | null;
          details?: any | null;
          created_at?: string;
        };
      };
    };
  };
}
