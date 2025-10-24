/**
 * TanStack Queryのキャッシュ戦略設定
 *
 * 機能ごとに適切なstaleTime/gcTimeを定義
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/caching
 */

/**
 * リアルタイム性が重要なデータ
 * - イベント（カレンダー表示）
 * - カレンダー（同期重要）
 */
export const realtimeCache = {
  staleTime: 30 * 1000, // 30秒
  gcTime: 2 * 60 * 1000, // 2分
}

/**
 * 通常のデータ（標準）
 * - タグ（頻繁に変更されない）
 * - スマートフォルダ（設定的な性質）
 * - タグ関連付け
 */
export const standardCache = {
  staleTime: 5 * 60 * 1000, // 5分
  gcTime: 10 * 60 * 1000, // 10分
}

/**
 * めったに変更されないデータ
 * - ユーザー設定
 * - システム設定
 */
export const staticCache = {
  staleTime: 60 * 60 * 1000, // 1時間
  gcTime: 2 * 60 * 60 * 1000, // 2時間
}

/**
 * 機能別のキャッシュ戦略マトリクス
 */
export const cacheStrategies = {
  events: realtimeCache,
  calendars: realtimeCache,
  tags: standardCache,
  itemTags: standardCache,
  tagStats: standardCache,
  smartFolders: standardCache,
  userSettings: staticCache,
} as const

/**
 * キャッシュ戦略の選択ヘルパー
 */
export function getCacheStrategy(feature: keyof typeof cacheStrategies) {
  return cacheStrategies[feature]
}
