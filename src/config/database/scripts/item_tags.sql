-- アイテム（予定・記録）とタグの中間テーブル

-- item_tags テーブル作成
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'record', 'task')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 複合ユニーク制約（同じアイテムに同じタグは一度だけ）
  UNIQUE(item_id, tag_id, item_type, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_user_id ON item_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item_type ON item_tags(item_type);
CREATE INDEX IF NOT EXISTS idx_item_tags_tagged_at ON item_tags(tagged_at);

-- 複合インデックス（フィルタリング用）
CREATE INDEX IF NOT EXISTS idx_item_tags_user_type_tag ON item_tags(user_id, item_type, tag_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_user_item ON item_tags(user_id, item_id, item_type);

-- RLS（Row Level Security）有効化
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー作成
CREATE POLICY "Users can view their own item tags" ON item_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own item tags" ON item_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own item tags" ON item_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own item tags" ON item_tags
  FOR DELETE USING (auth.uid() = user_id);

-- タグ使用統計ビュー
CREATE OR REPLACE VIEW tag_usage_stats AS
SELECT 
  t.id,
  t.name,
  t.path,
  t.level,
  t.color,
  t.is_active,
  COUNT(it.id) as usage_count,
  COUNT(CASE WHEN it.item_type = 'task' THEN 1 END) as task_count,
  COUNT(CASE WHEN it.item_type = 'event' THEN 1 END) as event_count,
  COUNT(CASE WHEN it.item_type = 'record' THEN 1 END) as record_count,
  MAX(it.tagged_at) as last_used_at,
  t.created_at,
  t.updated_at
FROM tags t
LEFT JOIN item_tags it ON t.id = it.tag_id
GROUP BY t.id, t.name, t.path, t.level, t.color, t.is_active, t.created_at, t.updated_at;

-- 階層タグ使用統計ビュー（親タグの使用数に子タグも含める）
CREATE OR REPLACE VIEW tag_hierarchy_usage_stats AS
WITH RECURSIVE tag_hierarchy AS (
  -- ベースケース: 全てのタグ
  SELECT 
    id, 
    name, 
    parent_id, 
    path, 
    level,
    color,
    is_active,
    ARRAY[id] as tag_path,
    0 as depth
  FROM tags
  
  UNION ALL
  
  -- 再帰: 子タグを探す
  SELECT 
    t.id,
    t.name,
    t.parent_id,
    t.path,
    t.level,
    t.color,
    t.is_active,
    th.tag_path || t.id,
    th.depth + 1
  FROM tags t
  JOIN tag_hierarchy th ON t.parent_id = th.id
  WHERE th.depth < 3 -- 無限再帰防止
),
usage_with_hierarchy AS (
  SELECT 
    th.id,
    th.name,
    th.path,
    th.level,
    th.color,
    th.is_active,
    -- 直接の使用数
    COUNT(CASE WHEN it.tag_id = th.id THEN 1 END) as direct_usage,
    -- 階層内の全使用数（子タグも含む）
    COUNT(CASE WHEN it.tag_id = ANY(th.tag_path) THEN 1 END) as total_usage,
    COUNT(CASE WHEN it.tag_id = ANY(th.tag_path) AND it.item_type = 'task' THEN 1 END) as task_count,
    COUNT(CASE WHEN it.tag_id = ANY(th.tag_path) AND it.item_type = 'event' THEN 1 END) as event_count,
    COUNT(CASE WHEN it.tag_id = ANY(th.tag_path) AND it.item_type = 'record' THEN 1 END) as record_count,
    MAX(CASE WHEN it.tag_id = ANY(th.tag_path) THEN it.tagged_at END) as last_used_at
  FROM tag_hierarchy th
  LEFT JOIN item_tags it ON it.tag_id = ANY(th.tag_path)
  GROUP BY th.id, th.name, th.path, th.level, th.color, th.is_active
)
SELECT DISTINCT ON (id)
  id,
  name,
  path,
  level,
  color,
  is_active,
  direct_usage,
  total_usage as usage_count,
  task_count,
  event_count,
  record_count,
  last_used_at
FROM usage_with_hierarchy
ORDER BY id, total_usage DESC;

-- タグトレンド分析用ビュー（期間別使用統計）
CREATE OR REPLACE VIEW tag_usage_trends AS
SELECT 
  t.id,
  t.name,
  t.path,
  DATE_TRUNC('day', it.tagged_at) as date,
  DATE_TRUNC('week', it.tagged_at) as week,
  DATE_TRUNC('month', it.tagged_at) as month,
  COUNT(*) as daily_count,
  COUNT(CASE WHEN it.item_type = 'task' THEN 1 END) as daily_task_count,
  COUNT(CASE WHEN it.item_type = 'event' THEN 1 END) as daily_event_count,
  COUNT(CASE WHEN it.item_type = 'record' THEN 1 END) as daily_record_count
FROM tags t
LEFT JOIN item_tags it ON t.id = it.tag_id
WHERE it.tagged_at >= NOW() - INTERVAL '30 days'
GROUP BY t.id, t.name, t.path, DATE_TRUNC('day', it.tagged_at), DATE_TRUNC('week', it.tagged_at), DATE_TRUNC('month', it.tagged_at)
ORDER BY t.name, date DESC;

-- 人気タグランキングビュー
CREATE OR REPLACE VIEW popular_tags AS
SELECT 
  t.id,
  t.name,
  t.path,
  t.level,
  t.color,
  COUNT(it.id) as usage_count,
  COUNT(DISTINCT it.item_id) as unique_items,
  COUNT(CASE WHEN it.tagged_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_usage,
  MAX(it.tagged_at) as last_used_at,
  RANK() OVER (ORDER BY COUNT(it.id) DESC) as usage_rank,
  RANK() OVER (ORDER BY COUNT(CASE WHEN it.tagged_at >= NOW() - INTERVAL '7 days' THEN 1 END) DESC) as recent_rank
FROM tags t
LEFT JOIN item_tags it ON t.id = it.tag_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.path, t.level, t.color
HAVING COUNT(it.id) > 0
ORDER BY usage_count DESC;

-- 更新時刻の自動更新トリガー
CREATE OR REPLACE FUNCTION update_item_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_item_tags_updated_at
  BEFORE UPDATE ON item_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_item_tags_updated_at();

-- サンプルデータ挿入関数（開発用）
CREATE OR REPLACE FUNCTION insert_sample_item_tags(user_uuid UUID DEFAULT NULL)
RETURNS void AS $$
DECLARE
  sample_user_id UUID;
  tag_work UUID;
  tag_project_a UUID;
  tag_personal UUID;
BEGIN
  -- ユーザーIDが指定されていない場合は現在のユーザーを使用
  IF user_uuid IS NULL THEN
    sample_user_id := auth.uid();
  ELSE
    sample_user_id := user_uuid;
  END IF;
  
  -- サンプルタグIDを取得（存在しない場合は作成）
  SELECT id INTO tag_work FROM tags WHERE name = 'Work' AND user_id = sample_user_id LIMIT 1;
  SELECT id INTO tag_project_a FROM tags WHERE name = 'ProjectA' AND user_id = sample_user_id LIMIT 1;
  SELECT id INTO tag_personal FROM tags WHERE name = 'Personal' AND user_id = sample_user_id LIMIT 1;
  
  -- タグが存在しない場合は作成
  IF tag_work IS NULL THEN
    INSERT INTO tags (name, user_id, color, level, path) 
    VALUES ('Work', sample_user_id, '#3B82F6', 0, '#Work') 
    RETURNING id INTO tag_work;
  END IF;
  
  IF tag_project_a IS NULL THEN
    INSERT INTO tags (name, parent_id, user_id, color, level, path) 
    VALUES ('ProjectA', tag_work, sample_user_id, '#10B981', 1, '#Work/ProjectA') 
    RETURNING id INTO tag_project_a;
  END IF;
  
  IF tag_personal IS NULL THEN
    INSERT INTO tags (name, user_id, color, level, path) 
    VALUES ('Personal', sample_user_id, '#F59E0B', 0, '#Personal') 
    RETURNING id INTO tag_personal;
  END IF;
  
  -- サンプルのitem_tags挿入
  INSERT INTO item_tags (item_id, tag_id, item_type, user_id, tagged_at) VALUES
  (gen_random_uuid(), tag_work, 'task', sample_user_id, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), tag_project_a, 'task', sample_user_id, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), tag_work, 'event', sample_user_id, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), tag_personal, 'record', sample_user_id, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), tag_work, 'task', sample_user_id, NOW() - INTERVAL '5 days')
  ON CONFLICT (item_id, tag_id, item_type, user_id) DO NOTHING;
  
  RAISE NOTICE 'Sample item_tags inserted for user %', sample_user_id;
END;
$$ LANGUAGE plpgsql;

-- 使用例のコメント
/*
-- サンプルデータ挿入
SELECT insert_sample_item_tags();

-- タグ使用統計確認
SELECT * FROM tag_usage_stats ORDER BY usage_count DESC;

-- 階層統計確認
SELECT * FROM tag_hierarchy_usage_stats ORDER BY usage_count DESC;

-- 人気タグ確認
SELECT * FROM popular_tags LIMIT 10;

-- 特定のタグが付いたアイテム検索
SELECT it.*, t.name as tag_name, t.path as tag_path
FROM item_tags it
JOIN tags t ON it.tag_id = t.id
WHERE t.path LIKE '#Work%'
ORDER BY it.tagged_at DESC;
*/