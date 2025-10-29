// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * 命名辞書システム - Reactフック
 * Issue #353: URL/ファイル名/分析イベントの統一命名管理
 *
 * Reactコンポーネント内での統一命名を支援するフック
 */

'use client'

import { useCallback, useMemo } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { FEATURES, SCREENS } from '@/constants/naming'
import {
  createActionEvent,
  createEngagementEvent,
  createErrorEvent,
  createPageViewEvent,
  createPerformanceEvent,
  getComponentClassName,
  getPageClassName,
  getParameterizedRoute,
  isValidScreen,
  navigateToScreen,
  safeGetScreenName,
  type FeatureName,
  type ScreenName,
} from '@/lib/naming-utils'

// ==============================================
// 🎯 分析イベント追跡フック
// ==============================================

/**
 * 分析イベント追跡フック
 */
export function useAnalyticsTracking(currentScreen?: ScreenName) {
  /**
   * ページビューを追跡
   */
  const trackPageView = useCallback((screen: ScreenName, properties?: Record<string, any>) => {
    const event = createPageViewEvent(screen, properties)

    // 実際の分析サービスに送信
    // analytics.track(event.name, event.properties)

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Page View:', event)
    }

    return event
  }, [])

  /**
   * ユーザーアクションを追跡
   */
  const trackAction = useCallback(
    (feature: FeatureName, properties?: Record<string, any>) => {
      const event = createActionEvent(feature, currentScreen, properties)

      // 実際の分析サービスに送信
      // analytics.track(event.name, event.properties)

      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Action:', event)
      }

      return event
    },
    [currentScreen]
  )

  /**
   * エンゲージメントを追跡
   */
  const trackEngagement = useCallback(
    (type: string, details: string, properties?: Record<string, any>) => {
      const event = createEngagementEvent(type, details, currentScreen, properties)

      // 実際の分析サービスに送信
      // analytics.track(event.name, event.properties)

      if (process.env.NODE_ENV === 'development') {
        console.log('💡 Engagement:', event)
      }

      return event
    },
    [currentScreen]
  )

  /**
   * エラーを追跡
   */
  const trackError = useCallback(
    (errorType: string, context: string, properties?: Record<string, any>) => {
      const event = createErrorEvent(errorType, context, currentScreen, properties)

      // 実際の分析サービスに送信
      // analytics.track(event.name, event.properties)

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', event)
      }

      return event
    },
    [currentScreen]
  )

  /**
   * パフォーマンスを追跡
   */
  const trackPerformance = useCallback(
    (metric: string, component: string, value: number, properties?: Record<string, any>) => {
      const event = createPerformanceEvent(metric, component, value, currentScreen, properties)

      // 実際の分析サービスに送信
      // analytics.track(event.name, event.properties)

      if (process.env.NODE_ENV === 'development') {
        console.log('⚡ Performance:', event)
      }

      return event
    },
    [currentScreen]
  )

  return {
    trackPageView,
    trackAction,
    trackEngagement,
    trackError,
    trackPerformance,
  }
}

// ==============================================
// 🛣️ ナビゲーションフック
// ==============================================

/**
 * 型安全なナビゲーションフック
 */
