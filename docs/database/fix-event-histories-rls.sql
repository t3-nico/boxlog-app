-- event_historiesテーブルのRLSポリシーを修正

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their event histories" ON event_histories;

-- 新しいポリシーを作成（SELECT and INSERT）
CREATE POLICY "Users can view their event histories" ON event_histories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_histories.event_id 
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert event histories" ON event_histories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_histories.event_id 
      AND events.user_id = auth.uid()
    )
  );