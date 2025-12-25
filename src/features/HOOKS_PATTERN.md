# カスタムフック実装パターン

tRPCカスタムフックの統一された実装パターンです。

## 推奨パターン

```typescript
import { api } from '@/lib/trpc';
import { cacheStrategies } from '@/lib/tanstack-query/cache-config';

/**
 * データ取得フック
 *
 * @param filters - フィルタパラメータ
 * @param options - 追加オプション
 */
export function useItems(filters?: ItemFilters, options?: { enabled?: boolean }) {
  return api.items.list.useQuery(filters, {
    ...cacheStrategies.items, // キャッシュ戦略を適用
    retry: 1, // リトライ設定
    ...options,
  });
}

/**
 * ミューテーションフック
 */
export function useItemMutations() {
  const utils = api.useUtils();

  // キャッシュ無効化ヘルパー
  const invalidateItems = () => {
    void utils.items.list.invalidate();
  };

  const createItem = api.items.create.useMutation({
    onSuccess: (newItem) => {
      // Toast通知
      toast.success('作成しました');
      // キャッシュ無効化
      invalidateItems();
    },
    onError: (error) => {
      toast.error('作成に失敗しました');
    },
  });

  return { createItem };
}
```

## チェックリスト

- [ ] `api` クライアントを使用（`trpc` ではなく）
- [ ] `cacheStrategies` からキャッシュ戦略を適用
- [ ] `retry: 1` を設定
- [ ] JSDoc でパラメータと戻り値を説明
- [ ] キャッシュ無効化ヘルパー関数を作成
- [ ] `void` でPromiseを明示的に無視

## キャッシュ戦略の選択

| データ種別           | 戦略             | staleTime |
| -------------------- | ---------------- | --------- |
| リアルタイム性が重要 | `realtimeCache`  | 30秒      |
| 通常のデータ         | `standardCache`  | 5分       |
| 短期キャッシュ       | `shortTermCache` | 1分       |
| 静的データ           | `staticCache`    | 1時間     |

## ファイル命名規則

```
src/features/{feature}/hooks/
├── use{Feature}s.ts         # 一覧取得
├── use{Feature}.ts          # 単一取得
├── use{Feature}Mutations.ts # ミューテーション
└── index.ts                 # エクスポート
```
