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
 *
 * Supabase Realtime購読により常に最新データを保持
 * staleTime=30秒: ページ遷移時の再フェッチを抑制しつつ、Realtime経由の更新は即座に反映
 */
export const realtimeCache = {
  staleTime: 30 * 1000, // 30秒（Realtime購読で更新されるため長めでOK）
  gcTime: 2 * 60 * 1000, // 2分
}

/**
 * 通常のデータ（標準）
 * - タグ（頻繁に変更されない）
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
 * 短期キャッシュ（1分）
 * - タグ使用数（頻繁に更新される可能性）
 * - プランアクティビティ（履歴は少し遅れてもOK）
 */
export const shortTermCache = {
  staleTime: 60 * 1000, // 1分
  gcTime: 5 * 60 * 1000, // 5分
}

/**
 * 機能別のキャッシュ戦略マトリクス
 */
export const cacheStrategies = {
  events: realtimeCache,
  calendars: realtimeCache,
  calendarViewState: standardCache, // ビュー状態はリアルタイム不要
  tags: standardCache,
  tagGroups: standardCache, // タググループは頻繁に変更されない
  itemTags: standardCache,
  tagStats: standardCache,
  tagUsage: shortTermCache, // タグ使用数は頻繁に更新される
  userSettings: staticCache,
  inbox: realtimeCache, // Inboxデータはリアルタイム性が重要
  plans: realtimeCache, // プランもリアルタイム性が重要
  planActivities: shortTermCache, // アクティビティ履歴は少し遅れてもOK
  sessions: realtimeCache, // セッションもリアルタイム性が重要
  notifications: shortTermCache, // 通知はリアルタイム性が重要だが、短期キャッシュで十分
  profile: staticCache, // プロフィールはめったに変更されない
} as const

/**
 * キャッシュ戦略の選択ヘルパー
 */
export function getCacheStrategy(feature: keyof typeof cacheStrategies) {
  return cacheStrategies[feature]
}
