-- アカウントロックアウト機能のためのログイン試行トラッキングテーブル
--
-- セキュリティ要件:
-- - 5回失敗: 15分間ロックアウト
-- - 10回失敗: 1時間ロックアウト
-- - 古いレコードは自動削除（24時間後）
--
-- 使い方:
-- Supabase ダッシュボード > SQL Editor で以下を実行

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_successful BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. インデックス作成（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_login_attempts_email
  ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempt_time
  ON public.login_attempts(attempt_time DESC);

-- 3. Row Level Security (RLS) 有効化
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- 4. RLS ポリシー: 管理者とサービスロールのみアクセス可能
-- ユーザーは自分のログイン試行履歴を見ることができない（セキュリティ上の理由）
CREATE POLICY "Service role can manage login attempts"
  ON public.login_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. 自動削除関数: 24時間以上古いレコードを削除
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 6. 自動削除のスケジュール設定（pg_cron拡張が必要）
-- Supabaseの場合、Database > Extensions で pg_cron を有効化してから実行
-- または、Supabase Edge Functions で定期実行を実装

-- 代替案: トリガーで自動削除（レコード挿入時に古いデータを削除）
CREATE OR REPLACE FUNCTION public.trigger_cleanup_login_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 10%の確率で古いレコードを削除（パフォーマンス考慮）
  IF random() < 0.1 THEN
    DELETE FROM public.login_attempts
    WHERE created_at < NOW() - INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_login_attempts_trigger
  AFTER INSERT ON public.login_attempts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_login_attempts();

-- 7. コメント追加
COMMENT ON TABLE public.login_attempts IS 'ログイン試行履歴（アカウントロックアウト機能用）';
COMMENT ON COLUMN public.login_attempts.email IS 'ログイン試行されたメールアドレス';
COMMENT ON COLUMN public.login_attempts.attempt_time IS 'ログイン試行時刻';
COMMENT ON COLUMN public.login_attempts.is_successful IS 'ログイン成功フラグ';
COMMENT ON COLUMN public.login_attempts.ip_address IS 'IPアドレス（オプション）';
COMMENT ON COLUMN public.login_attempts.user_agent IS 'User-Agent（オプション）';
