---
paths:
  - 'src/**/*.{ts,tsx}'
---

# アーキテクチャ・設計

## データフェッチング

内部APIは全てtRPC化完了。新規APIは必ずtRPCで実装する。

```typescript
// ✅ tRPC + TanStack Query
const { data } = api.plans.list.useQuery();

// ✅ Server Component での直接取得
const data = await serverHelpers.plans.list.fetch();

// ❌ 禁止
useEffect(() => { fetch('/api/plans').then(...) }, []);
```

REST維持: `/api/auth/*`, `/api/health/*`, `/api/v1/system/*`, `/api/config/*`

## 状態管理

Zustand でグローバル、useState でローカル。セレクタで必要な状態のみ購読。

## tRPC実装パターン

Router → Service → Supabase の3層構造。詳細: `.claude/skills/trpc-router-creating/SKILL.md`

## 楽観的更新

ユーザー操作mutationは全て楽観的更新を実装。不可逆操作は除く。
詳細: `.claude/skills/optimistic-update/SKILL.md`

## エラー境界

機能単位で設置。アプリ全体を1つでラップしない。

## 環境構成（3環境分離）

| 環境           | Supabase                    | Vercel      |
| -------------- | --------------------------- | ----------- |
| **Local**      | ローカル（127.0.0.1:54321） | npm run dev |
| **Staging**    | dayopt-staging（Tokyo）     | Preview URL |
| **Production** | t3-nico's Project（Tokyo）  | 本番URL     |

各環境のDBとAuthは完全に独立。マイグレーションは各環境に個別適用が必要。
