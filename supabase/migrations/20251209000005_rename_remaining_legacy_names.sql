-- 残りのレガシーticket命名をplan命名にリネーム
-- PK制約、UNIQUE制約、FK制約、RLSポリシー

-- ===== PK制約のリネーム =====
-- plan_activities
ALTER TABLE plan_activities RENAME CONSTRAINT ticket_activities_pkey TO plan_activities_pkey;

-- plan_tags
ALTER TABLE plan_tags RENAME CONSTRAINT ticket_tags_pkey TO plan_tags_pkey;

-- plans
ALTER TABLE plans RENAME CONSTRAINT tickets_pkey TO plans_pkey;

-- ===== UNIQUE制約のリネーム =====
-- plan_tags
ALTER TABLE plan_tags RENAME CONSTRAINT ticket_tags_ticket_id_tag_id_key TO plan_tags_plan_id_tag_id_key;

-- plans
ALTER TABLE plans RENAME CONSTRAINT tickets_user_id_ticket_number_key TO plans_user_id_plan_number_key;

-- ===== FK制約のリネーム =====
-- plan_tags
ALTER TABLE plan_tags RENAME CONSTRAINT ticket_tags_user_id_fkey TO plan_tags_user_id_fkey;

-- plans
ALTER TABLE plans RENAME CONSTRAINT tickets_user_id_fkey TO plans_user_id_fkey;

-- ===== RLSポリシーのリネーム =====
-- plan_activities
ALTER POLICY "Users can create activities for their own tickets" ON plan_activities
  RENAME TO "Users can create activities for their own plans";

ALTER POLICY "Users can view activities of their own tickets" ON plan_activities
  RENAME TO "Users can view activities of their own plans";

-- plan_tags
ALTER POLICY "Users can delete own ticket_tags" ON plan_tags
  RENAME TO "Users can delete own plan_tags";

ALTER POLICY "Users can insert own ticket_tags" ON plan_tags
  RENAME TO "Users can insert own plan_tags";

ALTER POLICY "Users can view own ticket_tags" ON plan_tags
  RENAME TO "Users can view own plan_tags";

-- plans
ALTER POLICY "Users can delete own tickets" ON plans
  RENAME TO "Users can delete own plans";

ALTER POLICY "Users can insert own tickets" ON plans
  RENAME TO "Users can insert own plans";

ALTER POLICY "Users can update own tickets" ON plans
  RENAME TO "Users can update own plans";

ALTER POLICY "Users can view own tickets" ON plans
  RENAME TO "Users can view own plans";
