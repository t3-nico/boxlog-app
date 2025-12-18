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
 * 注意:
 * このProviderは認証必須ページ専用。
 * 公開ページでは使用しないこと（PublicProvidersを使用）。
 *
 * @see /CLAUDE.md - プロバイダー階層の詳細
 * @see src/components/providers/PublicProviders.tsx - 公開ページ用
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
  const loading = useAuthStore((state) => state.loading)
  const [isReady, setIsReady] = useState(false)
  // クライアントサイドマウント確認（SSR時のtRPCコンテキストエラー回避）
  const [isMounted, setIsMounted] = useState(false)

  // クライアントマウント時にフラグを設定
  useEffect(() => {
    setIsMounted(true)
  }, [])

  console.debug('[RealtimeProvider] userId:', userId, 'isReady:', isReady, 'loading:', loading, 'isMounted:', isMounted)

  // AuthStoreの初期化を待つ
  useEffect(() => {
    // loadingがfalseになるまで待つ（AuthStoreの初期化完了を待つ）
    if (loading) {
      return
    }

    // AuthStoreのloading完了 = 初期化完了なので、即座にreadyにする
    // 以前は100ms遅延があったが、不要な遅延のため削除
    setIsReady(true)
    console.debug('[RealtimeProvider] Ready. userId:', userId)
  }, [userId, loading])

  // 購読を有効化する条件
  // - クライアントサイドでマウントされている
  // - 初期化が完了している
  // - ユーザーIDが存在する
  const shouldSubscribe = isMounted && isReady && !!userId

  // 各機能のRealtime購読
  // 注意: フックは常に呼び出されるが、enabled=falseの場合は購読しない
  useCalendarRealtime(userId, { enabled: shouldSubscribe })
  usePlanRealtime(userId, { enabled: shouldSubscribe })
  useTagRealtime(userId, { enabled: shouldSubscribe })
  useNotificationRealtime(userId, shouldSubscribe)

  return <>{children}</>
}
