-- レガシーのticket参照をplanに統一するリネームマイグレーション
-- 注意: PKEYや依存関係のある制約はリネームせず残す（機能に影響なし）

-- ===== 制約のリネーム（依存関係のないもののみ）=====
-- plan_activities
ALTER TABLE plan_activities DROP CONSTRAINT IF EXISTS ticket_activities_action_type_check;
ALTER TABLE plan_activities ADD CONSTRAINT plan_activities_action_type_check
  CHECK (action_type IN ('created', 'updated', 'status_changed', 'title_changed',
    'description_changed', 'due_date_changed', 'time_changed', 'tag_added', 'tag_removed', 'deleted'));

-- plans
ALTER TABLE plans DROP CONSTRAINT IF EXISTS tickets_recurrence_type_check;
ALTER TABLE plans ADD CONSTRAINT plans_recurrence_type_check
  CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'weekdays'));

-- ===== インデックスのリネーム =====
-- plan_activities
DROP INDEX IF EXISTS idx_ticket_activities_action_type;
CREATE INDEX IF NOT EXISTS idx_plan_activities_action_type ON plan_activities(action_type);

DROP INDEX IF EXISTS idx_ticket_activities_created_at;
CREATE INDEX IF NOT EXISTS idx_plan_activities_created_at ON plan_activities(created_at DESC);

DROP INDEX IF EXISTS idx_ticket_activities_ticket_id;
CREATE INDEX IF NOT EXISTS idx_plan_activities_plan_id ON plan_activities(plan_id);

DROP INDEX IF EXISTS idx_ticket_activities_user_id;
CREATE INDEX IF NOT EXISTS idx_plan_activities_user_id ON plan_activities(user_id);

-- plan_tags
DROP INDEX IF EXISTS idx_ticket_tags_tag_id;
CREATE INDEX IF NOT EXISTS idx_plan_tags_tag_id ON plan_tags(tag_id);

DROP INDEX IF EXISTS idx_ticket_tags_ticket_id;
CREATE INDEX IF NOT EXISTS idx_plan_tags_plan_id ON plan_tags(plan_id);

-- plans
DROP INDEX IF EXISTS idx_tickets_due_date;
CREATE INDEX IF NOT EXISTS idx_plans_due_date ON plans(due_date);

DROP INDEX IF EXISTS idx_tickets_recurrence_rule;
CREATE INDEX IF NOT EXISTS idx_plans_recurrence_rule ON plans(recurrence_rule) WHERE recurrence_rule IS NOT NULL;

DROP INDEX IF EXISTS idx_tickets_reminder_at_sent;
CREATE INDEX IF NOT EXISTS idx_plans_reminder_at_sent ON plans(reminder_at, reminder_sent) WHERE reminder_at IS NOT NULL AND reminder_sent = false;

DROP INDEX IF EXISTS idx_tickets_start_time;
CREATE INDEX IF NOT EXISTS idx_plans_start_time ON plans(start_time);

DROP INDEX IF EXISTS idx_tickets_status;
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);

DROP INDEX IF EXISTS idx_tickets_ticket_number;
CREATE INDEX IF NOT EXISTS idx_plans_plan_number ON plans(plan_number);

DROP INDEX IF EXISTS idx_tickets_user_id;
-- idx_plans_user_idは既存の可能性

-- ===== トリガーのリネーム =====
DROP TRIGGER IF EXISTS trigger_cleanup_ticket_tags ON plans;
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON plans;
DROP TRIGGER IF EXISTS trigger_update_tickets_updated_at ON plans;

-- 新しい名前でトリガーを再作成
CREATE OR REPLACE TRIGGER trigger_cleanup_plan_tags
  BEFORE DELETE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_tag_relations_on_ticket_delete();

CREATE OR REPLACE TRIGGER trigger_generate_plan_number
  BEFORE INSERT ON plans
  FOR EACH ROW
  WHEN (NEW.plan_number IS NULL OR NEW.plan_number = '')
  EXECUTE FUNCTION generate_simple_ticket_number();

CREATE OR REPLACE TRIGGER trigger_update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===== 外部キー制約のリネーム =====
-- plan_activities
ALTER TABLE plan_activities DROP CONSTRAINT IF EXISTS ticket_activities_ticket_id_fkey;
ALTER TABLE plan_activities DROP CONSTRAINT IF EXISTS ticket_activities_user_id_fkey;

ALTER TABLE plan_activities
  ADD CONSTRAINT plan_activities_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;

ALTER TABLE plan_activities
  ADD CONSTRAINT plan_activities_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- plan_tags
ALTER TABLE plan_tags DROP CONSTRAINT IF EXISTS ticket_tags_tag_id_fkey;
ALTER TABLE plan_tags DROP CONSTRAINT IF EXISTS ticket_tags_ticket_id_fkey;

ALTER TABLE plan_tags
  ADD CONSTRAINT plan_tags_tag_id_fkey
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

ALTER TABLE plan_tags
  ADD CONSTRAINT plan_tags_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;

-- ===== 関数のリネーム・修正 =====
-- cleanup_tag_relations_on_ticket_delete を plan用に修正
CREATE OR REPLACE FUNCTION public.cleanup_tag_relations_on_plan_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Plan削除時に、紐づくtag_relationsも削除
  DELETE FROM tag_relations
  WHERE entity_id = OLD.id
    AND entity_type = 'plan';
  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.cleanup_tag_relations_on_plan_delete() IS
  'Plan削除時にtag_relationsのレコードを自動削除するトリガー関数';

-- トリガーを新しい関数に切り替え
DROP TRIGGER IF EXISTS trigger_cleanup_plan_tags ON plans;
CREATE TRIGGER trigger_cleanup_plan_tags
  BEFORE DELETE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_tag_relations_on_plan_delete();

-- generate_simple_ticket_number を generate_plan_number にリネーム
CREATE OR REPLACE FUNCTION public.generate_plan_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(
    MAX(CAST(REGEXP_REPLACE(plan_number, '[^0-9]', '', 'g') AS INTEGER)),
    0
  ) + 1 INTO next_num
  FROM plans
  WHERE user_id = NEW.user_id;

  NEW.plan_number := next_num::TEXT;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.generate_plan_number() IS
  'Planのplan_numberを自動生成するトリガー関数';

-- トリガーを新しい関数に切り替え
DROP TRIGGER IF EXISTS trigger_generate_plan_number ON plans;
CREATE TRIGGER trigger_generate_plan_number
  BEFORE INSERT ON plans
  FOR EACH ROW
  WHEN (NEW.plan_number IS NULL OR NEW.plan_number = '')
  EXECUTE FUNCTION generate_plan_number();

-- ===== 不要な関数の削除 =====
-- record_event_history と update_event_status は使用されていないため削除
DROP FUNCTION IF EXISTS public.record_event_history() CASCADE;
DROP FUNCTION IF EXISTS public.update_event_status() CASCADE;

-- 旧関数も削除（新関数作成後）
DROP FUNCTION IF EXISTS public.cleanup_tag_relations_on_ticket_delete() CASCADE;
DROP FUNCTION IF EXISTS public.generate_simple_ticket_number() CASCADE;

-- ===== コメントの更新 =====
COMMENT ON TABLE tag_relations IS
  '汎用タグ関連付けテーブル。plans, recordsなど全てのエンティティに対応。';

COMMENT ON COLUMN tag_relations.entity_id IS
  'エンティティのID（plans.id等）';
