-- チケットアクティビティ（変更履歴）テーブル
CREATE TABLE IF NOT EXISTS ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'created',
    'updated',
    'status_changed',
    'priority_changed',
    'title_changed',
    'description_changed',
    'due_date_changed',
    'time_changed',
    'tag_added',
    'tag_removed',
    'deleted'
  )),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_ticket_activities_ticket_id ON ticket_activities(ticket_id);
CREATE INDEX idx_ticket_activities_user_id ON ticket_activities(user_id);
CREATE INDEX idx_ticket_activities_created_at ON ticket_activities(created_at DESC);
CREATE INDEX idx_ticket_activities_action_type ON ticket_activities(action_type);

-- RLSポリシー
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のチケットのアクティビティのみ閲覧可能
CREATE POLICY "Users can view activities of their own tickets"
  ON ticket_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_activities.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

-- ユーザーは自分のチケットのアクティビティのみ作成可能
CREATE POLICY "Users can create activities for their own tickets"
  ON ticket_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_activities.ticket_id
      AND tickets.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- コメント追加
COMMENT ON TABLE ticket_activities IS 'チケットの変更履歴を記録するテーブル';
COMMENT ON COLUMN ticket_activities.action_type IS 'アクション種別（created, updated, status_changed等）';
COMMENT ON COLUMN ticket_activities.field_name IS '変更されたフィールド名';
COMMENT ON COLUMN ticket_activities.old_value IS '変更前の値';
COMMENT ON COLUMN ticket_activities.new_value IS '変更後の値';
COMMENT ON COLUMN ticket_activities.metadata IS '追加のメタデータ（JSON形式）';