export function useNamingNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { trackPageView } = useAnalyticsTracking()

  /**
   * 現在の画面を取得
   */
  const currentScreen = useMemo(() => {
    // パス名から画面を推定
    if ((pathname || '/') === '/') return 'dashboard'
    if ((pathname || '/').startsWith('/auth/login')) return 'login'
    if ((pathname || '/').startsWith('/auth/signup')) return 'signup'
    if ((pathname || '/').startsWith('/auth/reset-password')) return 'password_reset'
    if ((pathname || '/').startsWith('/auth/password')) return 'password_change'
    if ((pathname || '/').startsWith('/auth')) return 'auth'
    if ((pathname || '/').startsWith('/calendar/')) return 'calendar_view'
    if ((pathname || '/') === '/calendar') return 'calendar'
    if ((pathname || '/').startsWith('/inbox')) return 'inbox'
    if ((pathname || '/') === '/ai-chat') return 'ai_chat'
    if ((pathname || '/').startsWith('/stats/') && pathname !== '/stats') {
      // 詳細な統計ページの判定
      if ((pathname || '/') === '/stats/life-vision') return 'stats_life_vision'
      if ((pathname || '/') === '/stats/identity') return 'stats_identity'
      if ((pathname || '/') === '/stats/goals') return 'stats_goals'
      if ((pathname || '/') === '/stats/value') return 'stats_value'
      if ((pathname || '/') === '/stats/antivalues') return 'stats_antivalues'
      if ((pathname || '/') === '/stats/purpose') return 'stats_purpose'
      if ((pathname || '/') === '/stats/principles') return 'stats_principles'
      if ((pathname || '/') === '/stats/connpass') return 'stats_connpass'
      if ((pathname || '/') === '/stats/reflect/all') return 'stats_reflect_all'
      if ((pathname || '/') === '/stats/reflect/today') return 'stats_reflect_today'
      if ((pathname || '/') === '/stats/reflect/week') return 'stats_reflect_week'
      if ((pathname || '/') === '/stats/reflect/month') return 'stats_reflect_month'
      if ((pathname || '/') === '/stats/act/try') return 'stats_act_try'
      if ((pathname || '/') === '/stats/act/next') return 'stats_act_next'
      return 'stats_detail'
    }
    if ((pathname || '/') === '/stats') return 'stats'
    if ((pathname || '/').startsWith('/settings/')) {
      // 詳細な設定ページの判定
      if ((pathname || '/') === '/settings/general') return 'settings_general'
      if ((pathname || '/') === '/settings/account') return 'settings_account'
      if ((pathname || '/') === '/settings/preferences') return 'settings_preferences'
      if ((pathname || '/') === '/settings/notifications') return 'settings_notifications'
      if ((pathname || '/') === '/settings/calendar') return 'settings_calendar'
      if ((pathname || '/') === '/settings/tags') return 'settings_tags'
      if ((pathname || '/') === '/settings/templates') return 'settings_templates'
      if ((pathname || '/') === '/settings/integration') return 'settings_integration'
      if ((pathname || '/') === '/settings/data-export') return 'settings_data_export'
      if ((pathname || '/') === '/settings/plan-billing') return 'settings_plan_billing'
      if ((pathname || '/') === '/settings/trash') return 'settings_trash'
      if ((pathname || '/') === '/settings/legal') return 'settings_legal'
      if ((pathname || '/') === '/settings/test-autosave') return 'settings_test_autosave'
      if ((pathname || '/') === '/settings/chronotype') return 'settings_chronotype'
      return 'settings'
    }
    if ((pathname || '/') === '/settings') return 'settings'
    if ((pathname || '/') === '/help/chat-history') return 'help_chat_history'
    if ((pathname || '/') === '/help') return 'help'
    if ((pathname || '/') === '/error') return 'error'
    if ((pathname || '/') === '/test-sentry') return 'test_sentry'

    return 'dashboard' // デフォルト
  }, [pathname])

  /**
   * 型安全なナビゲーション
   */
  const navigateTo = useCallback(
    (screen: ScreenName, parameter?: string) => {
      const path = parameter ? getParameterizedRoute(screen, parameter) : navigateToScreen(screen)

      router.push(path)

      // ページビューを追跡
      trackPageView(screen, { previous_screen: currentScreen })
    },
    [router, trackPageView, currentScreen]
  )

  /**
   * 戻る
   */
  const goBack = useCallback(() => {
    router.back()
  }, [router])

  return {
    currentScreen,
    navigateTo,
    goBack,
    pathname,
  }
}

// ==============================================
// 🎨 スタイリングフック
// ==============================================

/**
 * CSSクラス生成フック
 */
export function useNamingStyles(componentName?: string, screenOverride?: ScreenName) {
  const { currentScreen } = useNamingNavigation()
  const screen = screenOverride || currentScreen

  /**
   * ページレベルクラス
   */
  const pageClassName = useMemo(() => {
    return getPageClassName(screen)
  }, [screen])

  /**
   * コンポーネントレベルクラス生成
   */
  const getComponentClass = useCallback(
    (name?: string, element?: string, modifier?: string) => {
      const finalComponentName = name || componentName || 'component'
      return getComponentClassName(finalComponentName, element, modifier)
    },
    [componentName]
  )

  return {
    pageClassName,
    getComponentClass,
    currentScreen: screen,
  }
}

// ==============================================
// 🔍 バリデーションフック
// ==============================================

/**
 * 命名バリデーションフック
 */
export function useNamingValidation() {
  /**
   * 画面名をバリデート
   */
  const validateScreen = useCallback((screen: string) => {
    return isValidScreen(screen)
  }, [])

  /**
   * パス名から画面名を抽出してバリデート
   */
  const validateCurrentPath = useCallback((pathname: string) => {
    const screenName = safeGetScreenName(pathname)
    return screenName ? { isValid: true, screen: screenName } : { isValid: false, screen: null }
  }, [])

  /**
   * 使用可能な画面リストを取得
   */
  const availableScreens = useMemo(() => {
    return Object.keys(SCREENS) as ScreenName[]
  }, [])

  /**
   * 使用可能な機能リストを取得
   */
  const availableFeatures = useMemo(() => {
    return Object.keys(FEATURES) as FeatureName[]
  }, [])

  return {
    validateScreen,
    validateCurrentPath,
    availableScreens,
    availableFeatures,
  }
}

// ==============================================
// 🎯 統合フック
// ==============================================

/**
 * 命名システム統合フック
 * すべての機能を一つのフックで提供
 */
export function useNaming(componentName?: string) {
  const navigation = useNamingNavigation()
  const analytics = useAnalyticsTracking(navigation.currentScreen)
  const styles = useNamingStyles(componentName, navigation.currentScreen)
  const validation = useNamingValidation()

  return {
    // ナビゲーション
    ...navigation,
    // 分析
    ...analytics,
    // スタイリング
    ...styles,
    // バリデーション
    ...validation,
  }
}

export default useNaming
