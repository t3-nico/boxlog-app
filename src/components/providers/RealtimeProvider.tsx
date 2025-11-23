/**
 * Realtime購読を一元管理するProvider
 *
 * @description
 * アプリケーション全体でSupabase Realtimeの購読を一元管理。
 * 各機能のRealtime購読をここで有効化することで、
 * 重複購読を防ぎ、接続数を最適化する。
 *
 * アーキテクチャ:
 * 1. AuthStoreから認証済みユーザーIDを取得
 * 2. ユーザーIDが存在する場合のみ購読を有効化
 * 3. 各機能のRealtime購読フックを呼び出し
 *
 * @see /CLAUDE.md - プロバイダー階層の詳細
 */

'use client'

import { useEffect, useState } from 'react'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useCalendarRealtime } from '@/features/calendar/hooks/useCalendarRealtime'
import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime'
import { usePlanRealtime } from '@/features/plans/hooks/usePlanRealtime'
import { useTagRealtime } from '@/features/tags/hooks/useTagRealtime'

interface RealtimeProviderProps {
  children: React.ReactNode
}

/**
 * Realtime購読Provider
 *
 * プロバイダー階層での位置:
 * QueryClientProvider → tRPC Provider → AuthStoreInitializer → RealtimeProvider
 *
 * 理由: AuthStoreが初期化された後に購読を開始する必要があるため
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const userId = useAuthStore((state) => state.user?.id)
  const [isReady, setIsReady] = useState(false)

  console.log('[RealtimeProvider] userId:', userId, 'isReady:', isReady)

  // AuthStoreの初期化を待つ
  useEffect(() => {
    // 少し遅延させてAuthStoreの初期化を確実に待つ
    const timer = setTimeout(() => {
      setIsReady(true)
      console.log('[RealtimeProvider] Ready. userId:', userId)
    }, 100)

    return () => clearTimeout(timer)
  }, [userId])

  // 各機能のRealtime購読
  useCalendarRealtime(userId, { enabled: isReady && !!userId })
  usePlanRealtime(userId, { enabled: isReady && !!userId })
  useTagRealtime(userId, { enabled: isReady && !!userId })
  useNotificationRealtime(userId, isReady && !!userId)

  return <>{children}</>
}
