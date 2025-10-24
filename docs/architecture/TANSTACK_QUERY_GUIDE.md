# TanStack Query使用ガイド

BoxLogプロジェクトにおけるTanStack Query（React Query）の標準的な使用方法とベストプラクティス。

## 📋 目次

1. [Query Key Factory パターン](#query-key-factory-パターン)
2. [キャッシュ戦略](#キャッシュ戦略)
3. [エラーハンドリング](#エラーハンドリング)
4. [楽観的更新](#楽観的更新)
5. [テスト方法](#テスト方法)

---

## Query Key Factory パターン

### 基本構造

```typescript
export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...featureKeys.lists(), { filters }] as const,
  details: () => [...featureKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureKeys.details(), id] as const,
}
```

### 実装例

```typescript
// features/tags/hooks/use-tags.ts
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...tagKeys.lists(), { filters }] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// 使用例
export function useTags(includeChildren = true) {
  return useQuery({
    queryKey: tagKeys.list({ includeChildren }),
    queryFn: () => tagAPI.fetchTags(includeChildren),
    ...cacheStrategies.tags,
  })
}
```

### 階層的なキャッシュ無効化

```typescript
// すべてのタグ関連クエリを無効化
queryClient.invalidateQueries({ queryKey: tagKeys.all })

// リストのみ無効化
queryClient.invalidateQueries({ queryKey: tagKeys.lists() })

// 特定のフィルタのみ無効化
queryClient.invalidateQueries({ queryKey: tagKeys.list({ includeChildren: true }) })

// 特定のタグ詳細のみ無効化
queryClient.invalidateQueries({ queryKey: tagKeys.detail('tag-id') })
```

---

## キャッシュ戦略

### 設定ファイル

```typescript
// src/lib/tanstack-query/cache-config.ts
export const cacheStrategies = {
  events: realtimeCache, // 30秒
  calendars: realtimeCache, // 30秒
  tags: standardCache, // 5分
  smartFolders: standardCache, // 5分
  userSettings: staticCache, // 1時間
}
```

### 機能別キャッシュ戦略

| 機能              | staleTime | gcTime | 理由                 |
| ----------------- | --------- | ------ | -------------------- |
| **Events**        | 30秒      | 2分    | リアルタイム性が重要 |
| **Calendar**      | 30秒      | 2分    | 同期が重要           |
| **Tags**          | 5分       | 10分   | 頻繁に変更されない   |
| **Smart Folders** | 5分       | 10分   | 設定的な性質         |
| **User Settings** | 1時間     | 2時間  | ほぼ静的             |

### 使用例

```typescript
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => fetchEvents(filters),
    ...cacheStrategies.events, // リアルタイム性重視（30秒）
  })
}
```

---

## エラーハンドリング

### 統一エラーハンドラー

```typescript
import { handleQueryError } from '@/lib/tanstack-query/error-handler'

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tagAPI.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      handleQueryError(error, {
        queryKey: tagKeys.all,
        operation: 'create',
        feature: 'tags',
      })
    },
  })
}
```

### リトライ戦略

グローバル設定で自動的に適用されます（`src/components/providers.tsx`）：

- **404エラー**: リトライしない
- **401/403エラー**: リトライしない
- **429エラー**: 最大2回、長めの遅延でリトライ
- **その他のエラー**: 最大3回、指数バックオフでリトライ

---

## 楽観的更新

### 汎用ヘルパー使用

```typescript
import { createOptimisticUpdateHelper } from '@/lib/tanstack-query/optimistic-update'

export function useOptimisticTagUpdate() {
  const queryClient = useQueryClient()

  return createOptimisticUpdateHelper<TagWithChildren[], Tag>(queryClient, tagKeys.list({ includeChildren: true }))
}

// 使用例
const optimistic = useOptimisticTagUpdate()
optimistic.add(newTag)
optimistic.update(tagId, { name: 'Updated' })
optimistic.remove(tagId)
```

### Mutation内での楽観的更新

```typescript
import { createMutationWithOptimisticUpdate } from '@/lib/tanstack-query/optimistic-update'

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tagAPI.createTag,
    ...createMutationWithOptimisticUpdate(queryClient, {
      queryKey: tagKeys.lists(),
      onMutate: async (newTag) => {
        await queryClient.cancelQueries({ queryKey: tagKeys.lists() })
        const previous = queryClient.getQueryData(tagKeys.lists())

        // 楽観的更新
        queryClient.setQueryData(tagKeys.lists(), (old) => [...old, newTag])

        return { previous }
      },
      onError: (error, variables, context) => {
        // エラー時にロールバック
        if (context?.previous) {
          queryClient.setQueryData(tagKeys.lists(), context.previous)
        }
      },
    }),
  })
}
```

---

## テスト方法

### テストヘルパー

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // テスト時はリトライしない
        gcTime: Infinity,
      },
    },
  })
}

function createWrapper() {
  const queryClient = createTestQueryClient()
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### テスト例

```typescript
import { describe, it, expect } from 'vitest'
import { useTags } from './use-tags'

describe('useTags', () => {
  it('should fetch tags', async () => {
    const { result } = renderHook(() => useTags(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(3)
  })

  it('should filter tags by includeChildren', async () => {
    const { result } = renderHook(() => useTags(false), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // 検証ロジック
  })
})
```

---

## マイグレーションガイド

### Before: 手動fetch

```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  fetch('/api/data')
    .then((res) => res.json())
    .then(setData)
    .finally(() => setLoading(false))
}, [])
```

### After: TanStack Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: dataKeys.lists(),
  queryFn: () => fetch('/api/data').then((res) => res.json()),
  ...cacheStrategies.standard,
})
```

---

## 参考リソース

- [TanStack Query公式ドキュメント](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

---

**📖 最終更新**: 2025-10-24 | **バージョン**: v1.0
