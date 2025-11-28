/**
 * 📊 Analytics Provider Component
 *
 * アプリケーション全体でのアナリティクス機能提供
 * ユーザー同意管理、設定、セッション追跡
 */

'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import type { AnalyticsProvider } from '@/lib/analytics'
import { analytics, setUserConsent, setUserId, updateConfig } from '@/lib/analytics'

/**
 * 🎯 Analytics Context の型定義
 */
interface AnalyticsContextValue {
  /** ユーザー同意状態 */
  hasUserConsent: boolean
  /** 同意状態を更新 */
  setConsent: (consent: boolean) => void
  /** ユーザーID設定 */
  setUser: (userId?: string) => void
  /** プロバイダー設定 */
  enabledProviders: AnalyticsProvider[]
  /** デバッグモード */
  debugMode: boolean
  /** アナリティクス準備状態 */
  isReady: boolean
}

/**
 * 📊 Analytics Context
 */
const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined)

/**
 * ⚙️ Analytics Provider Props
 */
interface AnalyticsProviderProps {
  children: ReactNode
  /** 有効なアナリティクスプロバイダー */
  enabledProviders?: AnalyticsProvider[]
  /** デバッグモードを有効にする */
  debug?: boolean
  /** 開発環境での追跡を無効にする */
  disableInDevelopment?: boolean
  /** 自動的にユーザー同意を要求する */
  requireConsent?: boolean
  /** 初期同意状態 */
  initialConsent?: boolean
  /** ユーザーID */
  userId?: string
  /** カスタムエンドポイント */
  customEndpoint?: string
}

/**
 * 📊 Analytics Provider Component
 */
export function AnalyticsProvider({
  children,
  enabledProviders = ['vercel'],
  debug = process.env.NODE_ENV === 'development',
  disableInDevelopment = false,
  requireConsent = true,
  initialConsent = false,
  userId,
  customEndpoint,
}: AnalyticsProviderProps) {
  const [hasUserConsent, setHasUserConsent] = useState(initialConsent)
  const [isReady, setIsReady] = useState(false)

  /**
   * 🔐 同意状態の更新
   */
  const setConsent = (consent: boolean) => {
    setHasUserConsent(consent)
    setUserConsent(consent)

    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('boxlog_analytics_consent', consent.toString())
    }
  }

  /**
   * 👤 ユーザーID設定
   */
  const setUser = (newUserId?: string) => {
    setUserId(newUserId)
  }

  /**
   * 🚀 初期化処理
   */
  useEffect(() => {
    // ローカルストレージから同意状態を復元
    if (typeof window !== 'undefined' && requireConsent) {
      const savedConsent = localStorage.getItem('boxlog_analytics_consent')
      if (savedConsent !== null) {
        const consent = savedConsent === 'true'
        setHasUserConsent(consent)
        setUserConsent(consent)
      }
    }

    // アナリティクス設定を更新
    updateConfig({
      enabledProviders,
      debug,
      disableInDevelopment,
      requireConsent,
      customEndpoint,
    })

    // 初期ユーザーID設定
    if (userId) {
      setUserId(userId)
    }

    setIsReady(true)
  }, [enabledProviders, debug, disableInDevelopment, requireConsent, userId, customEndpoint])

  /**
   * 🎯 Context値
   */
  const contextValue: AnalyticsContextValue = {
    hasUserConsent,
    setConsent,
    setUser,
    enabledProviders,
    debugMode: debug,
    isReady,
  }

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>
}

/**
 * 🪝 Analytics Context Hook
 */
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

/**
 * 🍪 Cookie Consent Banner Component
 */
interface CookieConsentProps {
  /** カスタムメッセージ */
  message?: string
  /** 同意ボタンテキスト */
  acceptText?: string
  /** 拒否ボタンテキスト */
  declineText?: string
  /** プライバシーポリシーURL */
  privacyPolicyUrl?: string
  /** バナー位置 */
  position?: 'top' | 'bottom'
  /** カスタムスタイル */
  className?: string
}

export function CookieConsentBanner({
  message = 'このサイトでは、サービス向上のためにクッキーを使用しています。',
  acceptText = '同意する',
  declineText = '拒否',
  privacyPolicyUrl = '/privacy',
  position = 'bottom',
  className = '',
}: CookieConsentProps) {
  const { hasUserConsent, setConsent } = useAnalyticsContext()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // 同意状態が未設定の場合のみバナーを表示
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('boxlog_analytics_consent')
      if (savedConsent === null) {
        setShowBanner(true)
      }
    }
  }, [])

  const handleAccept = () => {
    setConsent(true)
    setShowBanner(false)
  }

  const handleDecline = () => {
    setConsent(false)
    setShowBanner(false)
  }

  if (!showBanner || hasUserConsent !== false) {
    return null
  }

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0'

  return (
    <div
      className={`border-border bg-card fixed right-0 left-0 z-50 border-t p-4 shadow-lg ${positionClasses} ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">
            {message}
            {privacyPolicyUrl ? (
              <>
                {' '}
                <a href={privacyPolicyUrl} className="text-primary hover:text-primary/80 underline">
                  詳細はこちら
                </a>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="border-border text-muted-foreground hover:bg-foreground/8 rounded-md border px-4 py-2 text-sm transition-colors"
          >
            {declineText}
          </button>
          <button
            onClick={handleAccept}
            className="bg-primary text-primary-foreground hover:bg-primary/92 rounded-md px-4 py-2 text-sm transition-colors"
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 🎯 Analytics Debug Panel Component
 */
export function AnalyticsDebugPanel() {
  const { debugMode, enabledProviders, hasUserConsent, isReady } = useAnalyticsContext()
  const [events, setEvents] = useState<Array<{ name: string; timestamp: number; properties: any }>>([])

  useEffect(() => {
    if (!debugMode) return

    // イベント追跡のフック（デバッグ用）
    const originalTrack = analytics.track
    analytics.track = function (eventName, properties) {
      setEvents((prev) => [
        ...prev.slice(-49), // 最新50件を保持
        {
          name: eventName,
          timestamp: Date.now(),
          properties,
        },
      ])
      return originalTrack.call(this, eventName, properties)
    }

    return () => {
      analytics.track = originalTrack
    }
  }, [debugMode])

  if (!debugMode) return null

  return (
    <div className="bg-opacity-90 fixed right-4 bottom-4 z-50 max-h-96 w-96 overflow-y-auto rounded-xl bg-black p-4 text-xs text-white">
      <div className="mb-2">
        <h3 className="text-sm font-bold">📊 Analytics Debug</h3>
        <div className="text-xs text-gray-300">
          <span className={`mr-2 ${isReady ? 'text-green-400' : 'text-red-400'}`}>{isReady ? '✅' : '❌'} Ready</span>
          <span className={`mr-2 ${hasUserConsent ? 'text-green-400' : 'text-red-400'}`}>
            {hasUserConsent ? '✅' : '❌'} Consent
          </span>
          <span className="text-blue-400">Providers: {enabledProviders.join(', ')}</span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <h4 className="mb-1 font-semibold">Recent Events:</h4>
        {events.length === 0 ? (
          <p className="text-gray-400">No events tracked yet</p>
        ) : (
          events.slice(-10).map((event, index) => (
            <div key={index} className="border-border mb-1 border-b pb-1">
              <div className="font-mono text-yellow-400">{event.name}</div>
              <div className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</div>
              {Object.keys(event.properties).length > 0 && (
                <div className="truncate text-xs text-gray-300">{JSON.stringify(event.properties, null, 0)}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
