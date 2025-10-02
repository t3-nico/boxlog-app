// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * 命名辞書システム - 使用例コンポーネント
 * Issue #353: URL/ファイル名/分析イベントの統一命名管理
 *
 * 命名システムの正しい使用方法を示すサンプル
 */

'use client'

import React, { useEffect } from 'react'

import Link from 'next/link'

import { SCREENS, ROUTES } from '@/constants/naming'
import { useNaming } from '@/hooks/use-naming'

/**
 * 📱 基本的な使用例コンポーネント
 */
export function BasicNamingExample() {
  const {
    currentScreen,
    navigateTo,
    trackPageView,
    trackAction,
    pageClassName,
    getComponentClass,
  } = useNaming('basic-example')

  // ページビュー追跡
  useEffect(() => {
    trackPageView(currentScreen, {
      component: 'BasicNamingExample',
      load_time: Date.now(),
    })
  }, [currentScreen, trackPageView])

  // ボタンクリック処理
  const handleSettingsClick = () => {
    // 1. アクション追跡
    trackAction('settings_save', {
      button_type: 'navigation',
      destination: 'settings',
    })

    // 2. 型安全なナビゲーション
    navigateTo('settings')
  }

  const handleTaskCreate = () => {
    // アクション追跡
    trackAction('task_create', {
      button_type: 'primary_action',
      creation_method: 'button_click',
    })

    // 実際のタスク作成処理...
    console.log('タスクを作成中...')
  }

  return (
    <div className={`${pageClassName} p-6`}>
      <div className={getComponentClass('basic-example', 'container')}>
        <h1 className={getComponentClass('basic-example', 'title')}>
          命名システム基本例
        </h1>

        <p className="mb-4 text-gray-600">
          現在の画面: <code className="rounded bg-gray-100 px-2 py-1">{currentScreen}</code>
        </p>

        <div className="space-y-4">
          {/* 型安全なナビゲーションボタン */}
          <button
            onClick={handleSettingsClick}
            className={getComponentClass('basic-example', 'button', 'primary')}
          >
            設定画面へ移動
          </button>

          {/* アクション追跡付きボタン */}
          <button
            onClick={handleTaskCreate}
            className={getComponentClass('basic-example', 'button', 'action')}
          >
            タスクを作成
          </button>

          {/* 型安全なリンク */}
          <div className="space-x-4">
            <Link
              href={ROUTES.calendar()}
              className={getComponentClass('basic-example', 'link')}
            >
              カレンダー
            </Link>
            <Link
              href={ROUTES.board()}
              className={getComponentClass('basic-example', 'link')}
            >
              ボード
            </Link>
            <Link
              href={ROUTES.aiChat()}
              className={getComponentClass('basic-example', 'link')}
            >
              AI チャット
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 🎯 分析イベント使用例
 */
export function AnalyticsExample() {
  const {
    trackPageView,
    trackAction,
    trackEngagement,
    trackError,
    trackPerformance,
    currentScreen,
  } = useNaming('analytics-example')

  const handleTrackingExamples = () => {
    // 1. ページビュー（通常は自動）
    trackPageView(currentScreen, {
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    })

    // 2. ユーザーアクション
    trackAction('task_update', {
      task_id: 'example-123',
      field_changed: 'title',
      old_value: '旧タイトル',
      new_value: '新タイトル',
    })

    // 3. エンゲージメント
    trackEngagement('scroll', 'deep_scroll', {
      scroll_depth: 75,
      time_on_page: 120,
    })

    // 4. エラー追跡
    trackError('validation_error', 'form_submission', {
      form_name: 'task_creation',
      field_errors: ['title_required', 'date_invalid'],
    })

    // 5. パフォーマンス追跡
    trackPerformance('render_time', 'TaskList', 45.6, {
      task_count: 150,
      filter_applied: true,
    })
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">分析イベント例</h2>
      <button
        onClick={handleTrackingExamples}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        分析イベント送信テスト
      </button>
      <p className="mt-2 text-sm text-gray-600">
        コンソールで追跡イベントを確認してください（開発環境）
      </p>
    </div>
  )
}

/**
 * 🛣️ ナビゲーション使用例
 */
export function NavigationExample() {
  const { navigateTo, currentScreen, goBack } = useNaming('navigation-example')

  const navigationItems = [
    { screen: 'dashboard' as const, label: 'ダッシュボード' },
    { screen: 'calendar' as const, label: 'カレンダー' },
    { screen: 'board' as const, label: 'ボード' },
    { screen: 'table' as const, label: 'テーブル' },
    { screen: 'stats' as const, label: '統計' },
    { screen: 'settings' as const, label: '設定' },
    { screen: 'help' as const, label: 'ヘルプ' },
  ]

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">ナビゲーション例</h2>
      <p className="mb-4 text-gray-600">
        現在の画面: <code>{currentScreen}</code>
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {navigationItems.map(({ screen, label }) => (
          <button
            key={screen}
            onClick={() => navigateTo(screen)}
            className={`rounded border px-4 py-2 transition-colors ${
              currentScreen === SCREENS[screen]
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={goBack}
        className="mt-4 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        戻る
      </button>
    </div>
  )
}

/**
 * 🎨 スタイリング使用例
 */
export function StylingExample() {
  const { pageClassName, getComponentClass } = useNaming('styling-example')

  return (
    <div className={pageClassName}>
      <div className={getComponentClass('styling-example', 'container')}>
        <h2 className={getComponentClass('styling-example', 'title')}>
          スタイリング例
        </h2>

        <div className={getComponentClass('styling-example', 'content')}>
          <p className={getComponentClass('styling-example', 'text')}>
            現在の画面に基づいたページクラス: <code>{pageClassName}</code>
          </p>

          <div className={getComponentClass('styling-example', 'card')}>
            <h3 className={getComponentClass('styling-example', 'card-title')}>
              カードタイトル
            </h3>
            <p className={getComponentClass('styling-example', 'card-text')}>
              コンポーネント・エレメント・モディファイアクラスの例
            </p>
          </div>

          <div className="space-x-2">
            <button className={getComponentClass('styling-example', 'button', 'primary')}>
              プライマリボタン
            </button>
            <button className={getComponentClass('styling-example', 'button', 'secondary')}>
              セカンダリボタン
            </button>
            <button className={getComponentClass('styling-example', 'button', 'danger')}>
              危険ボタン
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 🔍 バリデーション使用例
 */
export function ValidationExample() {
  const { validateScreen, availableScreens, availableFeatures } = useNaming('validation-example')

  const [testScreen, setTestScreen] = React.useState('')
  const [validationResult, setValidationResult] = React.useState<boolean | null>(null)

  const handleValidate = () => {
    const result = validateScreen(testScreen)
    setValidationResult(result)
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">バリデーション例</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            画面名をテスト:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testScreen}
              onChange={(e) => setTestScreen(e.target.value)}
              placeholder="例: dashboard, settings"
              className="flex-1 rounded border border-gray-300 px-3 py-2"
            />
            <button
              onClick={handleValidate}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              検証
            </button>
          </div>
          {validationResult !== null && (
            <p className={`mt-2 text-sm ${validationResult ? 'text-green-600' : 'text-red-600'}`}>
              {validationResult ? '✅ 有効な画面名です' : '❌ 無効な画面名です'}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium">使用可能な画面 ({availableScreens.length}個)</h3>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            {availableScreens.slice(0, 9).map((screen) => (
              <code key={screen} className="rounded bg-gray-100 px-2 py-1">
                {screen}
              </code>
            ))}
            {availableScreens.length > 9 && (
              <span className="text-gray-500">...他{availableScreens.length - 9}個</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">使用可能な機能 ({availableFeatures.length}個)</h3>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            {availableFeatures.slice(0, 9).map((feature) => (
              <code key={feature} className="rounded bg-gray-100 px-2 py-1">
                {feature}
              </code>
            ))}
            {availableFeatures.length > 9 && (
              <span className="text-gray-500">...他{availableFeatures.length - 9}個</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 🎯 統合使用例メインコンポーネント
 */
export function NamingSystemUsageExample() {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">命名システム使用例</h1>
        <p className="mb-4 text-gray-600">
          統一された命名規則でプロジェクト全体の一貫性を保証するシステムの使用例です。
        </p>
      </div>

      <BasicNamingExample />
      <AnalyticsExample />
      <NavigationExample />
      <StylingExample />
      <ValidationExample />
    </div>
  )
}

export default NamingSystemUsageExample