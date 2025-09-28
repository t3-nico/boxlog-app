/**
 * Analytics React Hook
 * BoxLogアプリケーション用の統合Analytics管理
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

import { usePerformanceMonitoring } from '@/lib/analytics/speed-insights'
import {
  analytics,
  BOXLOG_EVENTS,
  trackError,
  trackEvent,
  trackProjectCreated,
  trackTaskCompleted,
  trackTaskCreated,
} from '@/lib/analytics/vercel-analytics'

/**
 * タスク関連のイベントデータ
 */
export interface TaskEventData {
  priority?: 'low' | 'medium' | 'high'
  hasDescription: boolean
  hasDueDate: boolean
  projectId?: string
  timeToComplete?: number
}

/**
 * プロジェクト関連のイベントデータ
 */
export interface ProjectEventData {
  hasDescription: boolean
  isPrivate: boolean
  memberCount: number
}

/**
 * Analytics Hook の戻り値
 */
export interface UseAnalyticsReturn {
  // タスク関連
  trackTaskCreate: (data: Omit<TaskEventData, 'timeToComplete'>) => void
  trackTaskComplete: (data: Pick<TaskEventData, 'timeToComplete' | 'priority' | 'hasDescription'>) => void
  trackTaskDelete: (data: { priority?: string }) => void
  trackTaskStatusChange: (data: { from: string; to: string; priority?: string }) => void

  // プロジェクト関連
  trackProjectCreate: (data: ProjectEventData) => void
  trackProjectDelete: (data: { memberCount: number }) => void
  trackProjectShare: (data: { memberCount: number; method: string }) => void

  // ユーザー行動
  trackLogin: (data: { method: string; success: boolean }) => void
  trackLogout: () => void
  trackSettingsChange: (data: { setting: string; value: string }) => void

  // UI操作
  trackThemeChange: (data: { from: string; to: string }) => void
  trackLanguageChange: (data: { from: string; to: string }) => void
  trackSidebarToggle: (data: { action: 'open' | 'close' }) => void

  // エラー・パフォーマンス
  trackError: (data: { errorCode?: number; category?: string; severity?: string; wasRecovered: boolean }) => void
  trackPageLoad: (data: { page: string; loadTime: number }) => void

  // 汎用イベント
  trackCustomEvent: (eventName: string, properties?: Record<string, string | number | boolean>) => void

  // パフォーマンス測定
  startPerformanceMeasure: () => number
  endPerformanceMeasure: (name: string, startTime: number) => void

  // Analytics状態
  isEnabled: boolean
  isHealthy: boolean
}

/**
 * Analytics Hook
 */
