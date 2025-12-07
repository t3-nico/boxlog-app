'use client'

import type { ReactNode } from 'react'

import { useSessionMonitor } from '../hooks/useSessionMonitor'

import { SessionTimeoutDialog } from './SessionTimeoutDialog'

interface SessionMonitorProviderProps {
  children: ReactNode
}

/**
 * セッション監視プロバイダー
 *
 * 認証済みページで使用し、セッションタイムアウトを監視する
 * タイムアウト警告時にダイアログを表示
 *
 * @example
 * ```tsx
 * // layout.tsx
 * <SessionMonitorProvider>
 *   {children}
 * </SessionMonitorProvider>
 * ```
 */
export function SessionMonitorProvider({ children }: SessionMonitorProviderProps) {
  const { showTimeoutWarning, remainingTime, extendSession, logout } = useSessionMonitor()

  return (
    <>
      {children}
      <SessionTimeoutDialog
        open={showTimeoutWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={logout}
      />
    </>
  )
}
