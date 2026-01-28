---
name: design
description: 設計相談スキル。新機能実装、複雑なコンポーネント構成、状態管理、アーキテクチャ変更の計画時に自動発動。Dayoptのパターンに沿った設計を提案。
---

# 設計相談スキル

## When to Use

以下の状況で自動発動：

- 新機能の設計検討時（`/new-feature`の前段階）
- 状態管理の判断が必要な時（Zustand vs useState）
- コンポーネント構成の検討時
- 「設計」「どう実装すべきか」等のキーワード

## `/new-feature` との違い

| スキル         | 役割                              | タイミング |
| -------------- | --------------------------------- | ---------- |
| `/design`      | **What**: 何をどう作るか決める    | 実装前     |
| `/new-feature` | **How**: Explore→Plan→Code→Commit | 設計後     |

## 設計判断フロー

### 1. 状態管理の選択

```
この状態は複数コンポーネントで共有する？
├─ YES → Zustand
└─ NO  → useState

この状態を永続化する必要がある？
├─ YES → Zustand + persist middleware
└─ NO  → どちらでもOK
```

**判断表**:

| ケース             | 選択              | 例                                            |
| ------------------ | ----------------- | --------------------------------------------- |
| モーダルの開閉     | useState          | `const [isOpen, setIsOpen] = useState(false)` |
| 選択中のアイテムID | Zustand           | `useInspectorStore.use.selectedPlanId()`      |
| フォームの入力値   | useState          | `const [title, setTitle] = useState('')`      |
| アプリ全体の設定   | Zustand + persist | `useCalendarSettingsStore`                    |

### 2. コンポーネント分割

```
このコンポーネントにインタラクションがある？
├─ YES → Client Component ('use client')
└─ NO  → Server Component（デフォルト）

データフェッチが必要？
├─ YES → Server Component で fetch → Client に渡す
└─ NO  → 状況による
```

**Dayoptパターン**:

```typescript
// page.tsx (Server Component)
export default async function PlanPage({ params }: Props) {
  const plan = await fetchPlan(params.id);
  return <PlanView plan={plan} />;  // Client に初期データを渡す
}

// PlanView.tsx (Client Component)
'use client';
export function PlanView({ plan }: { plan: Plan }) {
  const [editMode, setEditMode] = useState(false);
  // インタラクション処理
}
```

### 3. データフロー設計

**Dayopt標準パターン**:

```
[Component] → [Custom Hook] → [tRPC Query/Mutation]
                                      ↓
                              [tRPC Router] → [Service] → [Supabase]
```

**例: タスク一覧機能**:

```typescript
// 1. Component
function TaskList() {
  const { data } = useTaskList();  // Custom Hook
  return <ul>{data?.map(t => <TaskItem key={t.id} task={t} />)}</ul>;
}

// 2. Custom Hook
function useTaskList() {
  return api.tasks.list.useQuery();  // tRPC
}

// 3. tRPC Router (薄く)
list: protectedProcedure.query(async ({ ctx }) => {
  const service = createTaskService(ctx.supabase);
  return service.list({ userId: ctx.userId });
})

// 4. Service (ロジックはここ)
class TaskService {
  async list({ userId }: { userId: string }) {
    return this.supabase.from('tasks').select('*').eq('user_id', userId);
  }
}
```

### 4. Feature構造

新機能は `src/features/` に配置：

```
src/features/[feature-name]/
├── components/       # UIコンポーネント
├── hooks/            # カスタムフック
├── stores/           # Zustand store（必要な場合）
├── types/            # 型定義
└── index.ts          # 公開API
```

## 出力形式

```markdown
## 設計案: [機能名]

### 状態管理

- [状態名]: useState / Zustand
- 理由: ...

### コンポーネント構成

| コンポーネント | 種類          | 責務   |
| -------------- | ------------- | ------ |
| [名前]         | Server/Client | [責務] |

### データフロー

1. [Component] → 2. [Hook] → 3. [tRPC] → 4. [Service]

### ファイル構成
```

src/features/xxx/
├── ...

```

### 確認事項
- [ ] [開発者への質問]
```

## Dayopt固有ルール

1. **既存shadcn/uiコンポーネントを最大限活用**
2. **楽観的更新を考慮**（ユーザー体験向上）
3. **Feature構造を維持**（`src/features/`配下）
