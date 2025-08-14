-- 3階層対応タグシステム
-- 作成日: 2025-01-07

-- tags テーブル
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#6B7280',
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 2),
  path TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 制約とインデックス
-- 同一親の下で同じ名前のタグは重複不可
CREATE UNIQUE INDEX idx_tags_unique_name 
ON tags(user_id, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::UUID), name);

-- パス検索用インデックス
CREATE INDEX idx_tags_path ON tags(path);
CREATE INDEX idx_tags_user_level ON tags(user_id, level);
CREATE INDEX idx_tags_parent ON tags(parent_id);
CREATE INDEX idx_tags_user_active ON tags(user_id, is_active);

-- 階層レベル制約（最大3階層）
CREATE OR REPLACE FUNCTION check_tag_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- レベル0（ルート）の場合、parent_idはNULL
  IF NEW.level = 0 AND NEW.parent_id IS NOT NULL THEN
    RAISE EXCEPTION 'Root level tags cannot have a parent';
  END IF;
  
  -- レベル1以上の場合、parent_idは必須
  IF NEW.level > 0 AND NEW.parent_id IS NULL THEN
    RAISE EXCEPTION 'Non-root tags must have a parent';
  END IF;
  
  -- 親タグのレベルチェック
  IF NEW.parent_id IS NOT NULL THEN
    DECLARE
      parent_level INTEGER;
    BEGIN
      SELECT level INTO parent_level FROM tags WHERE id = NEW.parent_id;
      
      -- 親タグが存在しない場合
      IF parent_level IS NULL THEN
        RAISE EXCEPTION 'Parent tag does not exist';
      END IF;
      
      -- 親タグのレベル + 1 でなければエラー
      IF NEW.level != parent_level + 1 THEN
        RAISE EXCEPTION 'Tag level must be parent level + 1';
      END IF;
      
      -- 最大3階層制約
      IF parent_level >= 2 THEN
        RAISE EXCEPTION 'Maximum tag hierarchy depth is 3 levels';
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_tag_hierarchy
  BEFORE INSERT OR UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION check_tag_hierarchy();

-- パス生成関数
CREATE OR REPLACE FUNCTION generate_tag_path(tag_id UUID)
RETURNS TEXT AS $$
DECLARE
  path_parts TEXT[];
  current_tag RECORD;
BEGIN
  -- タグの階層を辿ってパスを構築
  WITH RECURSIVE tag_hierarchy AS (
    -- 指定されたタグから開始
    SELECT id, name, parent_id, level, 0 as depth
    FROM tags 
    WHERE id = tag_id
    
    UNION ALL
    
    -- 親タグを再帰的に取得
    SELECT p.id, p.name, p.parent_id, p.level, th.depth + 1
    FROM tags p
    INNER JOIN tag_hierarchy th ON p.id = th.parent_id
  )
  SELECT array_agg(name ORDER BY level) INTO path_parts
  FROM tag_hierarchy;
  
  -- パス文字列を生成（例: #work/projecta/sprint1）
  IF path_parts IS NOT NULL THEN
    RETURN '#' || array_to_string(path_parts, '/');
  ELSE
    RETURN '#';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- パス自動更新トリガー
CREATE OR REPLACE FUNCTION update_tag_path()
RETURNS TRIGGER AS $$
BEGIN
  -- パスを自動生成
  NEW.path = generate_tag_path(NEW.id);
  
  -- 子タグのパスも更新（名前変更時）
  IF TG_OP = 'UPDATE' AND OLD.name != NEW.name THEN
    UPDATE tags 
    SET path = generate_tag_path(id),
        updated_at = NOW()
    WHERE id IN (
      WITH RECURSIVE children AS (
        SELECT id FROM tags WHERE parent_id = NEW.id
        UNION ALL
        SELECT t.id FROM tags t
        INNER JOIN children c ON t.parent_id = c.id
      )
      SELECT id FROM children
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_path
  BEFORE INSERT OR UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_path();

-- updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 設定
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のタグのみアクセス可能
CREATE POLICY "Users can manage their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-- タグと予定・記録の関連テーブル
CREATE TABLE IF NOT EXISTS tag_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'event', 'record')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- タグ関連のインデックス
CREATE INDEX idx_tag_associations_tag ON tag_associations(tag_id);
CREATE INDEX idx_tag_associations_entity ON tag_associations(entity_type, entity_id);
CREATE INDEX idx_tag_associations_user ON tag_associations(user_id);

