/**
 * Vercel Analytics システム - 統合テスト
 * 全コンポーネントの連携動作を検証
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { speedInsights } from '@/lib/analytics/speed-insights'
import {
  analytics,
  BOXLOG_EVENTS,
  getAnalyticsConfig,
  isAnalyticsConsented,
  setAnalyticsConsent,
  trackError,
  trackEvent,
  trackPerformance,
  trackProjectCreated,
  trackTaskCompleted,
  trackTaskCreated,
  trackUserAction,
} from '@/lib/analytics/vercel-analytics'

// Vercel Analytics のモック
vi.mock('@vercel/analytics/react', () => ({
  Analytics: vi.fn(() => null),
  track: vi.fn(),
}))

// Speed Insights のモック
vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: vi.fn(() => null),
}))

// web-vitals のモック
vi.mock('web-vitals', () => ({
  getCLS: vi.fn((callback) => callback({ value: 0.05, id: 'test-cls', delta: 0.05 })),
  getFID: vi.fn((callback) => callback({ value: 50, id: 'test-fid', delta: 50 })),
  getFCP: vi.fn((callback) => callback({ value: 1500, id: 'test-fcp', delta: 1500 })),
  getLCP: vi.fn((callback) => callback({ value: 2000, id: 'test-lcp', delta: 2000 })),
  getTTFB: vi.fn((callback) => callback({ value: 600, id: 'test-ttfb', delta: 600 })),
}))

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Vercel Analytics システム - 統合テスト', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    // コンソール出力をモック
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // LocalStorage をクリア
    localStorageMock.clear()

    // 環境変数をリセット
    process.env.NODE_ENV = 'development'

    // track モックをリセット
    const { track } = require('@vercel/analytics/react')
    track.mockClear()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('基本的なAnalytics機能', () => {
    it('analytics インスタンスが正しく初期化される', () => {
      expect(analytics).toBeDefined()
      expect(analytics.getConfig()).toHaveProperty('enabled')
      expect(analytics.getConfig()).toHaveProperty('environment')
    })

    it('環境設定が正しく取得される', () => {
      const config = getAnalyticsConfig()

      expect(config.environment).toBe('development')
      expect(config.debug).toBe(true)
      expect(config.privacyMode).toBe(true)
    })

    it('開発環境ではAnalyticsが無効になる', () => {
      process.env.NODE_ENV = 'development'
      const config = getAnalyticsConfig()

      expect(config.enabled).toBe(false)
    })
  })

  describe('BoxLog固有のイベント追跡', () => {
    it('タスク作成イベントが正しく追跡される', () => {
      const taskData = {
        priority: 'high' as const,
        hasDescription: true,
        hasDueDate: true,
        projectId: 'project-123',
      }

      trackTaskCreated(taskData)

      const { track } = require('@vercel/analytics/react')
      expect(track).toHaveBeenCalledWith(BOXLOG_EVENTS.TASK_CREATED, {
        priority: 'high',
        has_description: true,
        has_due_date: true,
        has_project: true,
      })
    })

    it('タスク完了イベントが正しく追跡される', () => {
      const taskData = {
        timeToComplete: 120, // 2時間
        priority: 'medium' as const,
        hadDescription: true,
      }

      trackTaskCompleted(taskData)

      const { track } = require('@vercel/analytics/react')
      expect(track).toHaveBeenCalledWith(BOXLOG_EVENTS.TASK_COMPLETED, {
        time_to_complete: 120,
        priority: 'medium',
        had_description: true,
      })
    })

    it('プロジェクト作成イベントが正しく追跡される', () => {
      const projectData = {
        hasDescription: true,
        isPrivate: false,
        memberCount: 5,
      }

      trackProjectCreated(projectData)

      const { track } = require('@vercel/analytics/react')
      expect(track).toHaveBeenCalledWith(BOXLOG_EVENTS.PROJECT_CREATED, {
        has_description: true,
        is_private: false,
        member_count: 5,
      })
    })

    it('エラーイベントが正しく追跡される', () => {
      const errorData = {
        errorCode: 404,
        errorCategory: 'API',
        severity: 'medium',
        wasRecovered: true,
      }

      trackError(errorData)

      const { track } = require('@vercel/analytics/react')
      expect(track).toHaveBeenCalledWith(BOXLOG_EVENTS.ERROR_OCCURRED, {
        error_code: 404,
        error_category: 'API',
        severity: 'medium',
        was_recovered: true,
      })
    })
  })

  describe('パフォーマンス測定', () => {
    it('Speed Insights が正しく初期化される', () => {
      speedInsights.initialize()

      // メトリクスが記録されることを確認
      const metrics = speedInsights.getMetrics()
      expect(Array.isArray(metrics)).toBe(true)
    })

    it('カスタムパフォーマンス測定が動作する', () => {
      const metric = {
        name: 'custom_operation',
        value: 1500,
        threshold: 1000,
      }

      trackPerformance(metric)

      const { track } = require('@vercel/analytics/react')
      expect(track).toHaveBeenCalledWith('performance_metric', {
        metric_name: 'custom_operation',
        metric_value: 1500,
        threshold: 1000,
      })
    })

    it('パフォーマンスサマリーが生成される', () => {
      const summary = speedInsights.getPerformanceSummary()

      expect(summary).toHaveProperty('overall')
      expect(summary).toHaveProperty('metrics')
      expect(summary).toHaveProperty('recommendations')
      expect(Array.isArray(summary.recommendations)).toBe(true)
    })
  })

  describe('プライバシー・GDPR対応', () => {
    it('デフォルトでは同意が必要', () => {
      expect(isAnalyticsConsented()).toBe(false)
    })

    it('同意設定が正しく保存・取得される', () => {
      setAnalyticsConsent(true)
      expect(isAnalyticsConsented()).toBe(true)

      setAnalyticsConsent(false)
      expect(isAnalyticsConsented()).toBe(false)
    })

    it('同意撤回時にAnalyticsが無効化される', () => {
      setAnalyticsConsent(true)
      expect(analytics.getConfig().enabled).toBeDefined()

      setAnalyticsConsent(false)
      // 無効化ロジックが実行されることを確認
      expect(localStorageMock.getItem('boxlog_analytics_consent')).toBe('false')
    })
  })

  describe('環境別設定', () => {
    it('本番環境でのみAnalyticsが有効になる', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID = 'test-id'

      const config = getAnalyticsConfig()
      expect(config.enabled).toBe(true)
    })

    it('Analytics IDが未設定時は無効になる', () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID

      const config = getAnalyticsConfig()
      expect(config.enabled).toBe(false)
    })

    it('サンプルレートが環境変数で制御される', () => {
      process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE = '0.5'

      const config = getAnalyticsConfig()
      expect(config.sampleRate).toBe(0.5)
    })
  })

  describe('エラー処理・回復力', () => {
    it('Analytics エラーでもアプリケーションが継続動作する', () => {
      const { track } = require('@vercel/analytics/react')
      track.mockImplementation(() => {
        throw new Error('Analytics service unavailable')
      })

      // エラーが発生してもアプリケーションは継続
      expect(() => {
        trackEvent('test_event', { test: true })
      }).not.toThrow()
    })

    it('不正なイベントデータでも適切に処理される', () => {
      expect(() => {
        trackTaskCreated({
          priority: undefined as any,
          hasDescription: true,
          hasDueDate: false,
        })
      }).not.toThrow()
    })
  })

  describe('カスタムイベント', () => {
    it('重要なユーザーアクションが追跡される', () => {
      const testActions = [
        BOXLOG_EVENTS.LOGIN_SUCCESS,
        BOXLOG_EVENTS.LOGOUT,
        BOXLOG_EVENTS.THEME_CHANGED,
        BOXLOG_EVENTS.LANGUAGE_CHANGED,
        BOXLOG_EVENTS.SIDEBAR_TOGGLED,
      ]

      testActions.forEach((action) => {
        trackUserAction(action, { test: true })

        const { track } = require('@vercel/analytics/react')
        expect(track).toHaveBeenCalledWith(
          action,
          expect.objectContaining({
            timestamp: expect.any(Number),
            test: true,
          })
        )
      })
    })

    it('汎用イベント追跡が動作する', () => {
      trackEvent('custom_feature_usage', {
        feature: 'advanced_search',
        usage_count: 5,
        success: true,
      })

      const { track } = require('@vercel/analytics/react')
      expect(track).toHaveBeenCalledWith('custom_feature_usage', {
        feature: 'advanced_search',
        usage_count: 5,
        success: true,
      })
    })
  })

  describe('型安全性', () => {
    it('BoxLogEventName 型が正しく機能する', () => {
      // コンパイル時の型チェック
      const validEvent: typeof BOXLOG_EVENTS.TASK_CREATED = 'task_created'
      expect(validEvent).toBe(BOXLOG_EVENTS.TASK_CREATED)
    })

    it('イベントプロパティの型が正しく制約される', () => {
      // string | number | boolean のみ許可
      expect(() => {
        trackEvent('test', {
          validString: 'test',
          validNumber: 123,
          validBoolean: true,
        })
      }).not.toThrow()
    })
  })
})
