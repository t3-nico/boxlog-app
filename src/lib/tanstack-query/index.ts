/**
 * TanStack Query ユーティリティ
 *
 * キャッシュ設定、エラーハンドリング、楽観的更新ヘルパーをエクスポート
 */

// キャッシュ設定
export {
  cacheStrategies,
  getCacheStrategy,
  realtimeCache,
  shortTermCache,
  standardCache,
  staticCache,
} from './cache-config';

// エラーハンドリング
export {
  getRetryDelay,
  handleQueryError,
  logMutationSuccess,
  logQueryError,
  shouldRetry,
  type ErrorContext,
} from './error-handler';

// 楽観的更新ヘルパー
export {
  addToList,
  addToPaginatedList,
  // スナップショット・ロールバック
  createSnapshot,
  // プレーンリスト操作
  filterList,
  // ページネーション付きリスト操作
  filterPaginatedList,
  // 一時ID
  generateTempId,
  isTempId,
  removeFromList,
  removeFromPaginatedList,
  replaceInPaginatedList,
  snapshotQuery,
  updateList,
  updatePaginatedList,
  type PaginatedList,
  type Snapshot,
} from './optimistic-mutation';
