-- Calendar機能改善のためのマイグレーション
-- 2025-02-06

-- ========================================
-- 1. Eventsテーブルの改善
-- ========================================

-- カレンダー表示に必要なフィールドを追加
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Tokyo',
ADD COLUMN IF NOT EXISTS attendees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'team')),
ADD COLUMN IF NOT EXISTS calendar_id UUID,
ADD COLUMN IF NOT EXISTS external_id TEXT, -- 外部カレンダー（Google Calendar等）との同期用
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'local' CHECK (sync_status IN ('local', 'syncing', 'synced', 'error'));

-- 外部カレンダー同期用のユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id ON events(user_id, external_id) WHERE external_id IS NOT NULL;

-- ========================================
-- 2. カレンダーテーブル（複数カレンダー管理）
-- ========================================

CREATE TABLE IF NOT EXISTS calendars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_default BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  
  -- 外部カレンダー連携
  provider TEXT CHECK (provider IN ('local', 'google', 'outlook', 'ical')),
  external_id TEXT,
  sync_token TEXT, -- 差分同期用トークン
  last_synced_at TIMESTAMPTZ,
  
  -- 共有設定
  is_shared BOOLEAN DEFAULT false,
  share_settings JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, name)
);

-- カレンダーテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_calendars_user_id ON calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_calendars_is_default ON calendars(user_id, is_default) WHERE is_default = true;

-- 既存のeventsにcalendar_idの外部キー制約を追加
ALTER TABLE events 
ADD CONSTRAINT fk_events_calendar_id 
FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE SET NULL;

-- ========================================
-- 3. 繰り返しイベント専用テーブル
-- ========================================

CREATE TABLE IF NOT EXISTS recurrence_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  
  -- 繰り返しタイプ
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  interval INTEGER DEFAULT 1, -- 何日/週/月/年ごと
  
  -- 曜日指定（週次繰り返し用）
  weekdays INTEGER[], -- 0=日曜, 1=月曜, ..., 6=土曜
  
  -- 月次繰り返しの詳細
  monthly_type TEXT CHECK (monthly_type IN ('day_of_month', 'day_of_week')),
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  week_of_month INTEGER CHECK (week_of_month BETWEEN 1 AND 5), -- 5 = 最終週
  
  -- 終了条件
  end_type TEXT CHECK (end_type IN ('never', 'after_occurrences', 'on_date')),
  occurrences INTEGER,
  end_date DATE,
  
  -- 除外日（祝日など）
  excluded_dates DATE[],
  
  -- タイムゾーン考慮
  timezone TEXT DEFAULT 'Asia/Tokyo',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurrence_patterns_event_id ON recurrence_patterns(event_id);

-- ========================================
-- 4. 繰り返しイベントのインスタンステーブル
-- ========================================

CREATE TABLE IF NOT EXISTS event_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  recurrence_pattern_id UUID REFERENCES recurrence_patterns(id) ON DELETE CASCADE,
  
  -- このインスタンスの日時
  instance_start TIMESTAMPTZ NOT NULL,
  instance_end TIMESTAMPTZ NOT NULL,
  
  -- 例外的な変更
  is_exception BOOLEAN DEFAULT false,
  exception_type TEXT CHECK (exception_type IN ('modified', 'cancelled', 'moved')),
  
  -- 変更内容（例外の場合）
  overrides JSONB DEFAULT '{}'::jsonb, -- title, description, location等の上書き
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_instances_event_id ON event_instances(event_id);
CREATE INDEX IF NOT EXISTS idx_event_instances_dates ON event_instances(instance_start, instance_end);
CREATE INDEX IF NOT EXISTS idx_event_instances_user_date ON event_instances(event_id, instance_start);

-- ========================================
-- 5. カレンダー共有テーブル
-- ========================================

CREATE TABLE IF NOT EXISTS calendar_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT,
  
  -- 権限レベル
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'admin')),
  
  -- 共有リンク
  share_token TEXT UNIQUE,
  is_public_link BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_shares_calendar_id ON calendar_shares(calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_shares_shared_with ON calendar_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_shares_token ON calendar_shares(share_token) WHERE share_token IS NOT NULL;

-- ========================================
-- 6. カレンダービューの状態管理
-- ========================================

CREATE TABLE IF NOT EXISTS calendar_view_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- ビュー設定
  default_view TEXT DEFAULT 'month' CHECK (default_view IN ('day', 'split-day', '3day', 'week', 'week-no-weekend', '2week', 'month', 'schedule')),
  selected_calendars UUID[], -- 表示するカレンダーのID配列
  
  -- フィルター設定
  filter_tags UUID[],
  filter_priority TEXT[],
  filter_status TEXT[],
  
  -- 表示設定
  show_weekends BOOLEAN DEFAULT true,
  show_week_numbers BOOLEAN DEFAULT false,
  first_day_of_week INTEGER DEFAULT 0, -- 0=日曜, 1=月曜
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  
  -- カスタム設定
  custom_settings JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- ========================================
-- 7. RLS（Row Level Security）設定
-- ========================================

-- Calendarsテーブル
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendars" ON calendars
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared calendars" ON calendars
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM calendar_shares
      WHERE calendar_shares.calendar_id = calendars.id
      AND (
        calendar_shares.shared_with_user_id = auth.uid() OR
        (calendar_shares.is_public_link = true AND calendar_shares.expires_at > now())
      )
    )
  );

