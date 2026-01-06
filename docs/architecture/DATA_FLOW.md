# データの流れ

BoxLogにおけるデータの流れを解説する。

## 全体像

```
[ユーザー操作]
     ↓
[React Component] ← Zustand (UI状態)
     ↓
[tRPC Client] ← TanStack Query (キャッシュ)
     ↓
[tRPC Router]
     ↓
[Service Layer] ← ビジネスロジック
     ↓
[Supabase Client]
     ↓
[PostgreSQL] ← RLS (行レベルセキュリティ)
```

## 具体例: プランを作成する

### 1. ユーザー操作

ユーザーがカレンダー上でドラッグしてプランを作成

### 2. React Component

```tsx
// src/features/calendar/components/...
const handleCreatePlan = async (data) => {
  await createPlan.mutateAsync(data);
};
```

### 3. tRPC Client + TanStack Query

```tsx
// Hooksで呼び出し
const createPlan = api.plans.create.useMutation({
  onSuccess: () => {
    // キャッシュを無効化して再取得
    utils.plans.list.invalidate();
  },
});
```

**なぜTanStack Queryを使うか**:

- サーバーデータのキャッシング
- 自動リフェッチ
- 楽観的更新のサポート

### 4. tRPC Router

```typescript
// src/server/api/routers/plans/crud.ts
create: protectedProcedure.input(createPlanSchema).mutation(async ({ ctx, input }) => {
  const service = createPlanService(ctx.supabase);
  return service.create({ userId: ctx.userId, ...input });
});
```

**なぜtRPCを使うか**:

- 型安全性（クライアント↔サーバー間）
- 自動補完が効く
- REST APIより少ないコード量

### 5. Service Layer

```typescript
// src/server/services/plans/plan-service.ts
class PlanService {
  async create(params) {
    // バリデーション
    // ビジネスロジック
    // DB操作
  }
}
```

**なぜService層を分けるか**:

- ビジネスロジックの再利用
- テストしやすさ
- ルーターを薄く保つ

### 6. Supabase Client

```typescript
const { data, error } = await this.supabase.from('plans').insert(planData).select().single();
```

### 7. PostgreSQL + RLS

```sql
-- ユーザーは自分のプランのみ操作可能
CREATE POLICY "Users can manage own plans"
ON plans FOR ALL
USING (auth.uid() = user_id);
```

**なぜRLSを使うか**:

- データベースレベルでのセキュリティ
- アプリケーションコードでの漏れを防ぐ
- Googleのゼロトラスト原則に準拠

## 状態管理の使い分け

| 状態の種類               | 管理方法       | 例                               |
| ------------------------ | -------------- | -------------------------------- |
| **サーバーデータ**       | TanStack Query | プラン一覧、タグ                 |
| **UI状態（グローバル）** | Zustand        | サイドバー開閉、選択中のアイテム |
| **UI状態（ローカル）**   | useState       | フォームの入力値、モーダルの開閉 |
| **URL状態**              | Next.js Router | 現在のページ、クエリパラメータ   |

## 関連ドキュメント

- [TOOLS.md](./TOOLS.md) - 各ツールの役割
- [PATTERNS.md](./PATTERNS.md) - 設計パターン
