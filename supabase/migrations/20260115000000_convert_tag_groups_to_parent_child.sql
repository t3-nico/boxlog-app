-- ========================================
-- Convert Tag Groups to Parent-Child Relationship
-- 作成日: 2026-01-15
-- 目的: TagGroup と Tag の別エンティティ構造から、Tag 同士の親子関係に変更
--
-- 変更点:
-- 1. tags.parent_id カラム追加（自己参照FK）
-- 2. tag_groups のデータを親タグとして tags に移行
-- 3. 既存タグの group_id を parent_id に移行
-- 4. group_id カラムと tag_groups テーブルを削除
-- 5. 1階層のみの制約を追加
-- ========================================

-- ========================================
-- Step 1: parent_id と sort_order カラムを追加
-- ========================================
-- parent_id カラム
ALTER TABLE tags ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES tags(id) ON DELETE SET NULL;

-- sort_order カラム（tag_groups からのデータ移行用）
ALTER TABLE tags ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- parent_id 用のインデックス
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);

-- sort_order 用のインデックス
CREATE INDEX IF NOT EXISTS idx_tags_sort_order ON tags(sort_order);

-- ========================================
-- Step 2: tag_groups のデータを親タグとして移行
-- ========================================
-- tag_groups のレコードを tags テーブルに挿入
-- IDをそのまま維持して、後で子タグの parent_id として参照できるようにする
INSERT INTO tags (id, user_id, name, color, description, sort_order, is_active, created_at, updated_at)
SELECT
  id,
  user_id,
  name,
  color,
  description,
  sort_order,
  true,  -- is_active
  created_at,
  updated_at
FROM tag_groups
ON CONFLICT (id) DO NOTHING;  -- 既に同じIDのタグが存在する場合はスキップ

-- ========================================
-- Step 3: 既存タグの group_id を parent_id に移行
-- ========================================
UPDATE tags
SET parent_id = group_id
WHERE group_id IS NOT NULL;

-- ========================================
-- Step 4: group_id カラムとインデックスを削除
-- ========================================
DROP INDEX IF EXISTS idx_tags_group_id;
ALTER TABLE tags DROP COLUMN IF EXISTS group_id;

-- ========================================
-- Step 5: tag_groups テーブルを削除
-- ========================================
-- まずトリガーを削除
DROP TRIGGER IF EXISTS trigger_update_tag_groups_updated_at ON tag_groups;

-- RLSポリシーを削除
DROP POLICY IF EXISTS "Users can view own tag groups" ON tag_groups;
DROP POLICY IF EXISTS "Users can insert own tag groups" ON tag_groups;
DROP POLICY IF EXISTS "Users can update own tag groups" ON tag_groups;
DROP POLICY IF EXISTS "Users can delete own tag groups" ON tag_groups;

-- インデックスを削除
DROP INDEX IF EXISTS idx_tag_groups_user_id;
DROP INDEX IF EXISTS idx_tag_groups_slug;
DROP INDEX IF EXISTS idx_tag_groups_sort_order;

-- テーブルを削除
DROP TABLE IF EXISTS tag_groups;

-- ========================================
-- Step 6: 階層制約トリガー（1階層のみ許可）
-- ========================================
-- 親タグ自体が子であることを禁止するトリガー
CREATE OR REPLACE FUNCTION check_tag_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- 親タグが設定されている場合のみチェック
  IF NEW.parent_id IS NOT NULL THEN
    -- 親タグが既に子タグ（parent_id を持つ）の場合は拒否
    IF EXISTS (
      SELECT 1 FROM tags WHERE id = NEW.parent_id AND parent_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Maximum nesting depth is 1 level. Parent tag cannot be a child of another tag.';
    END IF;

    -- 自分自身を親にすることを禁止
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'A tag cannot be its own parent.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
CREATE TRIGGER enforce_tag_hierarchy
BEFORE INSERT OR UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION check_tag_hierarchy();

-- ========================================
-- Step 7: 子タグを持つタグを親にできない制約
-- ========================================
-- 子タグを持つタグを別の親の子にしようとした場合に拒否
CREATE OR REPLACE FUNCTION check_tag_has_children()
RETURNS TRIGGER AS $$
BEGIN
  -- 親タグが設定されようとしている場合
  IF NEW.parent_id IS NOT NULL AND (OLD.parent_id IS NULL OR OLD.parent_id != NEW.parent_id) THEN
    -- このタグが子タグを持っている場合は拒否
    IF EXISTS (
      SELECT 1 FROM tags WHERE parent_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Cannot move a tag with children to be a child of another tag.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
CREATE TRIGGER enforce_tag_no_children_as_child
BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION check_tag_has_children();

-- ========================================
-- コメント追加
-- ========================================
COMMENT ON COLUMN tags.parent_id IS 'Parent tag ID for hierarchical organization. NULL means root level tag. Maximum nesting depth is 1 level.';
