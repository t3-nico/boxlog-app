/**
 * Sentry パフォーマンス監視拡張機能
 * API レスポンス時間・Core Web Vitals・ページロード時間の自動測定
 */

import * as Sentry from '@sentry/nextjs'

/**
 * API レスポンス時間の自動測定
 */
export function instrumentApiCalls() {
  if (typeof window === 'undefined') return

  // fetch API のインストゥルメンテーション
  const originalFetch = window.fetch
  window.fetch = function (...args: Parameters<typeof fetch>) {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url
    const method = args[1]?.method || 'GET'

    return Sentry.startSpan(
      {
        name: `${method} ${url}`,
        op: 'http.client',
        data: {
          url,
          method,
          type: 'fetch',
        },
      },
      async () => {
        const startTime = performance.now()

        try {
          const response = await originalFetch.apply(this, args)
          const endTime = performance.now()
          const duration = endTime - startTime

          // レスポンス時間をSentryに記録
          Sentry.setMeasurement('api_response_time', duration, 'millisecond')

          // エラーレスポンスの場合は追加情報を記録
          if (!response.ok) {
            Sentry.addBreadcrumb({
              message: `API Error: ${response.status} ${response.statusText}`,
              category: 'api',
              level: 'warning',
              data: {
                url,
                method,
                status: response.status,
                duration,
              },
            })
          }

          return response
        } catch (error) {
          const endTime = performance.now()
          const duration = endTime - startTime

          // APIエラーを記録
          Sentry.captureException(error, {
            tags: {
              error_type: 'api_request_failed',
              url,
              method,
            },
            contexts: {
              api_call: {
                url,
                method,
                duration,
                error: error instanceof Error ? error.message : String(error),
              },
            },
          })

          throw error
        }
      }
    )
  }
}

/**
 * ページロード時間の測定
 */
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    // ページロード時間を計測
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
      const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0
      const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0

      // Sentryにメトリクスを送信
      Sentry.setMeasurement('page_load_time', loadTime, 'millisecond')
      Sentry.setMeasurement('dom_content_loaded', domContentLoaded, 'millisecond')

      if (firstPaint > 0) {
        Sentry.setMeasurement('first_paint', firstPaint, 'millisecond')
      }

      if (firstContentfulPaint > 0) {
        Sentry.setMeasurement('first_contentful_paint', firstContentfulPaint, 'millisecond')
      }

      // パンくずリストに記録
      Sentry.addBreadcrumb({
        message: 'Page load performance measured',
        category: 'performance',
        level: 'info',
        data: {
          load_time: loadTime,
          dom_content_loaded: domContentLoaded,
          first_paint: firstPaint,
          first_contentful_paint: firstContentfulPaint,
        },
      })
    }
  })
}

/**
 * Core Web Vitals の自動測定
 */
export function measureCoreWebVitals() {
  if (typeof window === 'undefined') return

  // Dynamic import to avoid SSR issues
  import('web-vitals')
    .then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Cumulative Layout Shift
      onCLS((metric) => {
        Sentry.setMeasurement('cls', metric.value, '')
        Sentry.addBreadcrumb({
          message: 'CLS measured',
          category: 'web-vital',
          level: 'info',
          data: { value: metric.value, rating: metric.rating },
        })
      })

      // First Input Delay
      onFID((metric) => {
        Sentry.setMeasurement('fid', metric.value, 'millisecond')
        Sentry.addBreadcrumb({
          message: 'FID measured',
          category: 'web-vital',
          level: 'info',
          data: { value: metric.value, rating: metric.rating },
        })
      })

      // First Contentful Paint
      onFCP((metric) => {
        Sentry.setMeasurement('fcp', metric.value, 'millisecond')
        Sentry.addBreadcrumb({
          message: 'FCP measured',
          category: 'web-vital',
          level: 'info',
          data: { value: metric.value, rating: metric.rating },
        })
      })

      // Largest Contentful Paint
      onLCP((metric) => {
        Sentry.setMeasurement('lcp', metric.value, 'millisecond')
        Sentry.addBreadcrumb({
          message: 'LCP measured',
          category: 'web-vital',
          level: 'info',
          data: { value: metric.value, rating: metric.rating },
        })
      })

      // Time to First Byte
      onTTFB((metric) => {
        Sentry.setMeasurement('ttfb', metric.value, 'millisecond')
        Sentry.addBreadcrumb({
          message: 'TTFB measured',
          category: 'web-vital',
          level: 'info',
          data: { value: metric.value, rating: metric.rating },
        })
      })
    })
    .catch((error) => {
      console.warn('Failed to load web-vitals:', error)
    })
}

/**
 * すべてのパフォーマンス監視を初期化
 */
export function initPerformanceMonitoring() {
  instrumentApiCalls()
  measurePageLoad()
  measureCoreWebVitals()
}
