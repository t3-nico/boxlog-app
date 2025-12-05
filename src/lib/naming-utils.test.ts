import { describe, expect, it } from 'vitest'

import {
  createActionEvent,
  createEngagementEvent,
  createErrorEvent,
  createPageViewEvent,
  createPerformanceEvent,
  getAllFeatures,
  getAllScreens,
  getComponentClassName,
  getFeatureName,
  getFeatureValue,
  getPageClassName,
  getParameterizedRoute,
  getScreenName,
  getScreenValue,
  isValidFeature,
  isValidFeatureValue,
  isValidScreen,
  isValidScreenValue,
  navigateToScreen,
  safeGetFeatureName,
  safeGetScreenName,
  validateNamingConsistency,
} from './naming-utils'

describe('naming-utils', () => {
  describe('分析イベント生成', () => {
    describe('createPageViewEvent', () => {
      it('ページビューイベントを生成できる', () => {
        const event = createPageViewEvent('DASHBOARD')

        expect(event.name).toBeDefined()
        expect(event.screen).toBe('dashboard')
        expect(event.properties).toBeDefined()
        expect(event.properties?.timestamp).toBeDefined()
        expect(event.properties?.screen_name).toBe('dashboard')
      })

      it('追加プロパティを含めることができる', () => {
        const event = createPageViewEvent('CALENDAR', { source: 'sidebar' })

        expect(event.properties?.source).toBe('sidebar')
      })
    })

    describe('createActionEvent', () => {
      it('アクションイベントを生成できる', () => {
        const event = createActionEvent('TASK_CREATE')

        expect(event.name).toBeDefined()
        expect(event.feature).toBe('task_create')
        expect(event.properties?.feature_name).toBe('task_create')
      })

      it('画面情報を含めることができる', () => {
        const event = createActionEvent('TASK_CREATE', 'CALENDAR')

        expect(event.screen).toBe('calendar')
        expect(event.properties?.screen_name).toBe('calendar')
      })
    })

    describe('createEngagementEvent', () => {
      it('エンゲージメントイベントを生成できる', () => {
        const event = createEngagementEvent('click', 'button', 'DASHBOARD')

        expect(event.name).toBeDefined()
        expect(event.properties?.engagement_type).toBe('click')
        expect(event.properties?.engagement_details).toBe('button')
      })
    })

    describe('createErrorEvent', () => {
      it('エラーイベントを生成できる', () => {
        const event = createErrorEvent('network', 'api_call', 'CALENDAR')

        expect(event.name).toBeDefined()
        expect(event.properties?.error_type).toBe('network')
        expect(event.properties?.error_context).toBe('api_call')
      })
    })

    describe('createPerformanceEvent', () => {
      it('パフォーマンスイベントを生成できる', () => {
        const event = createPerformanceEvent('render_time', 'CalendarView', 150, 'CALENDAR')

        expect(event.name).toBeDefined()
        expect(event.properties?.performance_metric).toBe('render_time')
        expect(event.properties?.component_name).toBe('CalendarView')
        expect(event.properties?.metric_value).toBe(150)
      })
    })
  })

  describe('ルーティングヘルパー', () => {
    describe('navigateToScreen', () => {
      it('基本的な画面のルートを返す', () => {
        expect(navigateToScreen('DASHBOARD')).toBeDefined()
        expect(navigateToScreen('CALENDAR')).toBeDefined()
        expect(navigateToScreen('SETTINGS')).toBeDefined()
      })

      it('認証系画面のルートを返す', () => {
        expect(navigateToScreen('LOGIN')).toBeDefined()
        expect(navigateToScreen('SIGNUP')).toBeDefined()
      })
    })

    describe('getParameterizedRoute', () => {
      it('calendar_viewにパラメータを適用できる', () => {
        const route = getParameterizedRoute('CALENDAR_VIEW', 'month')
        expect(route).toContain('month')
      })

      it('stats_detailにパラメータを適用できる', () => {
        const route = getParameterizedRoute('STATS_DETAIL', 'task-123')
        expect(route).toContain('task-123')
      })

      it('パラメータ不要な画面は通常のルートを返す', () => {
        const route = getParameterizedRoute('DASHBOARD', '')
        expect(route).toBeDefined()
      })
    })
  })

  describe('スタイリングヘルパー', () => {
    describe('getPageClassName', () => {
      it('ページクラス名を生成できる', () => {
        const className = getPageClassName('DASHBOARD')
        expect(className).toBeDefined()
        expect(typeof className).toBe('string')
      })
    })

    describe('getComponentClassName', () => {
      it('コンポーネントクラス名を生成できる', () => {
        const className = getComponentClassName('Button')
        expect(className).toBeDefined()
      })

      it('要素名を含めることができる', () => {
        const className = getComponentClassName('Card', 'header')
        expect(className).toBeDefined()
      })

      it('モディファイアを含めることができる', () => {
        const className = getComponentClassName('Card', 'header', 'active')
        expect(className).toBeDefined()
      })
    })
  })

  describe('バリデーション関数', () => {
    describe('isValidScreen', () => {
      it('有効な画面名でtrueを返す', () => {
        expect(isValidScreen('DASHBOARD')).toBe(true)
        expect(isValidScreen('CALENDAR')).toBe(true)
        expect(isValidScreen('SETTINGS')).toBe(true)
      })

      it('無効な画面名でfalseを返す', () => {
        expect(isValidScreen('INVALID_SCREEN')).toBe(false)
        expect(isValidScreen('')).toBe(false)
      })
    })

    describe('isValidFeature', () => {
      it('有効な機能名でtrueを返す', () => {
        expect(isValidFeature('TASK_CREATE')).toBe(true)
        expect(isValidFeature('TASK_UPDATE')).toBe(true)
      })

      it('無効な機能名でfalseを返す', () => {
        expect(isValidFeature('INVALID_FEATURE')).toBe(false)
      })
    })

    describe('isValidScreenValue', () => {
      it('有効な画面値でtrueを返す', () => {
        expect(isValidScreenValue('dashboard')).toBe(true)
      })

      it('無効な画面値でfalseを返す', () => {
        expect(isValidScreenValue('not_a_screen')).toBe(false)
      })
    })

    describe('isValidFeatureValue', () => {
      it('有効な機能値でtrueを返す', () => {
        expect(isValidFeatureValue('task_create')).toBe(true)
      })

      it('無効な機能値でfalseを返す', () => {
        expect(isValidFeatureValue('not_a_feature')).toBe(false)
      })
    })
  })

  describe('変換関数', () => {
    describe('getScreenValue', () => {
      it('画面名から画面値を取得できる', () => {
        const value = getScreenValue('DASHBOARD')
        expect(value).toBe('dashboard')
      })
    })

    describe('getFeatureValue', () => {
      it('機能名から機能値を取得できる', () => {
        const value = getFeatureValue('TASK_CREATE')
        expect(value).toBe('task_create')
      })
    })

    describe('getScreenName', () => {
      it('画面値から画面名を取得できる', () => {
        const name = getScreenName('dashboard')
        expect(name).toBe('DASHBOARD')
      })
    })

    describe('getFeatureName', () => {
      it('機能値から機能名を取得できる', () => {
        const name = getFeatureName('task_create')
        expect(name).toBe('TASK_CREATE')
      })
    })

    describe('safeGetScreenName', () => {
      it('有効な値で画面名を返す', () => {
        const name = safeGetScreenName('dashboard')
        expect(name).toBe('DASHBOARD')
      })

      it('無効な値でundefinedを返す', () => {
        const name = safeGetScreenName('invalid')
        expect(name).toBeUndefined()
      })
    })

    describe('safeGetFeatureName', () => {
      it('有効な値で機能名を返す', () => {
        const name = safeGetFeatureName('task_create')
        expect(name).toBe('TASK_CREATE')
      })

      it('無効な値でundefinedを返す', () => {
        const name = safeGetFeatureName('invalid')
        expect(name).toBeUndefined()
      })
    })
  })

  describe('デバッグ・開発支援', () => {
    describe('getAllScreens', () => {
      it('全画面の一覧を取得できる', () => {
        const screens = getAllScreens()

        expect(Array.isArray(screens)).toBe(true)
        expect(screens.length).toBeGreaterThan(0)

        // 各アイテムがname, valueを持つ
        screens.forEach((screen) => {
          expect(screen.name).toBeDefined()
          expect(screen.value).toBeDefined()
        })
      })

      it('DASHBOARDが含まれている', () => {
        const screens = getAllScreens()
        const dashboard = screens.find((s) => s.name === 'DASHBOARD')
        expect(dashboard).toBeDefined()
      })
    })

    describe('getAllFeatures', () => {
      it('全機能の一覧を取得できる', () => {
        const features = getAllFeatures()

        expect(Array.isArray(features)).toBe(true)
        expect(features.length).toBeGreaterThan(0)

        // 各アイテムがname, valueを持つ
        features.forEach((feature) => {
          expect(feature.name).toBeDefined()
          expect(feature.value).toBeDefined()
        })
      })

      it('TASK_CREATEが含まれている', () => {
        const features = getAllFeatures()
        const taskCreate = features.find((f) => f.name === 'TASK_CREATE')
        expect(taskCreate).toBeDefined()
      })
    })

    describe('validateNamingConsistency', () => {
      it('命名辞書の一貫性をチェックできる', () => {
        const result = validateNamingConsistency()

        expect(result).toHaveProperty('isValid')
        expect(result).toHaveProperty('errors')
        expect(Array.isArray(result.errors)).toBe(true)
      })

      it('現在の命名辞書は一貫性がある', () => {
        const result = validateNamingConsistency()
        expect(result.isValid).toBe(true)
        expect(result.errors.length).toBe(0)
      })
    })
  })

  describe('イベントのタイムスタンプ', () => {
    it('全てのイベントにタイムスタンプが含まれる', () => {
      const pageView = createPageViewEvent('DASHBOARD')
      const action = createActionEvent('TASK_CREATE')
      const engagement = createEngagementEvent('click', 'button')
      const error = createErrorEvent('network', 'api')
      const performance = createPerformanceEvent('render', 'Component', 100)

      expect(pageView.properties?.timestamp).toBeDefined()
      expect(action.properties?.timestamp).toBeDefined()
      expect(engagement.properties?.timestamp).toBeDefined()
      expect(error.properties?.timestamp).toBeDefined()
      expect(performance.properties?.timestamp).toBeDefined()
    })

    it('タイムスタンプは数値である', () => {
      const event = createPageViewEvent('DASHBOARD')
      expect(typeof event.properties?.timestamp).toBe('number')
    })
  })
})
