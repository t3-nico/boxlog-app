-- ========================================
-- 古い形式のデータを削除
-- TKT-20241027-001 形式のデータを削除して、
-- 新しい連番形式 (#1, #2, #3...) のみにする
-- ========================================

-- 古い形式のチケットを削除
DELETE FROM tickets WHERE ticket_number LIKE 'TKT-%';

-- 古い形式のセッションを削除
DELETE FROM sessions WHERE session_number LIKE 'SES-%';

-- 確認用: 残っているデータ件数を表示（コメントアウト）
-- SELECT 'Remaining tickets:', COUNT(*) FROM tickets;
-- SELECT 'Remaining sessions:', COUNT(*) FROM sessions;
