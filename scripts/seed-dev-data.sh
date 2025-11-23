#!/bin/bash

# ========================================
# BoxLog App - 開発用データ投入スクリプト
# ========================================
# 使い方:
#   chmod +x scripts/seed-dev-data.sh
#   ./scripts/seed-dev-data.sh
# ========================================

set -e

SUPABASE_URL="http://127.0.0.1:54321"
ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "🚀 開発用データを投入します..."

# ========================================
# 1. テストユーザーの作成
# ========================================
echo "👤 テストユーザーを作成中..."
USER_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "password123"
  }')

USER_ID=$(echo $USER_RESPONSE | jq -r '.user.id')

if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
  echo "❌ ユーザー作成に失敗しました"
  echo $USER_RESPONSE | jq .
  exit 1
fi

echo "✅ ユーザー作成成功: $USER_ID"

# ========================================
# 2. サンプルチケットの作成
# ========================================
echo "📝 サンプルチケットを作成中..."

# SQLファイルの作成（user_idを動的に設定）
cat > /tmp/seed_plans.sql <<EOF
-- サンプルチケット1
INSERT INTO public.plans (
  user_id, plan_number, title, description, status, priority,
  due_date, start_time, end_time, recurrence_type
) VALUES (
  '${USER_ID}',
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
INSERT INTO public.plans (
  user_id, plan_number, title, status, priority, due_date, recurrence_type
) VALUES (
  '${USER_ID}',
  '2',
  '認証システムのテスト',
  'todo',
  'normal',
  CURRENT_DATE + INTERVAL '3 days',
  'none'
);

-- サンプルチケット3（繰り返しタスク）
INSERT INTO public.plans (
  user_id, plan_number, title, description, status, priority,
  due_date, start_time, end_time, recurrence_type, recurrence_end_date
) VALUES (
  '${USER_ID}',
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

-- サンプルタグ
INSERT INTO public.tags (user_id, name, color) VALUES
  ('${USER_ID}', 'フロントエンド', '#3b82f6'),
  ('${USER_ID}', 'バックエンド', '#10b981'),
  ('${USER_ID}', 'バグ修正', '#ef4444'),
  ('${USER_ID}', 'ドキュメント', '#8b5cf6');
EOF

# Docker経由でPostgreSQLに接続してSQL実行
docker exec supabase_db_boxlog-app psql -U postgres -d postgres -f /tmp/seed_plans.sql 2>/dev/null || {
  echo "⚠️  Docker経由での実行に失敗しました。supabase CLIで試します..."

  # 代替方法: supabase db execute
  supabase db execute --file /tmp/seed_plans.sql --local
}

echo "✅ サンプルデータ投入完了"
echo ""
echo "===================="
echo "📋 作成されたデータ"
echo "===================="
echo "ユーザー: dev@example.com"
echo "パスワード: password123"
echo "チケット: 3件"
echo "タグ: 4件"
echo ""
echo "🎉 開発を開始できます！"
