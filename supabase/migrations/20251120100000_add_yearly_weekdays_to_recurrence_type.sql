-- recurrence_type に yearly と weekdays を追加
-- CHECK制約を更新

-- 既存のCHECK制約を削除
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_recurrence_type_check;

-- 新しいCHECK制約を追加（yearly, weekdays を含む）
ALTER TABLE tickets ADD CONSTRAINT tickets_recurrence_type_check
  CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'weekdays'));

COMMENT ON COLUMN tickets.recurrence_type IS '繰り返しタイプ（none: なし、daily: 毎日、weekly: 毎週、monthly: 毎月、yearly: 毎年、weekdays: 平日）';
