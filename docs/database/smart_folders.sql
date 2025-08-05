-- Smart Folders テーブル
-- Eagleライクなスマートフォルダシステム用のテーブル定義

-- SmartFolder テーブル
create table smart_folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- ルール定義 (JSON形式)
  rules jsonb not null default '[]'::jsonb,
  
  -- アクティブ状態
  is_active boolean default true,
  
  -- 表示順序
  order_index integer default 0,
  
  -- アイコン・色設定
  icon text,
  color text default '#3B82F6',
  
  -- システムフォルダかどうか（削除不可）
  is_system boolean default false,
  
  -- タイムスタンプ
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- インデックス
create index smart_folders_user_id_idx on smart_folders(user_id);
create index smart_folders_is_active_idx on smart_folders(is_active);
create index smart_folders_order_idx on smart_folders(order_index);

-- RLS (Row Level Security) ポリシー
alter table smart_folders enable row level security;

-- ユーザーは自分のスマートフォルダのみアクセス可能
create policy "Users can view own smart folders" on smart_folders
  for select using (auth.uid() = user_id);

create policy "Users can insert own smart folders" on smart_folders
  for insert with check (auth.uid() = user_id);

create policy "Users can update own smart folders" on smart_folders
  for update using (auth.uid() = user_id);

create policy "Users can delete own smart folders" on smart_folders
  for delete using (auth.uid() = user_id and is_system = false);

-- updated_at の自動更新トリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_smart_folders_updated_at
  before update on smart_folders
  for each row
  execute function update_updated_at_column();

-- デフォルトのシステムフォルダを挿入する関数
create or replace function create_default_smart_folders(user_uuid uuid)
returns void as $$
begin
  -- 全てのタスク
  insert into smart_folders (name, description, user_id, rules, is_system, order_index, icon)
  values (
    'All Tasks',
    'すべてのタスクを表示',
    user_uuid,
    '[]'::jsonb,
    true,
    1,
    '📋'
  );
  
  -- 最近更新されたタスク
  insert into smart_folders (name, description, user_id, rules, is_system, order_index, icon)
  values (
    'Recent',
    '最近更新されたタスク（7日以内）',
    user_uuid,
    '[{"field": "updated_at", "operator": "greater_than", "value": "7days", "logic": "AND"}]'::jsonb,
    true,
    2,
    '🕒'
  );
  
  -- お気に入り
  insert into smart_folders (name, description, user_id, rules, is_system, order_index, icon)
  values (
    'Favorites',
    'お気に入りに登録されたタスク',
    user_uuid,
    '[{"field": "is_favorite", "operator": "equals", "value": true, "logic": "AND"}]'::jsonb,
    true,
    3,
    '⭐'
  );
  
  -- 高優先度
  insert into smart_folders (name, description, user_id, rules, is_system, order_index, icon)
  values (
    'High Priority',
    '高優先度のタスク',
    user_uuid,
    '[{"field": "priority", "operator": "equals", "value": "high", "logic": "AND"}]'::jsonb,
    true,
    4,
    '🔥'
  );
end;
$$ language plpgsql;

-- コメント
comment on table smart_folders is 'Eagleライクなスマートフォルダシステム';
comment on column smart_folders.rules is 'フィルタリングルールをJSON形式で保存';
comment on column smart_folders.is_system is 'システムフォルダ（削除不可）';
comment on column smart_folders.order_index is 'フォルダの表示順序';