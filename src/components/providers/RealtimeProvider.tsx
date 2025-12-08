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
 * 4. 認証ページでは購読をスキップ（ログイン前なので不要）
 *
 * @see /CLAUDE.md - プロバイダー階層の詳細
 */

'use client'

import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const userId = useAuthStore((state) => state.user?.id)
  const loading = useAuthStore((state) => state.loading)
  const [isReady, setIsReady] = useState(false)

  // 認証ページかどうかを判定（ログイン前なのでRealtime購読は不要）
  const isAuthPage = pathname?.includes('/auth/')

  console.debug(
    '[RealtimeProvider] userId:',
    userId,
    'isReady:',
    isReady,
    'isAuthPage:',
    isAuthPage,
    'loading:',
    loading
  )

  // AuthStoreの初期化を待つ
  useEffect(() => {
    // 認証ページでは即座にreadyにする（購読は無効化されるが、フックは呼び出される）
    if (isAuthPage) {
      setIsReady(true)
      return
    }

    // loadingがfalseになるまで待つ（AuthStoreの初期化完了を待つ）
    if (loading) {
      return
    }

    // 少し遅延させてAuthStoreの初期化を確実に待つ
    const timer = setTimeout(() => {
      setIsReady(true)
      console.debug('[RealtimeProvider] Ready. userId:', userId)
    }, 100)

    return () => clearTimeout(timer)
  }, [userId, loading, isAuthPage])

  // 購読を有効化する条件
  // - 認証ページではない
  // - 初期化が完了している
  // - ユーザーIDが存在する
  const shouldSubscribe = !isAuthPage && isReady && !!userId

  // 各機能のRealtime購読
  useCalendarRealtime(userId, { enabled: shouldSubscribe })
  usePlanRealtime(userId, { enabled: shouldSubscribe })
  useTagRealtime(userId, { enabled: shouldSubscribe })
  useNotificationRealtime(userId, shouldSubscribe)

  return <>{children}</>
}
