/**
 * 🪝 BoxLog Analytics Hooks
 *
 * React Hook形式でのアナリティクス追跡
 * コンポーネントでの使用を簡素化
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { AnalyticsEventName, EventProperties } from './events'
import { ANALYTICS_EVENTS } from './events'
import { trackEvent } from './tracker'

/**
 * 📊 基本的なアナリティクスフック
 */
export function useAnalytics() {
  const track = useCallback((eventName: AnalyticsEventName, properties?: EventProperties) => {
    trackEvent(eventName, properties)
  }, [])

  return { track }
}

/**
 * 👀 ページビュー追跡フック
 */
export function usePageView(pageName?: string) {
  useEffect(() => {
    const page = pageName || (typeof window !== 'undefined' ? window.location.pathname : '')
    trackEvent(ANALYTICS_EVENTS.NAVIGATION.PAGE_VIEW, {
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_name: page,
    })
  }, [pageName])
}

/**
 * 🖱️ クリック追跡フック
 */
export function useClickTracking(
  eventName: AnalyticsEventName,
  properties?: EventProperties
): (event?: React.MouseEvent) => void {
  return useCallback(
    (event?: React.MouseEvent) => {
      const clickProperties: EventProperties = {
        ...properties,
        interaction_type: 'click',
        element_type: event?.currentTarget.tagName.toLowerCase(),
        element_text: (event?.currentTarget as HTMLElement)?.textContent?.slice(0, 100),
      }
      trackEvent(eventName, clickProperties)
    },
    [eventName, properties]
  )
}

/**
 * ⏱️ 時間追跡フック
 */
export function useTimeTracking(eventName: AnalyticsEventName, properties?: EventProperties) {
  const startTimeRef = useRef<number | null>(null)

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const end = useCallback(
    (additionalProperties?: EventProperties) => {
      if (startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current
        trackEvent(eventName, {
          ...properties,
          ...additionalProperties,
          duration_ms: duration,
        })
        startTimeRef.current = null
      }
    },
    [eventName, properties]
  )

  return { start, end }
}

/**
 * 🔍 検索追跡フック
 */
export function useSearchTracking() {
  const trackSearch = useCallback((query: string, resultCount?: number, filters?: Record<string, any>) => {
    trackEvent(ANALYTICS_EVENTS.FEATURE.SEARCH_PERFORM, {
      search_query: query.slice(0, 100), // 最初の100文字のみ
      result_count: resultCount,
      has_filters: filters && Object.keys(filters).length > 0,
      filter_count: filters ? Object.keys(filters).length : 0,
    })
  }, [])

  return { trackSearch }
}

/**
 * ❌ エラー追跡フック
 */
export function useErrorTracking() {
  const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    const stackTrace = typeof error === 'object' ? error.stack : undefined

    trackEvent(ANALYTICS_EVENTS.ERROR.CLIENT_ERROR, {
      error_message: errorMessage.slice(0, 200),
      stack_trace: stackTrace?.slice(0, 500),
      component_name: context?.component,
      user_action: context?.action,
      error_boundary: context?.errorBoundary,
      severity: context?.severity || 'medium',
    })
  }, [])

  return { trackError }
}

/**
 * 📊 フォーム追跡フック
 */
export function useFormTracking(formName: string) {
  const trackFormStart = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.INTERACTION_COUNT, {
      interaction_type: 'form_start',
      form_name: formName,
    })
  }, [formName])

  const trackFormSubmit = useCallback(
    (success: boolean, validationErrors?: string[]) => {
      trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.INTERACTION_COUNT, {
        interaction_type: 'form_submit',
        form_name: formName,
        success,
        validation_error_count: validationErrors?.length || 0,
        validation_errors: validationErrors?.slice(0, 5), // 最初の5個のエラーのみ
      })
    },
    [formName]
  )

  const trackFieldInteraction = useCallback(
    (fieldName: string, interactionType: 'focus' | 'blur' | 'change') => {
      trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.INTERACTION_COUNT, {
        interaction_type: `form_field_${interactionType}`,
        form_name: formName,
        field_name: fieldName,
      })
    },
    [formName]
  )

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction,
  }
}