export function useAnalytics(): UseAnalyticsReturn {
  const performanceMonitoring = usePerformanceMonitoring()
  const sessionStart = useRef<number>(Date.now())

  // Analytics初期化
  useEffect(() => {
    analytics.initialize()
  }, [])

  // セッション開始をトラッキング
  useEffect(() => {
    trackEvent('session_start', {
      timestamp: sessionStart.current,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    })

    // セッション終了時のクリーンアップ
    return () => {
      const sessionDuration = Date.now() - sessionStart.current
      trackEvent('session_end', {
        duration: sessionDuration,
        timestamp: Date.now(),
      })
    }
  }, [])

  // タスク作成
  const trackTaskCreate = useCallback((data: Omit<TaskEventData, 'timeToComplete'>) => {
    trackTaskCreated({
      priority: data.priority,
      hasDescription: data.hasDescription,
      hasDueDate: data.hasDueDate,
      projectId: data.projectId,
    })
  }, [])

  // タスク完了
  const trackTaskComplete = useCallback(
    (data: Pick<TaskEventData, 'timeToComplete' | 'priority' | 'hasDescription'>) => {
      trackTaskCompleted({
        timeToComplete: data.timeToComplete,
        priority: data.priority,
        hadDescription: data.hasDescription,
      })
    },
    []
  )

  // タスク削除
  const trackTaskDelete = useCallback((data: { priority?: string }) => {
    trackEvent(BOXLOG_EVENTS.TASK_DELETED, {
      priority: data.priority || 'unknown',
    })
  }, [])

  // タスクステータス変更
  const trackTaskStatusChange = useCallback((data: { from: string; to: string; priority?: string }) => {
    trackEvent(BOXLOG_EVENTS.TASK_STATUS_CHANGED, {
      status_from: data.from,
      status_to: data.to,
      priority: data.priority || 'unknown',
    })
  }, [])

  // プロジェクト作成
  const trackProjectCreate = useCallback((data: ProjectEventData) => {
    trackProjectCreated({
      hasDescription: data.hasDescription,
      isPrivate: data.isPrivate,
      memberCount: data.memberCount,
    })
  }, [])

  // プロジェクト削除
  const trackProjectDelete = useCallback((data: { memberCount: number }) => {
    trackEvent(BOXLOG_EVENTS.PROJECT_DELETED, {
      member_count: data.memberCount,
    })
  }, [])

  // プロジェクト共有
  const trackProjectShare = useCallback((data: { memberCount: number; method: string }) => {
    trackEvent(BOXLOG_EVENTS.PROJECT_SHARED, {
      member_count: data.memberCount,
      share_method: data.method,
    })
  }, [])

  // ログイン
  const trackLogin = useCallback((data: { method: string; success: boolean }) => {
    trackEvent(data.success ? BOXLOG_EVENTS.LOGIN_SUCCESS : BOXLOG_EVENTS.LOGIN_FAILED, {
      login_method: data.method,
      timestamp: Date.now(),
    })
  }, [])

  // ログアウト
  const trackLogout = useCallback(() => {
    const sessionDuration = Date.now() - sessionStart.current
    trackEvent(BOXLOG_EVENTS.LOGOUT, {
      session_duration: sessionDuration,
      timestamp: Date.now(),
    })
  }, [])

  // 設定変更
  const trackSettingsChange = useCallback((data: { setting: string; value: string }) => {
    trackEvent(BOXLOG_EVENTS.SETTINGS_CHANGED, {
      setting_name: data.setting,
      setting_value: data.value,
    })
  }, [])

  // テーマ変更
  const trackThemeChange = useCallback((data: { from: string; to: string }) => {
    trackEvent(BOXLOG_EVENTS.THEME_CHANGED, {
      theme_from: data.from,
      theme_to: data.to,
    })
  }, [])

  // 言語変更
  const trackLanguageChange = useCallback((data: { from: string; to: string }) => {
    trackEvent(BOXLOG_EVENTS.LANGUAGE_CHANGED, {
      language_from: data.from,
      language_to: data.to,
    })
  }, [])

  // サイドバートグル
  const trackSidebarToggle = useCallback((data: { action: 'open' | 'close' }) => {
    trackEvent(BOXLOG_EVENTS.SIDEBAR_TOGGLED, {
      sidebar_action: data.action,
    })
  }, [])

  // エラートラッキング
  const trackErrorEvent = useCallback(
    (data: { errorCode?: number; category?: string; severity?: string; wasRecovered: boolean }) => {
      trackError(data)
    },
    []
  )

  // ページ読み込み
  const trackPageLoad = useCallback((data: { page: string; loadTime: number }) => {
    trackEvent('page_load', {
      page_name: data.page,
      load_time: data.loadTime,
      is_slow: data.loadTime > 3000,
    })
  }, [])

  // カスタムイベント
  const trackCustomEvent = useCallback((eventName: string, properties?: Record<string, string | number | boolean>) => {
    trackEvent(eventName, properties)
  }, [])

  // パフォーマンス測定開始
  const startPerformanceMeasure = useCallback(() => {
    return performanceMonitoring.measureStartTime()
  }, [performanceMonitoring])

  // パフォーマンス測定終了
  const endPerformanceMeasure = useCallback(
    (name: string, startTime: number) => {
      performanceMonitoring.measureEnd(name, startTime)
    },
    [performanceMonitoring]
  )

  return {
    // タスク関連
    trackTaskCreate,
    trackTaskComplete,
    trackTaskDelete,
    trackTaskStatusChange,

    // プロジェクト関連
    trackProjectCreate,
    trackProjectDelete,
    trackProjectShare,

    // ユーザー行動
    trackLogin,
    trackLogout,
    trackSettingsChange,

    // UI操作
    trackThemeChange,
    trackLanguageChange,
    trackSidebarToggle,

    // エラー・パフォーマンス
    trackError: trackErrorEvent,
    trackPageLoad,

    // 汎用
    trackCustomEvent,

    // パフォーマンス
    startPerformanceMeasure,
    endPerformanceMeasure,

    // 状態
    isEnabled: analytics.getConfig().enabled,
    isHealthy: analytics.isHealthy(),
  }
}

/**
 * ページビュー追跡用のHook
 */
export function usePageTracking(pageName: string) {
  const { trackPageLoad, startPerformanceMeasure, endPerformanceMeasure } = useAnalytics()

  useEffect(() => {
    const startTime = startPerformanceMeasure()

    // ページが完全に読み込まれた後に測定
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      trackPageLoad({ page: pageName, loadTime })
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [pageName, trackPageLoad, startPerformanceMeasure, endPerformanceMeasure])
}

/**
 * ユーザー行動の自動追跡Hook
 */
export function useUserBehaviorTracking() {
  const { trackCustomEvent } = useAnalytics()

  useEffect(() => {
    // スクロール深度の追跡
    let maxScrollDepth = 0
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )

      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth
        trackCustomEvent('scroll_depth', {
          depth: scrollDepth,
          page: window.location.pathname,
        })
      }
    }

    // クリックの追跡
    const trackClicks = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        trackCustomEvent('ui_interaction', {
          element_type: target.tagName.toLowerCase(),
          element_text: target.textContent?.slice(0, 50) || '',
          page: window.location.pathname,
        })
      }
    }

    // イベントリスナーの追加
    window.addEventListener('scroll', trackScrollDepth, { passive: true })
    document.addEventListener('click', trackClicks)

    return () => {
      window.removeEventListener('scroll', trackScrollDepth)
      document.removeEventListener('click', trackClicks)
    }
  }, [trackCustomEvent])
}

/**
 * フォーム送信の追跡Hook
 */
export function useFormTracking(formName: string) {
  const { trackCustomEvent, startPerformanceMeasure, endPerformanceMeasure } = useAnalytics()

  const trackFormStart = useCallback(() => {
    const startTime = startPerformanceMeasure()
    trackCustomEvent('form_start', {
      form_name: formName,
    })
    return startTime
  }, [formName, trackCustomEvent, startPerformanceMeasure])

  const trackFormSubmit = useCallback(
    (success: boolean, startTime?: number) => {
      if (startTime) {
        endPerformanceMeasure(`form_${formName}`, startTime)
      }

      trackCustomEvent('form_submit', {
        form_name: formName,
        success,
        timestamp: Date.now(),
      })
    },
    [formName, trackCustomEvent, endPerformanceMeasure]
  )

  const trackFormError = useCallback(
    (errorType: string, fieldName?: string) => {
      trackCustomEvent('form_error', {
        form_name: formName,
        error_type: errorType,
        field_name: fieldName || 'unknown',
      })
    },
    [formName, trackCustomEvent]
  )

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
  }
}
