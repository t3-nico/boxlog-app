-- ========================================
-- Ticket番号を連番のみに簡略化
-- TKT-20241027-001 → #1, #2, #3...
-- GitHubのIssue番号と同じ仕様
-- ========================================

-- 既存の採番関数を削除
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON tickets;
DROP FUNCTION IF EXISTS generate_ticket_number();

-- 新しい採番関数（シンプルな連番）
CREATE OR REPLACE FUNCTION generate_simple_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- ユーザーごとの最大値+1を取得
  SELECT COALESCE(
    MAX(CAST(REGEXP_REPLACE(ticket_number, '[^0-9]', '', 'g') AS INTEGER)),
    0
  ) + 1 INTO next_num
  FROM tickets
  WHERE user_id = NEW.user_id;

  NEW.ticket_number := next_num::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを再作成
CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
  EXECUTE FUNCTION generate_simple_ticket_number();

-- Session番号も同様に簡略化
DROP TRIGGER IF EXISTS trigger_generate_session_number ON sessions;
DROP FUNCTION IF EXISTS generate_session_number();

CREATE OR REPLACE FUNCTION generate_simple_session_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- ユーザーごとの最大値+1を取得
  SELECT COALESCE(
    MAX(CAST(REGEXP_REPLACE(session_number, '[^0-9]', '', 'g') AS INTEGER)),
    0
  ) + 1 INTO next_num
  FROM sessions
  WHERE user_id = NEW.user_id;

  NEW.session_number := next_num::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_session_number
  BEFORE INSERT ON sessions
  FOR EACH ROW
  WHEN (NEW.session_number IS NULL OR NEW.session_number = '')
  EXECUTE FUNCTION generate_simple_session_number();
