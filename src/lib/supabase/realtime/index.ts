/**
 * Supabase Realtime ユーティリティ
 *
 * @example
 * ```typescript
 * // 汎用購読フック
 * import { useRealtimeSubscription } from '@/lib/supabase/realtime';
 *
 * // ファクトリーでカスタムフックを作成
 * import { createRealtimeHook } from '@/lib/supabase/realtime';
 *
 * export const useMyRealtime = createRealtimeHook({
 *   name: 'my-entity',
 *   table: 'my_table',
 *   useMutationGuard: () => useMyStore((s) => s.isMutating),
 *   onInvalidate: (utils) => void utils.myEntity.list.invalidate(),
 * });
 * ```
 */

// 汎用購読フック
export { useRealtimeSubscription } from './useRealtimeSubscription';

// ファクトリー
export {
  createRealtimeHook,
  type RealtimeHookConfig,
  type RealtimeHookOptions,
  type RealtimePayload,
} from './createRealtimeHook';

// 型定義
export {
  RealtimeSubscriptionError,
  type PostgresChangeEvent,
  type RealtimeChannelManager,
  type RealtimeChannelStatus,
  type RealtimeSubscriptionConfig,
} from './types';
