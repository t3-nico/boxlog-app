# plans機能

プラン管理機能のモジュール。タスク・課題・作業アイテムを管理します。

## ディレクトリ構造

```
features/plans/
├── components/         # UIコンポーネント
│   ├── display/       # 表示系（Card, Badge等）
│   ├── filters/       # フィルター
│   ├── forms/         # フォーム（作成・編集）
│   ├── inspector/     # Inspector（詳細表示・編集）
│   └── shared/        # 共通コンポーネント
├── constants/         # 定数定義（status, priority）
├── hooks/             # カスタムフック（データ取得・操作）
├── stores/            # Zustand状態管理（Inspector表示制御のみ）
├── types/             # 型定義
└── utils/             # ユーティリティ関数
```

## 基本的な使い方

### プラン一覧の取得

```tsx
import { useplans } from '@/features/plans/hooks';

function planList() {
  const { data: plans, isLoading } = useplans();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {plans?.map((plan) => (
        <div key={plan.id}>{plan.title}</div>
      ))}
    </div>
  );
}
```

### フィルター・ソート・ページネーション

```tsx
import { useplans } from '@/features/plans/hooks';

function Filteredplans() {
  const { data: plans } = useplans({
    status: 'active',
    priority: 'high',
    search: 'バグ',
    sortBy: 'due_date',
    sortOrder: 'asc',
    limit: 20,
    offset: 0,
  });

  return <div>{/* ... */}</div>;
}
```

### 単体プランの取得

```tsx
import { useplan } from '@/features/plans/hooks';

function planDetail({ id }: { id: string }) {
  const { data: plan } = useplan(id, {
    includeTags: true, // タグも一緒に取得
  });

  return <div>{plan?.title}</div>;
}
```

### プランの作成・更新・削除

```tsx
import { useplanMutations } from '@/features/plans/hooks';

function planActions() {
  const { createplan, updateplan, deleteplan } = useplanMutations();

  const handleCreate = () => {
    createplan.mutate({
      title: '新しいタスク',
      status: 'backlog',
      priority: 'normal',
    });
  };

  const handleUpdate = (id: string) => {
    updateplan.mutate({
      id,
      data: { status: 'done' },
    });
  };

  return <button onClick={handleCreate}>作成</button>;
}
```

### Inspectorの表示制御

```tsx
import { useplanInspectorStore } from '@/features/plans/stores';

function planCard({ plan }) {
  const { openInspector } = useplanInspectorStore();

  return <div onClick={() => openInspector(plan.id)}>{plan.title}</div>;
}
```

## プランステータス（6段階）

| Status    | 日本語   | 説明               |
| --------- | -------- | ------------------ |
| `backlog` | 準備中   | 未着手・バックログ |
| `ready`   | 配置済み | 着手準備完了       |
| `active`  | 作業中   | 現在作業中         |
| `wait`    | 待ち     | ブロック中・待機中 |
| `done`    | 完了     | 完了               |
| `cancel`  | 中止     | キャンセル         |

## 優先度

| Priority | 日本語 | 説明       |
| -------- | ------ | ---------- |
| `urgent` | 緊急   | 最優先     |
| `high`   | 高     | 高優先度   |
| `normal` | 通常   | 通常優先度 |
| `low`    | 低     | 低優先度   |

## データ構造

```typescript
interface plan {
  id: string;
  user_id: string;
  plan_number: string; // 例: "2025-001-001"
  title: string;
  description: string | null;
  status: planStatus;
  priority: planPriority | null;
  due_date: string | null; // ISO 8601形式
  start_time: string | null; // 開始時刻
  end_time: string | null; // 終了時刻
  recurrence_type: RecurrenceType | null;
  recurrence_end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

## 主要コンポーネント

### planInspector

全ページ共通のプラン詳細表示・編集パネル（PC: Popover、モバイル: Drawer）。

```tsx
// レイアウトに配置（常にマウント）
import { planInspector } from '@/features/plans';
<planInspector />;
```

### planCard

プランのカード表示コンポーネント。

```tsx
import { planCard } from '@/features/plans/components';
<planCard
  plan={plan}
  onEdit={(t) => console.log('Edit:', t)}
  onDelete={(t) => console.log('Delete:', t)}
  onClick={(t) => openInspector(t.id)}
  tags={planTags}
/>;
```

### planCreatePopover

クイックプラン作成ポップオーバー。

```tsx
import { planCreatePopover } from '@/features/plans/components';
<planCreatePopover
  triggerElement={<Button>新規作成</Button>}
  onSuccess={() => console.log('Created!')}
/>;
```

## API（tRPC）

### Queries

- `plans.list` - プラン一覧取得（フィルター・ソート・ページネーション対応）
- `plans.getById` - 単体取得（include optionでリレーション取得可能）
- `plans.getStats` - 統計情報取得

### Mutations

- `plans.create` - 作成
- `plans.update` - 更新
- `plans.delete` - 削除
- `plans.bulkUpdate` - 一括更新
- `plans.bulkDelete` - 一括削除

### Tag関連

- `plans.tags.list` - タグ一覧
- `plans.addTag` - タグ追加
- `plans.removeTag` - タグ削除
- `plans.setTags` - タグ一括設定

## 状態管理

### React Query（tRPC）

- データフェッチング・キャッシュ管理
- 楽観的更新
- 自動再取得

### Zustand

- Inspector表示制御のみ（`useplanInspectorStore`）
- グローバルなUI状態管理

## 型安全性

- すべてのAPIはZodスキーマでバリデーション
- tRPCで型が自動推論される
- TypeScript strict mode対応

## テスト

```bash
# 型チェック
npm run typecheck

# 単体テスト（将来実装予定）
npm run test src/features/plans
```

## 注意事項

- プラン番号は自動生成（`YYYY-{user_count}-{plan_count}`形式）
- Inspector は常にレイアウトにマウントしておく必要あり
- タグ機能は `/src/features/tags` と連携

## 関連ドキュメント

- API実装: `/src/server/api/routers/plans.ts`
- スキーマ定義: `/src/schemas/plans/plan.ts`
- データベース: `/supabase/migrations/`
