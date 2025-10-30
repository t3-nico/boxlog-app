-- ========================================
-- BoxLog App - 開発用シードデータ
-- ========================================
-- このファイルは `supabase db reset` 実行時に自動的に読み込まれます
-- 開発用のテストデータを定義してください

-- ========================================
-- 1. テストユーザーの作成
-- ========================================
-- 注意: auth.usersへの直接INSERTはSupabase Auth APIを使用する必要があるため、
-- ここでは既存ユーザーを想定したpublic.ticketsのみ作成します
-- ユーザー作成は以下のコマンドで実行してください:
-- curl -X POST 'http://127.0.0.1:54321/auth/v1/signup' \
--   -H 'apikey: YOUR_ANON_KEY' \
--   -H 'Content-Type: application/json' \
--   -d '{"email":"dev@example.com","password":"password123"}'

-- ========================================
-- 2. サンプルチケットの作成
-- ========================================
-- 注意: user_idはauth.usersに存在するIDを使用する必要があります
-- 以下は例として、実際のuser_idに置き換えてください

-- サンプルチケット1
INSERT INTO public.tickets (
  user_id,
  ticket_number,
  title,
  description,
  status,
  priority,
  due_date,
  start_time,
  end_time,
  recurrence_type
) VALUES (
  'd0b27af5-bc7d-4d06-8898-b103f9c49330', -- dev@example.comのuser_id（要更新）
  '1',
  'BoxLog開発タスク',
  'Inboxテーブルの機能改善とチケット作成フローの最適化',
  'in_progress',
  'high',
  CURRENT_DATE + INTERVAL '7 days',
  NOW(),
  NOW() + INTERVAL '2 hours',
  'none'
);

-- サンプルチケット2
INSERT INTO public.tickets (
  user_id,
  ticket_number,
  title,
  description,
  status,
  priority,
  due_date,
  recurrence_type
) VALUES (
  'd0b27af5-bc7d-4d06-8898-b103f9c49330', -- dev@example.comのuser_id（要更新）
  '2',
  '認証システムのテスト',
  'ローカル開発環境での認証フローを検証',
  'todo',
  'normal',
  CURRENT_DATE + INTERVAL '3 days',
  'none'
);

-- サンプルチケット3（繰り返しタスク）
INSERT INTO public.tickets (
  user_id,
  ticket_number,
  title,
  description,
  status,
  priority,
  due_date,
  start_time,
  end_time,
  recurrence_type,
  recurrence_end_date
) VALUES (
  'd0b27af5-bc7d-4d06-8898-b103f9c49330', -- dev@example.comのuser_id（要更新）
  '3',
  '日次レビュー',
  '毎日のタスク振り返りと翌日の計画',
  'todo',
  'normal',
  CURRENT_DATE,
  CURRENT_DATE + TIME '09:00:00',
  CURRENT_DATE + TIME '09:30:00',
  'daily',
  CURRENT_DATE + INTERVAL '30 days'
);

-- ========================================
-- 3. サンプルタグの作成
-- ========================================
INSERT INTO public.tags (
  user_id,
  name,
  color
) VALUES
  ('d0b27af5-bc7d-4d06-8898-b103f9c49330', 'フロントエンド', '#3b82f6'),
  ('d0b27af5-bc7d-4d06-8898-b103f9c49330', 'バックエンド', '#10b981'),
  ('d0b27af5-bc7d-4d06-8898-b103f9c49330', 'バグ修正', '#ef4444'),
  ('d0b27af5-bc7d-4d06-8898-b103f9c49330', 'ドキュメント', '#8b5cf6');

-- ========================================
-- 注意事項
-- ========================================
-- このseed.sqlは以下のタイミングで実行されます：
-- 1. supabase db reset --local
-- 2. supabase start (初回のみ)
--
-- user_idは実際の環境に合わせて更新してください。
-- 本番環境では使用しないでください（開発専用）。
