/**
 * 汎用Supabase Realtime購読フック
 *
 * @description
 * Supabase Realtimeの購読を管理する汎用フック。
 * React公式ベストプラクティス準拠：
 * - useEffectでのクリーンアップ
 * - 依存配列の適切な管理
 * - エラーハンドリング
 *
 * @see https://supabase.com/docs/guides/realtime/postgres-changes
 * @see https://react.dev/learn/synchronizing-with-effects
 *
 * @example
 * ```tsx
 * useRealtimeSubscription({
 *   channelName: 'calendar-changes',
 *   table: 'events',
 *   event: '*',
 *   filter: `user_id=eq.${userId}`,
 *   onEvent: () => {
 *     queryClient.invalidateQueries({ queryKey: ['events'] })
 *   },
 * })
 * ```
 */

'use client'

import { useEffect, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import type { RealtimeChannelManager, RealtimeSubscriptionConfig } from './types'
import { RealtimeSubscriptionError } from './types'

export function useRealtimeSubscription<T extends Record<string, unknown> = Record<string, unknown>>(
  config: RealtimeSubscriptionConfig<T>
) {
  const channelRef = useRef<RealtimeChannelManager | null>(null)
  const configRef = useRef(config)
  const [channelManager, setChannelManager] = useState<RealtimeChannelManager | null>(null)

  // 最新のconfigを保持（クロージャ問題を回避）
  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    const { channelName, enabled = true } = configRef.current

    // enabled=false の場合は購読をスキップ
    if (!enabled) {
      console.debug(`[Realtime] Subscription disabled: ${channelName}`)
      return
    }

    const supabase = createClient()
    const { table, event, filter, schema = 'public', onEvent, onError } = configRef.current

    try {
      // チャンネル作成
      const channel = supabase.channel(channelName)

      // Postgres変更イベントを購読
      // Supabase Realtime型定義の制約を回避するため、anyを使用
      const typedChannel = channel as {
        on: (event: string, config: Record<string, unknown>, callback: (payload: unknown) => void) => typeof channel
      }

      typedChannel.on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: unknown) => {
          try {
            onEvent(payload as never)
          } catch (error) {
            const subscriptionError = new RealtimeSubscriptionError(
              `Error in onEvent callback for channel "${channelName}"`,
              channelName,
              error
            )
            if (onError) {
              onError(subscriptionError)
            } else {
              console.error(subscriptionError)
            }
          }
        }
      )

      // 購読開始
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug(`[Realtime] Subscribed to channel: ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          const error = new RealtimeSubscriptionError(`Failed to subscribe to channel: ${channelName}`, channelName)
          if (onError) {
            onError(error)
          } else {
            console.error(error)
          }
        }
      })

      // チャンネル管理情報を保存
      const manager: RealtimeChannelManager = {
        channel,
        status: 'subscribing',
        unsubscribe: async () => {
          await supabase.removeChannel(channel)
        },
      }
      channelRef.current = manager
      setChannelManager(manager)
    } catch (error) {
      const subscriptionError = new RealtimeSubscriptionError(
        `Failed to create channel: ${channelName}`,
        channelName,
        error
      )
      if (onError) {
        onError(subscriptionError)
      } else {
        console.error(subscriptionError)
      }
    }

    // クリーンアップ: コンポーネントアンマウント時に購読解除
    return () => {
      if (channelRef.current) {
        const { channel } = channelRef.current
        supabase.removeChannel(channel)
        console.debug(`[Realtime] Unsubscribed from channel: ${channelName}`)
        channelRef.current = null
        setChannelManager(null)
      }
    }
  }, []) // 空配列: マウント時に1回だけ実行

  return channelManager
}
