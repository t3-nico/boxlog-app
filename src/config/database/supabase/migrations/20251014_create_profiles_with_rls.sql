-- =====================================================
-- profiles テーブル作成とRLS設定
-- =====================================================
-- 作成日: 2025-10-14
-- 目的: ユーザープロフィール管理とRow Level Security設定
-- =====================================================

-- 1. profiles テーブル作成
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- ユニーク制約
  CONSTRAINT username_unique UNIQUE (username),
  CONSTRAINT email_unique UNIQUE (email)
);

-- 2. インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- 3. updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. 新規ユーザー作成時にprofilesレコードを自動生成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のトリガーを削除してから作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Row Level Security (RLS) 設定
-- =====================================================

-- 5. RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシー: SELECT（全員が全プロフィールを閲覧可能）
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 7. RLSポリシー: INSERT（認証済みユーザーのみ、自分のプロフィールのみ作成可能）
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 8. RLSポリシー: UPDATE（認証済みユーザーのみ、自分のプロフィールのみ更新可能）
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 9. RLSポリシー: DELETE（認証済みユーザーのみ、自分のプロフィールのみ削除可能）
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- コメント追加（ドキュメント化）
-- =====================================================

COMMENT ON TABLE public.profiles IS 'ユーザープロフィール情報。auth.usersと1:1で紐づく';
COMMENT ON COLUMN public.profiles.id IS 'auth.users.idと同一のUUID';
COMMENT ON COLUMN public.profiles.email IS 'ユーザーのメールアドレス';
COMMENT ON COLUMN public.profiles.username IS 'ユーザー名（ユニーク、オプション）';
COMMENT ON COLUMN public.profiles.full_name IS 'フルネーム（オプション）';
COMMENT ON COLUMN public.profiles.avatar_url IS 'アバター画像のURL（オプション）';
COMMENT ON COLUMN public.profiles.bio IS '自己紹介文（オプション）';