-- Recurrence Patternsテーブル
ALTER TABLE recurrence_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage recurrence patterns for their events" ON recurrence_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = recurrence_patterns.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Event Instancesテーブル
ALTER TABLE event_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage instances for their events" ON event_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_instances.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Calendar Sharesテーブル
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calendar owners can manage shares" ON calendar_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM calendars
      WHERE calendars.id = calendar_shares.calendar_id
      AND calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Shared users can view their shares" ON calendar_shares
  FOR SELECT USING (
    shared_with_user_id = auth.uid()
  );

-- Calendar View Statesテーブル
ALTER TABLE calendar_view_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own view states" ON calendar_view_states
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 8. トリガー関数
-- ========================================

-- Calendarsテーブルのupdated_at自動更新
CREATE TRIGGER calendars_updated_at
  BEFORE UPDATE ON calendars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recurrence Patternsテーブルのupdated_at自動更新
CREATE TRIGGER recurrence_patterns_updated_at
  BEFORE UPDATE ON recurrence_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Event Instancesテーブルのupdated_at自動更新
CREATE TRIGGER event_instances_updated_at
  BEFORE UPDATE ON event_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calendar View Statesテーブルのupdated_at自動更新
CREATE TRIGGER calendar_view_states_updated_at
  BEFORE UPDATE ON calendar_view_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- デフォルトカレンダーを確保する関数
CREATE OR REPLACE FUNCTION ensure_default_calendar()
RETURNS TRIGGER AS $$
BEGIN
  -- ユーザーにデフォルトカレンダーがない場合、このカレンダーをデフォルトに設定
  IF NEW.is_default = false THEN
    IF NOT EXISTS (
      SELECT 1 FROM calendars 
      WHERE user_id = NEW.user_id 
      AND is_default = true 
      AND id != NEW.id
    ) THEN
      NEW.is_default = true;
    END IF;
  ELSIF NEW.is_default = true THEN
    -- 他のカレンダーのデフォルトフラグを解除
    UPDATE calendars 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- デフォルトカレンダー管理トリガー
CREATE TRIGGER ensure_default_calendar_trigger
  BEFORE INSERT OR UPDATE ON calendars
  FOR EACH ROW EXECUTE FUNCTION ensure_default_calendar();

-- ========================================
-- 9. 初期データ設定
-- ========================================

-- 既存ユーザーにデフォルトカレンダーを作成
INSERT INTO calendars (user_id, name, color, is_default, provider)
SELECT DISTINCT 
  user_id, 
  'My Calendar' as name,
  '#3b82f6' as color,
  true as is_default,
  'local' as provider
FROM events
WHERE NOT EXISTS (
  SELECT 1 FROM calendars c 
  WHERE c.user_id = events.user_id
)
ON CONFLICT (user_id, name) DO NOTHING;

-- 既存のeventsにデフォルトカレンダーを紐付け
UPDATE events 
SET calendar_id = (
  SELECT id FROM calendars 
  WHERE calendars.user_id = events.user_id 
  AND is_default = true
  LIMIT 1
)
WHERE calendar_id IS NULL;

-- ========================================
-- 10. パフォーマンス最適化のインデックス
-- ========================================

-- カレンダー表示用の複合インデックス
CREATE INDEX IF NOT EXISTS idx_events_calendar_display 
ON events(user_id, calendar_id, planned_start, planned_end) 
WHERE status != 'cancelled';

-- 繰り返しイベント検索用
CREATE INDEX IF NOT EXISTS idx_event_instances_calendar_display 
ON event_instances(event_id, instance_start, instance_end) 
WHERE is_exception = false;

-- タグフィルター用
CREATE INDEX IF NOT EXISTS idx_event_tags_filter 
ON event_tags(tag_id, event_id);

-- 同期状態管理用
CREATE INDEX IF NOT EXISTS idx_events_sync_status 
ON events(user_id, sync_status) 
WHERE sync_status != 'local';