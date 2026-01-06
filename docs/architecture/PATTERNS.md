# 設計パターン

BoxLogで採用している設計パターンを解説する。

## ディレクトリ構造: Feature-based

```
src/
├── app/           # Next.js App Router（ルーティング）
├── features/      # 機能ごとのモジュール ★
├── components/    # 共通コンポーネント
├── hooks/         # 共通フック
├── lib/           # ユーティリティ
├── server/        # バックエンド（tRPC）
└── types/         # 型定義
```

### features/ の構造

```
features/
├── calendar/      # カレンダー機能
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── types/
├── plans/         # プラン管理
├── tags/          # タグ管理
└── ...
```

**なぜFeature-basedか**:

- 機能の追加・削除が容易
- 関連コードが近くにある
- 大規模アプリでもスケール

**GAFAでの採用**:

- Meta (Facebook) の推奨パターン
- Google Angular のベストプラクティス

## API層: Router → Service → Repository

```
┌─────────────┐
│   Router    │ ← 入出力の定義、認証チェック
├─────────────┤
│   Service   │ ← ビジネスロジック ★
├─────────────┤
│  Supabase   │ ← データアクセス
└─────────────┘
```

### Router（薄い層）

```typescript
// src/server/api/routers/plans/crud.ts
create: protectedProcedure
  .input(createPlanSchema) // Zodでバリデーション
  .mutation(({ ctx, input }) => {
    const service = createPlanService(ctx.supabase);
    return service.create({ userId: ctx.userId, ...input });
  });
```

**役割**:

- 入力のバリデーション（Zod）
- 認証・認可のチェック
- Serviceの呼び出し

### Service（ビジネスロジック）

```typescript
// src/server/services/plans/plan-service.ts
class PlanService {
  async create(params: CreatePlanParams) {
    // バリデーション
    this.validatePlan(params);

    // ビジネスロジック
    const planData = this.buildPlanData(params);

    // DB操作
    return this.supabase.from('plans').insert(planData);
  }
}
```

**役割**:

- ビジネスルールの実装
- 複雑なロジックの集約
- 再利用可能な形に

**なぜService層を分けるか**:

- テストしやすい（DBをモックできる）
- ロジックの再利用
- Routerを薄く保てる

## 状態管理: UI状態 vs サーバー状態

### UI状態（Zustand）

```typescript
// src/features/calendar/stores/useCalendarStore.ts
export const useCalendarStore = create(
  devtools(
    persist(
      (set) => ({
        view: 'week',
        setView: (view) => set({ view }),
      }),
      { name: 'calendar-store' }, // LocalStorage永続化
    ),
  ),
);
```

**使うべき場面**:

- サイドバーの開閉
- 選択中のアイテム
- フィルター条件
- 表示設定

### サーバー状態（TanStack Query）

```typescript
// tRPCと組み合わせて使用
const { data: plans, isLoading } = api.plans.list.useQuery({
  startDate,
  endDate,
});
```

**使うべき場面**:

- サーバーから取得したデータ
- 一覧表示
- 詳細データ

## コンポーネント: Presentational + Container

### Presentational（見た目）

```tsx
// 純粋にUIを担当
function PlanCard({ plan, onEdit, onDelete }) {
  return (
    <Card>
      <h3>{plan.title}</h3>
      <Button onClick={onEdit}>編集</Button>
    </Card>
  );
}
```

### Container（ロジック）

```tsx
// データ取得・状態管理を担当
function PlanCardContainer({ planId }) {
  const { data: plan } = api.plans.getById.useQuery({ id: planId });
  const deletePlan = api.plans.delete.useMutation();

  return <PlanCard plan={plan} onDelete={() => deletePlan.mutate({ id: planId })} />;
}
```

**なぜ分けるか**:

- テストしやすい（Presentationalは純粋関数）
- 再利用しやすい
- 責務が明確

## エラーハンドリング: TRPCError

```typescript
// Service内でエラーをスロー
if (!plan) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'プランが見つかりません',
  });
}

// Client側でキャッチ
const mutation = api.plans.update.useMutation({
  onError: (error) => {
    if (error.data?.code === 'NOT_FOUND') {
      toast.error('プランが見つかりません');
    }
  },
});
```

## 関連ドキュメント

- [DATA_FLOW.md](./DATA_FLOW.md) - データの流れ
- [TOOLS.md](./TOOLS.md) - ツールの役割
