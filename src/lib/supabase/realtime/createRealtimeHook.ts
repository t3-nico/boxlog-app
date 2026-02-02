/**
 * Realtimeフック生成ファクトリー
 *
 * 共通パターンを抽出し、feature固有のRealtime購読フックを簡潔に作成できる
 *
 * @example
 * ```typescript
 * // feature固有のフックを簡潔に定義
 * export const usePlanRealtime = createRealtimeHook({
 *   name: 'plan',
 *   table: 'plans',
 *   useMutationGuard: () => usePlanCacheStore((s) => s.isMutating),
 *   onInvalidate: (utils, payload) => {
 *     void utils.plans.list.invalidate();
 *     const id = payload.new?.id ?? payload.old?.id;
 *     if (id) void utils.plans.getById.invalidate({ id });
 *   },
 * });
 * ```
 */

'use client';

import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

import { useRealtimeSubscription } from './useRealtimeSubscription';

import type { AppRouter } from '@/server/api/root';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// tRPC Utils の型
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;
type TRPCUtils = ReturnType<typeof api.useUtils>;

/** Realtimeイベントペイロード */
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}

/** Realtimeフックオプション */
export interface RealtimeHookOptions {
  /** 購読を有効化するか（デフォルト: true） */
  enabled?: boolean;
}

/** createRealtimeHook の設定 */
export interface RealtimeHookConfig<T = { id: string }> {
  /** フック名（ログ用、チャンネル名に使用） */
  name: string;
  /** 購読対象のテーブル名 */
  table: string;
  /** mutation中かどうかを返すフック（二重更新防止） */
  useMutationGuard: () => boolean;
  /** キャッシュ無効化処理 */
  onInvalidate: (utils: TRPCUtils, payload: RealtimePayload<T>) => void;
  /** エラー時の処理（オプション） */
  onError?: (error: Error) => void;
}

/**
 * Realtimeフックを生成するファクトリー関数
 *
 * 共通パターン:
 * 1. userId + enabledオプション
 * 2. mutation中はイベントをスキップ
 * 3. キャッシュ無効化
 * 4. ログ出力
 */
export function createRealtimeHook<T extends { id?: string } = { id: string }>(
  config: RealtimeHookConfig<T>,
) {
  const { name, table, useMutationGuard, onInvalidate, onError } = config;

  return function useRealtimeHook(userId: string | undefined, options: RealtimeHookOptions = {}) {
    const { enabled = true } = options;
    const utils = api.useUtils();
    const isMutating = useMutationGuard();

    useRealtimeSubscription<T>({
      channelName: `${name}-changes-${userId}`,
      table,
      event: '*', // INSERT, UPDATE, DELETE すべて
      ...(userId && { filter: `user_id=eq.${userId}` }),
      enabled,
      onEvent: (payload) => {
        const typedPayload = payload as unknown as RealtimePayload<T>;
        const recordId = typedPayload.new?.id ?? typedPayload.old?.id;

        logger.debug(`[${name} Realtime] Event detected:`, typedPayload.eventType, recordId);

        // 自分のmutation中はRealtime経由の更新をスキップ（二重更新防止）
        if (isMutating) {
          logger.debug(`[${name} Realtime] Skipping invalidation (mutation in progress)`);
          return;
        }

        // キャッシュ無効化
        onInvalidate(utils, typedPayload);
      },
      onError: (error) => {
        logger.error(`[${name} Realtime] Subscription error:`, error);
        onError?.(error);
      },
    });
  };
}

// ========================================
// 型エクスポート
// ========================================
export type { RouterInputs, RouterOutputs, TRPCUtils };
