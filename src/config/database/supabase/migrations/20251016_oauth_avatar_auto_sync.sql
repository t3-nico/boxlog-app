-- =====================================================
-- OAuth認証時のアバター画像自動取得
-- =====================================================
-- 作成日: 2025-10-16
-- 目的: Google/Facebook等のOAuthプロバイダーから
--       ユーザーのアバター画像とフルネームを自動取得
-- =====================================================

-- 1. handle_new_user() 関数を更新
-- OAuth認証時に raw_user_meta_data から以下を取得:
--   - avatar_url: Google/Facebookのプロフィール画像
--   - full_name: OAuthプロバイダーのフルネーム
--   - username: カスタムまたはemail@前から自動生成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- username優先順位: カスタム > email@前
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    -- OAuthのフルネームを自動取得（Google/Facebook/Apple）
    NEW.raw_user_meta_data->>'full_name',
    -- OAuthのアバター画像URLを自動取得（Google/Facebook）
    -- ユーザーは後でSettings > Accountで変更可能
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- コメント追加（ドキュメント化）
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS
'新規ユーザー作成時にprofilesレコードを自動生成。
OAuthプロバイダー（Google/Facebook/Apple）からアバター画像とフルネームを自動取得。
ユーザーはSettings > Accountで後から変更可能。';
