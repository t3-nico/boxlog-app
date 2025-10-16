-- =====================================================
-- avatars バケット作成とRLS設定
-- =====================================================
-- 作成日: 2025-10-16
-- 目的: ユーザーアバター画像用のストレージバケット
-- =====================================================

-- 1. avatars バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS有効化
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. RLSポリシー: SELECT（全員がアバターを閲覧可能）
CREATE POLICY "Public avatars are viewable by everyone"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- 4. RLSポリシー: INSERT（認証済みユーザーのみ、自分のアバターのみアップロード可能）
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. RLSポリシー: UPDATE（認証済みユーザーのみ、自分のアバターのみ更新可能）
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. RLSポリシー: DELETE（認証済みユーザーのみ、自分のアバターのみ削除可能）
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- コメント
-- =====================================================
-- アバター画像のパス形式: avatars/{user_id}/avatar.{ext}
-- 例: avatars/123e4567-e89b-12d3-a456-426614174000/avatar.jpg
