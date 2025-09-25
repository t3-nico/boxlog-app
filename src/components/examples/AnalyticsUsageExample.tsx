/**
 * 📊 Analytics Usage Example Component
 *
 * メトリクス用イベント名統一システムの使用例
 * 開発者向けのガイドとテストコンポーネント
 */

'use client'

import React, { useState } from 'react'

// 📊 統一されたイベント名を使用
import { trackEvent, useAnalytics, useClickTracking, useFormTracking, usePageView } from '@/lib/analytics'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'

/**
 * 🎯 基本的な使用例コンポーネント
 */
export function AnalyticsBasicExample() {
  const [counter, setCounter] = useState(0)

  // 🪝 フック形式での使用
  const { track } = useAnalytics()

  // 🖱️ クリック追跡
  const trackButtonClick = useClickTracking(ANALYTICS_EVENTS.FEATURE.DASHBOARD_WIDGET_INTERACT, {
    widget_type: 'counter',
    widget_name: 'example_counter',
  })

  // 📝 フォーム追跡
  const { trackFormStart, trackFormSubmit } = useFormTracking('analytics_demo_form')

  // 👀 ページビュー追跡（自動）
  usePageView('analytics-example')

  const handleIncrement = () => {
    setCounter((prev) => prev + 1)

    // 📊 直接トラッキング関数を使用
    trackEvent(ANALYTICS_EVENTS.FEATURE.DASHBOARD_WIDGET_INTERACT, {
      interaction_type: 'click',
      widget_type: 'counter',
      action: 'increment',
      value: counter + 1,
    })

    // 🪝 フック経由での追跡
    trackButtonClick()
  }

  const handleReset = () => {
    setCounter(0)

    // 🎯 統一されたイベント名で追跡
    track(ANALYTICS_EVENTS.USER.SETTINGS_VIEW, {
      settings_type: 'counter_reset',
      previous_value: counter,
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const success = formData.get('email') !== ''

    // 📊 フォーム送信の追跡
    trackFormSubmit(success, success ? [] : ['email_required'])

    if (success) {
      // ✅ 成功時の追跡
      track(ANALYTICS_EVENTS.BUSINESS.CONVERSION, {
        conversion_type: 'demo_form_submission',
        form_name: 'analytics_demo',
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">📊 Analytics Usage Example</h2>
        <p className="text-gray-600">統一されたイベント名システムの使用例</p>
      </div>

      {/* カウンターウィジェット */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">🔢 Counter Widget</h3>
        <div className="space-y-4 text-center">
          <div className="text-4xl font-bold text-blue-600">{counter}</div>
          <div className="space-x-4">
            <button
              onClick={handleIncrement}
              className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              ➕ Increment
            </button>
            <button
              onClick={handleReset}
              className="rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* フォーム例 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">📝 Form Example</h3>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onFocus={() => trackFormStart()}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            📤 Submit Form
          </button>
        </form>
      </div>

      {/* イベント名の例 */}
      <div className="rounded-lg border bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">🎯 Event Names Used</h3>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-blue-600">{ANALYTICS_EVENTS.NAVIGATION.PAGE_VIEW}</span>
            <span className="text-gray-500">Page view tracking</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">{ANALYTICS_EVENTS.FEATURE.DASHBOARD_WIDGET_INTERACT}</span>
            <span className="text-gray-500">Widget interactions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-600">{ANALYTICS_EVENTS.USER.SETTINGS_VIEW}</span>
            <span className="text-gray-500">Settings/reset actions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600">{ANALYTICS_EVENTS.BUSINESS.CONVERSION}</span>
            <span className="text-gray-500">Form conversions</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 🏆 Advanced Usage Example
 */
export function AnalyticsAdvancedExample() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const features = [
    { id: 'calendar', name: 'Calendar View', event: ANALYTICS_EVENTS.FEATURE.CALENDAR_VIEW },
    { id: 'tasks', name: 'Task Management', event: ANALYTICS_EVENTS.FEATURE.TASK_CREATE },
    { id: 'ai_chat', name: 'AI Chat', event: ANALYTICS_EVENTS.FEATURE.AI_CHAT_START },
    { id: 'search', name: 'Smart Search', event: ANALYTICS_EVENTS.FEATURE.SEARCH_PERFORM },
  ]

  const handleFeatureSelect = (feature: (typeof features)[0]) => {
    setSelectedFeature(feature.id)

    // 🎯 機能発見の追跡
    trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.FEATURE_DISCOVERY, {
      feature_name: feature.name,
      feature_id: feature.id,
      discovery_method: 'example_selection',
    })

    // 📊 機能使用の追跡
    trackEvent(feature.event, {
      source: 'analytics_example',
      feature_category: 'demo',
    })
  }

  const trackABTest = () => {
    // 🧪 A/B テストの例
    const variant = Math.random() > 0.5 ? 'variant_a' : 'variant_b'

    trackEvent(ANALYTICS_EVENTS.ENGAGEMENT.FEATURE_DISCOVERY, {
      feature_name: 'ab_test_demo',
      test_name: 'button_color_test',
      variant,
      experiment_group: `button_color_${variant}`,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">🏆 Advanced Analytics Example</h2>
        <p className="text-gray-600">高度な機能の使用例とA/Bテスト</p>
      </div>

      {/* 機能選択 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">⭐ Feature Discovery</h3>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureSelect(feature)}
              className={`rounded-lg border p-4 text-left transition-all ${
                selectedFeature === feature.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{feature.name}</div>
              <div className="mt-1 text-xs text-gray-500">{feature.event}</div>
            </button>
          ))}
        </div>
      </div>

      {/* A/B テスト例 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">🧪 A/B Test Example</h3>
        <button
          onClick={trackABTest}
          className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white transition-all hover:from-purple-600 hover:to-pink-600"
        >
          🎲 Random Variant Test
        </button>
        <p className="mt-2 text-sm text-gray-600">
          クリックすると、ランダムでvariant_a または variant_b が選択されます
        </p>
      </div>

      {/* イベントカテゴリ例 */}
      <div className="rounded-lg border bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">📊 Event Categories</h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-blue-600">🎯 User Events</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• {ANALYTICS_EVENTS.USER.LOGIN}</li>
              <li>• {ANALYTICS_EVENTS.USER.SETTINGS_VIEW}</li>
              <li>• {ANALYTICS_EVENTS.USER.THEME_CHANGE}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-green-600">⚡ Feature Events</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• {ANALYTICS_EVENTS.FEATURE.TASK_CREATE}</li>
              <li>• {ANALYTICS_EVENTS.FEATURE.AI_CHAT_START}</li>
              <li>• {ANALYTICS_EVENTS.FEATURE.SEARCH_PERFORM}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-purple-600">🧭 Navigation Events</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• {ANALYTICS_EVENTS.NAVIGATION.PAGE_VIEW}</li>
              <li>• {ANALYTICS_EVENTS.NAVIGATION.SIDEBAR_TOGGLE}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-orange-600">💼 Business Events</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• {ANALYTICS_EVENTS.BUSINESS.CONVERSION}</li>
              <li>• {ANALYTICS_EVENTS.BUSINESS.GOAL_COMPLETE}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsBasicExample
