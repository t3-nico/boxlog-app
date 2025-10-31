-- ========================================
-- Ticketsテーブルに日付・時間・繰り返しカラムを追加
-- 予定時間・実績時間カラムを削除
-- ========================================

-- 1. 不要なカラムを削除
ALTER TABLE tickets DROP COLUMN IF EXISTS planned_hours;
ALTER TABLE tickets DROP COLUMN IF EXISTS actual_hours;

-- 2. 日付・時間カラムを追加
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- 3. 繰り返し機能のカラムを追加
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS recurrence_type TEXT DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly'));
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- 4. インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(due_date);
CREATE INDEX IF NOT EXISTS idx_tickets_start_time ON tickets(start_time);

-- 5. コメント追加（ドキュメント化）
COMMENT ON COLUMN tickets.due_date IS '期限日（日付のみ）';
COMMENT ON COLUMN tickets.start_time IS '開始日時';
COMMENT ON COLUMN tickets.end_time IS '終了日時';
COMMENT ON COLUMN tickets.recurrence_type IS '繰り返しタイプ: none（なし）, daily（毎日）, weekly（毎週）, monthly（毎月）';
COMMENT ON COLUMN tickets.recurrence_end_date IS '繰り返しの終了日';
