-- パスワード履歴機能のためのテーブル
--
-- OWASP推奨セキュリティ要件:
-- - 過去3〜5個のパスワード再利用を禁止
-- - ハッシュ化されたパスワードのみ保存
-- - 古い履歴は自動削除（最新5個のみ保持）
--
-- 使い方:
-- Supabase ダッシュボード > SQL Editor で以下を実行

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. インデックス作成（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_password_history_user_id
  ON public.password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at
  ON public.password_history(user_id, created_at DESC);

-- 3. Row Level Security (RLS) 有効化
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS ポリシー: サービスロールのみアクセス可能
-- ユーザーは自分のパスワード履歴を直接見ることができない（セキュリティ上の理由）
CREATE POLICY "Service role can manage password history"
  ON public.password_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. 自動削除関数: 各ユーザーの最新5個以外の履歴を削除
CREATE OR REPLACE FUNCTION public.cleanup_old_password_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 新しいレコード挿入後、そのユーザーの古い履歴を削除（最新5個のみ保持）
  DELETE FROM public.password_history
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id
    FROM public.password_history
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 5
  );

  RETURN NEW;
END;
$$;

-- 6. トリガー作成: レコード挿入時に自動削除
CREATE TRIGGER cleanup_password_history_trigger
  AFTER INSERT ON public.password_history
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_password_history();

-- 7. パスワード再利用チェック用のRPC関数
CREATE OR REPLACE FUNCTION public.check_password_reuse(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  -- 最新5個の履歴を取得してチェック
  FOR v_hash IN
    SELECT password_hash
    FROM public.password_history
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 5
  LOOP
    -- bcrypt検証: crypt(password, hash) = hash の場合、パスワードが一致
    IF crypt(p_new_password, v_hash) = v_hash THEN
      RETURN true; -- 過去のパスワードと一致
    END IF;
  END LOOP;

  RETURN false; -- すべての履歴と一致しない
EXCEPTION
  WHEN OTHERS THEN
    -- エラー時はfalseを返す（安全側に倒す）
    RETURN false;
END;
$$;

-- 8. パスワード履歴追加用のRPC関数
CREATE OR REPLACE FUNCTION public.add_password_to_history(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- bcryptでハッシュ化して保存（gen_salt('bf')でbcryptソルト生成）
  INSERT INTO public.password_history (user_id, password_hash)
  VALUES (p_user_id, crypt(p_new_password, gen_salt('bf')));
EXCEPTION
  WHEN OTHERS THEN
    -- エラー時はログのみ（パスワード変更自体は成功させる）
    RAISE WARNING 'Failed to add password to history: %', SQLERRM;
END;
$$;

-- 9. コメント追加
COMMENT ON TABLE public.password_history IS 'パスワード履歴（過去のパスワード再利用防止用）';
COMMENT ON COLUMN public.password_history.user_id IS 'ユーザーID（auth.usersへの参照）';
COMMENT ON COLUMN public.password_history.password_hash IS 'ハッシュ化されたパスワード';
COMMENT ON COLUMN public.password_history.created_at IS 'パスワード作成日時';
COMMENT ON FUNCTION public.check_password_reuse IS 'パスワード再利用チェック関数（過去5個と比較）';
COMMENT ON FUNCTION public.add_password_to_history IS 'パスワード履歴追加関数（bcryptハッシュ化）';
