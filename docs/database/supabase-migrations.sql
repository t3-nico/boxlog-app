-- Supabase Database Migrations for BoxLog App
-- Basic Events and Task Records Tables (without tags dependency)

-- ============================================
-- 1. EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT FALSE,
  event_type TEXT DEFAULT 'event' CHECK (event_type IN ('event', 'task', 'reminder')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  color TEXT DEFAULT '#1a73e8',
  location TEXT,
  url TEXT,
  recurrence_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TASK RECORDS TABLE  
-- ============================================

CREATE TABLE IF NOT EXISTS task_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID,
  title TEXT NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_end TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_duration INTEGER NOT NULL,
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  interruptions INTEGER DEFAULT 0 CHECK (interruptions >= 0),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

CREATE INDEX IF NOT EXISTS idx_task_records_user_id ON task_records(user_id);
CREATE INDEX IF NOT EXISTS idx_task_records_task_id ON task_records(task_id);
CREATE INDEX IF NOT EXISTS idx_task_records_actual_start ON task_records(actual_start);
CREATE INDEX IF NOT EXISTS idx_task_records_actual_end ON task_records(actual_end);
CREATE INDEX IF NOT EXISTS idx_task_records_created_at ON task_records(created_at);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own events" ON events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own task records" ON task_records
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. AUTOMATIC UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;   
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_records_updated_at 
  BEFORE UPDATE ON task_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();