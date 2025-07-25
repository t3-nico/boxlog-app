-- イベントテーブル
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- 計画された日時（統合されたタイムスタンプ）
  planned_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  
  -- ステータス管理（統一されたワークフロー）
  status TEXT DEFAULT 'inbox' CHECK (status IN ('inbox', 'planned', 'in_progress', 'completed', 'cancelled')),
  
  -- 優先度管理（アイゼンハワーマトリックス + 委譲・任意）
  priority TEXT CHECK (priority IN ('urgent', 'important', 'necessary', 'delegate', 'optional')),
  
  -- 繰り返し設定
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB,
  parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- サブタスク・チェックリスト機能
  items JSONB DEFAULT '[]'::jsonb,
  
  -- カスタマイズ
  color TEXT DEFAULT '#3b82f6',
  location TEXT,
  url TEXT,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- タグテーブル（簡素化）
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- イベント・タグ中間テーブル
CREATE TABLE event_tags (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

-- 活動履歴テーブル（変更追跡）
CREATE TABLE event_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- created, updated, status_changed, completed, etc.
  details JSONB, -- 変更内容の詳細
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ログ（時間記録）テーブル
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL, -- イベント削除時も記録は保持
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX ON events(user_id);
CREATE INDEX ON events(planned_start);
CREATE INDEX ON events(planned_start, planned_end);
CREATE INDEX ON events(user_id, planned_start);
CREATE INDEX ON events(status);
CREATE INDEX ON events(priority);
CREATE INDEX ON events(parent_event_id);

CREATE INDEX ON tags(user_id);
CREATE INDEX ON event_tags(event_id);
CREATE INDEX ON event_tags(tag_id);

CREATE INDEX ON event_histories(event_id);
CREATE INDEX ON event_histories(created_at);

CREATE INDEX ON logs(user_id);
CREATE INDEX ON logs(event_id);
CREATE INDEX ON logs(start_time);

-- 各テーブルのRLSを有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can manage their own events" ON events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own event_tags" ON event_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_tags.event_id 
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their event histories" ON event_histories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_histories.event_id 
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own logs" ON logs
  FOR ALL USING (auth.uid() = user_id);

-- 自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atの自動更新トリガー
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 履歴記録関数（改良版 - より詳細な変更追跡）
CREATE OR REPLACE FUNCTION record_event_history()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  details JSONB = '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type = 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- 変更内容に応じてaction_typeを詳細設定
    IF OLD.planned_start IS DISTINCT FROM NEW.planned_start OR 
       OLD.planned_end IS DISTINCT FROM NEW.planned_end THEN
      action_type = 'time_changed';
      details = jsonb_build_object(
        'before', jsonb_build_object('start', OLD.planned_start, 'end', OLD.planned_end),
        'after', jsonb_build_object('start', NEW.planned_start, 'end', NEW.planned_end)
      );
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
      action_type = 'status_changed';
      details = jsonb_build_object('before', OLD.status, 'after', NEW.status);
    ELSIF OLD.priority IS DISTINCT FROM NEW.priority THEN
      action_type = 'priority_changed';
      details = jsonb_build_object('before', OLD.priority, 'after', NEW.priority);
    ELSIF OLD.description IS DISTINCT FROM NEW.description THEN
      action_type = 'memo_updated';
    ELSIF OLD.items IS DISTINCT FROM NEW.items THEN
      action_type = 'checklist_updated';
    ELSE
      action_type = 'updated';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type = 'deleted';
    details = row_to_json(OLD)::jsonb;
  END IF;
  
  -- 履歴レコード挿入
  IF TG_OP = 'DELETE' THEN
    INSERT INTO event_histories (event_id, action_type, details, created_by)
    VALUES (OLD.id, action_type, details, OLD.user_id);
    RETURN OLD;
  ELSE
    INSERT INTO event_histories (event_id, action_type, details, created_by)
    VALUES (NEW.id, action_type, details, NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- イベント履歴記録トリガー
CREATE TRIGGER record_event_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION record_event_history();

-- ステータス自動更新関数
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS TRIGGER AS $$
BEGIN
  -- planned_startが設定されたらinbox→plannedへ
  IF NEW.planned_start IS NOT NULL AND OLD.status = 'inbox' THEN
    NEW.status = 'planned';
  END IF;
  
  -- planned_startが削除されたらplanned→inboxへ
  IF NEW.planned_start IS NULL AND OLD.status = 'planned' THEN
    NEW.status = 'inbox';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ステータス自動更新トリガー
CREATE TRIGGER update_event_status_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_status();