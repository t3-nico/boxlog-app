-- アクティビティを履歴として保持するため、CASCADE を SET NULL に変更
-- これにより、チケット削除後もアクティビティ履歴が残る

-- 既存の外部キー制約を削除
ALTER TABLE ticket_activities
DROP CONSTRAINT IF EXISTS ticket_activities_ticket_id_fkey;

-- SET NULL で外部キー制約を再作成
ALTER TABLE ticket_activities
ADD CONSTRAINT ticket_activities_ticket_id_fkey
FOREIGN KEY (ticket_id)
REFERENCES tickets(id)
ON DELETE SET NULL;

-- ticket_id カラムを nullable に変更（すでに nullable なので確認のみ）
-- ticket_activities テーブル作成時に ticket_id は NOT NULL で定義されているため変更が必要
ALTER TABLE ticket_activities
ALTER COLUMN ticket_id DROP NOT NULL;