-- 同一エンティティに同じタグは1つまで
CREATE UNIQUE INDEX idx_tag_associations_unique 
ON tag_associations(tag_id, entity_type, entity_id);

-- タグ関連のRLS
ALTER TABLE tag_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tag associations" ON tag_associations
  FOR ALL USING (auth.uid() = user_id);

-- 便利なビュー：階層構造付きタグ
CREATE OR REPLACE VIEW tags_with_hierarchy AS
WITH RECURSIVE tag_tree AS (
  -- ルートタグ
  SELECT 
    id,
    name,
    parent_id,
    user_id,
    color,
    level,
    path,
    description,
    is_active,
    created_at,
    updated_at,
    ARRAY[name] as hierarchy_names,
    ARRAY[id] as hierarchy_ids
  FROM tags 
  WHERE level = 0
  
  UNION ALL
  
  -- 子タグ
  SELECT 
    t.id,
    t.name,
    t.parent_id,
    t.user_id,
    t.color,
    t.level,
    t.path,
    t.description,
    t.is_active,
    t.created_at,
    t.updated_at,
    tt.hierarchy_names || t.name,
    tt.hierarchy_ids || t.id
  FROM tags t
  INNER JOIN tag_tree tt ON t.parent_id = tt.id
)
SELECT 
  *,
  array_length(hierarchy_names, 1) as depth,
  hierarchy_names[1] as root_name,
  CASE 
    WHEN array_length(hierarchy_names, 1) >= 2 THEN hierarchy_names[2]
    ELSE NULL 
  END as level1_name,
  CASE 
    WHEN array_length(hierarchy_names, 1) >= 3 THEN hierarchy_names[3]
    ELSE NULL 
  END as level2_name
FROM tag_tree
ORDER BY hierarchy_names;

-- タグ使用統計ビュー
CREATE OR REPLACE VIEW tag_usage_stats AS
SELECT 
  t.id,
  t.name,
  t.path,
  t.level,
  t.color,
  COUNT(ta.id) as usage_count,
  COUNT(ta.id) FILTER (WHERE ta.entity_type = 'task') as task_count,
  COUNT(ta.id) FILTER (WHERE ta.entity_type = 'event') as event_count,
  COUNT(ta.id) FILTER (WHERE ta.entity_type = 'record') as record_count,
  MAX(ta.created_at) as last_used_at
FROM tags t
LEFT JOIN tag_associations ta ON t.id = ta.tag_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.path, t.level, t.color
ORDER BY usage_count DESC, t.name;

-- サンプルデータ挿入関数
CREATE OR REPLACE FUNCTION insert_sample_tags(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  work_id UUID;
  personal_id UUID;
  project_a_id UUID;
  project_b_id UUID;
  health_id UUID;
BEGIN
  -- レベル0タグ（ルート）
  INSERT INTO tags (name, user_id, level, color) 
  VALUES 
    ('Work', target_user_id, 0, '#3B82F6'),
    ('Personal', target_user_id, 0, '#10B981')
  RETURNING id INTO work_id, personal_id;
  
  -- レベル1タグ
  INSERT INTO tags (name, parent_id, user_id, level, color)
  VALUES 
    ('ProjectA', work_id, target_user_id, 1, '#6366F1'),
    ('ProjectB', work_id, target_user_id, 1, '#8B5CF6'),
    ('Health', personal_id, target_user_id, 1, '#EF4444')
  RETURNING id INTO project_a_id, project_b_id, health_id;
  
  -- レベル2タグ
  INSERT INTO tags (name, parent_id, user_id, level, color)
  VALUES 
    ('Sprint1', project_a_id, target_user_id, 2, '#EC4899'),
    ('Sprint2', project_a_id, target_user_id, 2, '#F59E0B'),
    ('Backend', project_b_id, target_user_id, 2, '#14B8A6'),
    ('Frontend', project_b_id, target_user_id, 2, '#F97316'),
    ('Exercise', health_id, target_user_id, 2, '#EF4444'),
    ('Nutrition', health_id, target_user_id, 2, '#84CC16');
END;
$$ LANGUAGE plpgsql;