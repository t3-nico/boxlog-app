-- 古い形式のデータを削除するSQL
-- Supabaseダッシュボード > SQL Editor で実行してください

-- 現在のチケット数を確認
SELECT 'Before deletion - Tickets:' as info, COUNT(*) as count FROM tickets;
SELECT 'Before deletion - Sessions:' as info, COUNT(*) as count FROM sessions;

-- 古い形式のチケットを削除
DELETE FROM tickets WHERE ticket_number LIKE 'TKT-%';

-- 古い形式のセッションを削除
DELETE FROM sessions WHERE session_number LIKE 'SES-%';

-- 削除後の件数を確認
SELECT 'After deletion - Tickets:' as info, COUNT(*) as count FROM tickets;
SELECT 'After deletion - Sessions:' as info, COUNT(*) as count FROM sessions;

-- 残っているチケットを確認
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10;