/**
 * 🎯 フィーチャー使用追跡フック
 */
export function useFeatureTracking(featureName: string, category?: string) {
  const trackFeatureUse = useCallback(
    (action: string, properties?: EventProperties) => {
      const featureEventName = `feature_${featureName.toLowerCase().replace(/\s+/g, '_')}_${action}`

      // 事前定義されたイベント名にフォールバックする仕組み
      const allFeatureEvents = Object.values(ANALYTICS_EVENTS.FEATURE) as string[]
      const eventName = allFeatureEvents.includes(featureEventName)
        ? (featureEventName as AnalyticsEventName)
        : ANALYTICS_EVENTS.FEATURE.DASHBOARD_WIDGET_INTERACT

      trackEvent(eventName, {
        feature_name: featureName,
        feature_category: category,
        action,
        ...properties,
      })
    },
    [featureName, category]
  )

  const trackFeatureDiscovery = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.FEATURE_DISCOVERY, {
      feature_name: featureName,
      feature_category: category,
    })
  }, [featureName, category])

  return {
    trackFeatureUse,
    trackFeatureDiscovery,
  }
}

/**
 * 📱 デバイス・環境情報フック
 */
export function useDeviceTracking() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deviceInfo = {
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        color_depth: window.screen.colorDepth,
        pixel_ratio: window.devicePixelRatio,
        online: navigator.onLine,
        language: navigator.language,
        languages: navigator.languages,
        user_agent: navigator.userAgent.slice(0, 200),
      }

      trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.SESSION_START, deviceInfo)
    }
  }, [])
}

/**
 * 🔄 セッション追跡フック
 */
export function useSessionTracking() {
  const sessionStartRef = useRef<number>(Date.now())
  const lastActivityRef = useRef<number>(Date.now())
  const pageViewCountRef = useRef<number>(0)
  const interactionCountRef = useRef<number>(0)

  // アクティビティ更新
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    interactionCountRef.current += 1
  }, [])

  // ページビューカウント
  const incrementPageView = useCallback(() => {
    pageViewCountRef.current += 1
  }, [])

  // セッション終了時のトラッキング
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartRef.current
      const idleTime = Date.now() - lastActivityRef.current

      trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.SESSION_END, {
        session_duration_ms: sessionDuration,
        idle_time_ms: idleTime,
        page_views: pageViewCountRef.current,
        interactions: interactionCountRef.current,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload()
    }
  }, [])

  return {
    updateActivity,
    incrementPageView,
  }
}

/**
 * 🎨 A/B テスト追跡フック
 */
export function useABTestTracking(testName: string, variant: string) {
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.FEATURE_DISCOVERY, {
      feature_name: 'ab_test',
      test_name: testName,
      variant,
      experiment_group: `${testName}_${variant}`,
    })
  }, [testName, variant])

  const trackConversion = useCallback(
    (conversionType: string, value?: number) => {
      trackEvent(ANALYTICS_EVENTS.BUSINESS.CONVERSION, {
        conversion_type: conversionType,
        test_name: testName,
        variant,
        value_amount: value,
        experiment_group: `${testName}_${variant}`,
      })
    },
    [testName, variant]
  )

  return { trackConversion }
}

/**
 * 🎯 パフォーマンス追跡フック
 */
export function usePerformanceTracking() {
  const trackPerformance = useCallback((metricName: string, value: number, unit: string = 'ms') => {
    trackEvent(ANALYTICS_EVENTS.PERFORMANCE.PAGE_LOAD_TIME, {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
    })
  }, [])

  const trackAPIPerformance = useCallback((endpoint: string, duration: number, statusCode?: number) => {
    trackEvent(ANALYTICS_EVENTS.PERFORMANCE.API_RESPONSE_TIME, {
      endpoint: endpoint.slice(0, 100),
      metric_value: duration,
      metric_unit: 'ms',
      status_code: statusCode,
    })
  }, [])

  return {
    trackPerformance,
    trackAPIPerformance,
  }
}
