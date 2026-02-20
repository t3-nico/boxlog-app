/**
 * Mutation Utilities
 *
 * Plan/Record mutation フック共通のユーティリティ関数
 */

/**
 * 一時ID生成（楽観的作成用）
 */
export function createTempId(): string {
  return `temp-${Date.now()}`;
}

/**
 * DateTime正規化（Zodバリデーション対策）
 *
 * null/undefined/空文字をundefinedに、有効な日時をISO 8601（UTC）形式に変換
 */
export function normalizeDateTime(value: string | null | undefined): string | undefined {
  if (!value || value === '') return undefined;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * エンティティリストクエリにマッチする predicate を生成
 *
 * tRPC v11 のクエリキー形式: [['entity', 'list'], { input, type }]
 *
 * @example
 * ```typescript
 * const isPlansList = createListQueryPredicate('plans');
 * queryClient.setQueriesData({ predicate: isPlansList }, updateFn);
 * ```
 */
export function createListQueryPredicate(entityName: 'plans' | 'records') {
  return (query: { queryKey: unknown }) => {
    const key = query.queryKey;
    return (
      Array.isArray(key) &&
      key.length >= 1 &&
      Array.isArray(key[0]) &&
      key[0][0] === entityName &&
      key[0][1] === 'list'
    );
  };
}

/**
 * エンティティキャッシュ無効化オプション
 */
export interface InvalidateEntityCachesOptions {
  /** 個別エンティティID（省略時は全体のみ） */
  entityId?: string;
  /** refetchType（default: 'active'） */
  refetchType?: 'active' | 'all' | 'none';
}

/**
 * エンティティ関連キャッシュを無効化
 *
 * Plan/Record 共通の無効化パターンを一元管理
 *
 * @example
 * ```typescript
 * await invalidateEntityCaches(utils, 'plans', { entityId: '123' });
 * await invalidateEntityCaches(utils, 'records', { refetchType: 'all' });
 * ```
 */
export async function invalidateEntityCaches(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  utils: any,
  entityName: 'plans' | 'records',
  options: InvalidateEntityCachesOptions = {},
): Promise<void> {
  const { entityId, refetchType = 'active' } = options;

  // エンティティリストを無効化
  await utils[entityName].list.invalidate(undefined, { refetchType });

  // 個別エンティティを無効化
  if (entityId) {
    await utils[entityName].getById.invalidate({ id: entityId }, { refetchType });
  }

  // 累積時間を無効化（Plan/Record共通）
  await utils.plans.getCumulativeTime.invalidate();

  // Record固有の無効化
  if (entityName === 'records') {
    await utils.records.listByPlan.invalidate();
    await utils.records.getRecent.invalidate();
  }
}
