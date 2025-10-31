-- 既存のチケットに対して「作成」アクティビティを一括追加
-- これにより、既存チケットのInspectorでもアクティビティタブが機能するようになる

INSERT INTO ticket_activities (ticket_id, user_id, action_type, created_at)
SELECT
  id,
  user_id,
  'created',
  created_at -- チケットの作成日時を使用
FROM tickets
WHERE id NOT IN (
  SELECT DISTINCT ticket_id
  FROM ticket_activities
  WHERE action_type = 'created'
);
