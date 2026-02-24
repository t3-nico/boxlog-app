# アーキテクチャ・設計

## データフェッチング

アプリ内部のAPIは全てtRPC化完了。新規APIは必ずtRPCで実装する。

```typescript
// ✅ tRPC + TanStack Query
const { data } = api.plans.list.useQuery();

// ✅ Server Component での直接取得
const data = await serverHelpers.plans.list.fetch();

// ❌ 禁止
useEffect(() => { fetch('/api/plans').then(...) }, []);
```

## 状態管理

Zustand でグローバル状態、useState でローカル状態を管理する。

```typescript
// ✅ セレクタで必要な状態のみ購読
const count = useTagStore((s) => s.count);

// ❌ 全状態を購読しない（不要な再レンダリング）
const { count, tags, filters } = useTagStore();
```

**詳細**: `.claude/skills/store-creating/SKILL.md`

## tRPC設計

### tRPC vs REST

- **アプリ内部API** → tRPC（E2E型安全、自動補完）
- **外部公開API** → REST（監視、認証フロー等の外部ツール連携）

### tRPC化完了エリア

Plans (12), Tags (7), Records (2), Notifications (4), User (2), Profile (2), Auth (3), UserSettings (2), NotificationPreferences (2)

### REST維持エリア

`/api/auth/*`, `/api/health/*`, `/api/v1/system/*`, `/api/config/*`, `/api/csp-report/*`

### 新規API実装パターン

```typescript
// Router → Service → Supabase の3層構造
export const myRouter = createTRPCRouter({
  getData: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const service = createMyService(ctx.supabase);
      return await service.getData({ userId: ctx.userId, id: input.id });
    }),
});
```

### エラーコード

| コード                  | 用途                           |
| ----------------------- | ------------------------------ |
| `BAD_REQUEST`           | 入力値不正、ビジネスルール違反 |
| `NOT_FOUND`             | リソースが存在しない           |
| `FORBIDDEN`             | 権限なし                       |
| `UNAUTHORIZED`          | 未認証                         |
| `INTERNAL_SERVER_ERROR` | 予期しないエラー               |

**詳細**: `.claude/skills/trpc-router-creating/SKILL.md`

## 楽観的更新

ユーザー操作に対応する全mutationで楽観的更新を実装する（体感速度200-800ms改善）。

- ユーザー操作 → 楽観的更新を実装
- 不可逆操作（削除等） → 楽観的更新なし、確認ダイアログ
- 複数キャッシュに影響 → 全キャッシュを更新

**詳細**: `.claude/skills/optimistic-update/SKILL.md`

## エラー境界

機能単位で設置する。アプリ全体を1つのエラー境界でラップしない。

```tsx
// ✅ 各Featureのルートに設置
<ErrorBoundary fallback={<ErrorFallback />}>
  <TagList />
</ErrorBoundary>
```

**詳細**: `.claude/skills/error-handling/SKILL.md`

## 環境構成（3環境分離）

| 環境           | Supabase                    | Vercel      |
| -------------- | --------------------------- | ----------- |
| **Local**      | ローカル（127.0.0.1:54321） | npm run dev |
| **Staging**    | dayopt-staging（Tokyo）     | Preview URL |
| **Production** | t3-nico's Project（Tokyo）  | 本番URL     |

- 各環境のDBとAuthは完全に独立（アカウント共有不可）
- Vercel Preview = main以外のブランチ → Staging DB
- マイグレーションは各環境に個別適用が必要

**詳細**: `.claude/skills/supabase/SKILL.md`
