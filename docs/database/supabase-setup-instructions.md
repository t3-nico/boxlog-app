# Supabase データベースセットアップ手順

## 概要

BoxLogアプリのEventCreateFormとLogCreateForm機能を使用するために必要なSupabaseテーブルを作成します。

## 前提条件

- Supabaseプロジェクトが作成済み
- Supabaseダッシュボードにアクセス可能
- `tags`テーブルが既に存在している（既存のタグシステム用）

## セットアップ手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. BoxLogプロジェクトを選択
3. 左メニューから「SQL Editor」をクリック

### 2. データベーステーブルの作成

1. SQL Editorで新しいクエリを作成
2. `/docs/database/supabase-migrations.sql` の内容をコピー&ペースト
3. 「RUN」ボタンをクリックしてSQLを実行

### 3. 作成されるテーブル

#### events テーブル
```sql
- id: UUID (主キー)
- user_id: UUID (auth.users参照)
- title: TEXT (必須)
- description: TEXT
- start_date: DATE (必須)
- start_time: TIME
- end_date: DATE
- end_time: TIME
- is_all_day: BOOLEAN
- event_type: TEXT ('event', 'task', 'reminder')
- status: TEXT ('confirmed', 'tentative', 'cancelled')
- color: TEXT (デフォルト: '#1a73e8')
- location: TEXT
- url: TEXT
- recurrence_pattern: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### task_records テーブル
```sql
- id: UUID (主キー)
- user_id: UUID (auth.users参照)
- task_id: UUID (オプション、元のタスク/イベントへの参照)
- title: TEXT (必須)
- actual_start: TIMESTAMP (必須)
- actual_end: TIMESTAMP (必須)
- actual_duration: INTEGER (分単位)
- satisfaction: INTEGER (1-5)
- focus_level: INTEGER (1-5)
- energy_level: INTEGER (1-5)
- interruptions: INTEGER (デフォルト: 0)
- memo: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### event_tags テーブル（多対多関係）
```sql
- id: UUID (主キー)
- event_id: UUID (events参照)
- tag_id: UUID (tags参照)
- created_at: TIMESTAMP
```

### 4. セキュリティ設定

以下のRow Level Security (RLS) ポリシーが自動で適用されます：

- **events**: ユーザーは自分のイベントのみアクセス可能
- **task_records**: ユーザーは自分の記録のみアクセス可能  
- **event_tags**: ユーザーは自分のイベントタグのみアクセス可能

### 5. パフォーマンス最適化

以下のインデックスが自動で作成されます：

- ユーザーID別の検索最適化
- 日付範囲検索の最適化
- イベントタイプ・ステータス検索の最適化
- タグ関係の結合最適化

### 6. 便利なビューの活用

#### events_with_tags ビュー
イベントとそのタグを一度に取得：
```sql
SELECT * FROM events_with_tags WHERE user_id = auth.uid();
```

#### daily_task_records_summary ビュー
日別の記録サマリーを取得：
```sql
SELECT * FROM daily_task_records_summary WHERE user_id = auth.uid();
```

## 確認方法

### テーブル作成確認
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'task_records', 'event_tags');
```

### RLSポリシー確認
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'task_records', 'event_tags');
```

### インデックス確認
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'task_records', 'event_tags') 
ORDER BY tablename, indexname;
```

## トラブルシューティング

### よくあるエラー

1. **「relation "auth.users" does not exist」**
   - Supabaseの認証が有効になっているか確認
   - プロジェクトが正しく初期化されているか確認

2. **「relation "tags" does not exist」**
   - 既存のタグテーブルが作成されているか確認
   - `docs/database/schema.md` のtagsテーブル作成DDLを先に実行

3. **権限エラー**
   - Supabaseのサービスロールキーを使用しているか確認
   - プロジェクトオーナー権限があるか確認

### データのリセット（注意！）

すべてのデータを削除して再作成する場合：
```sql
-- 警告: 全データが削除されます！
DROP VIEW IF EXISTS events_with_tags;
DROP VIEW IF EXISTS daily_task_records_summary;
DROP TABLE IF EXISTS event_tags CASCADE;
DROP TABLE IF EXISTS task_records CASCADE;  
DROP TABLE IF EXISTS events CASCADE;
```

## 次のステップ

1. テーブル作成完了後、AddPopupフォームでイベント・ログ作成をテスト
2. フロントエンドのEventStoreとRecordsStoreの実装を確認
3. 必要に応じてAPI routes (`/api/events/`, `/api/task-records/`) を実装

## 関連ファイル

- `/docs/database/supabase-migrations.sql` - 実行するSQL文
- `/docs/database/schema.md` - 既存のスキーマ情報  
- `/src/types/events.ts` - イベント型定義
- `/src/components/box/calendar-view/types.ts` - タスク記録型定義