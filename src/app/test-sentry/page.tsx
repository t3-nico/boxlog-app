/**
 * Sentry統合テストページ
 * エラー監視・分類・セッション記録の動作確認用
 */

'use client'

import { useState } from 'react'

import { DetailedErrorBoundary, FeatureErrorBoundary } from '@/components/error-boundary'
import { colors, typography, spacing } from '@/config/theme'
import { AppError, ValidationError } from '@/lib/errors'
import { SentryErrorHandler } from '@/lib/sentry-integration'

// テスト用のエラーコンポーネント
function ErrorTriggerComponent({ errorType }: { errorType: string }) {
  switch (errorType) {
    case 'render_error':
      const nullValue = null as unknown as { property: string }
      return <div>{nullValue.property}</div> // TypeError発生

    case 'use_effect_error':
      throw new Error('useEffect内でのエラー（テスト用）')

    default:
      return <div>正常なコンポーネント</div>
  }
}

export default function SentryTestPage() {
  const [showErrorComponent, setShowErrorComponent] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<string[]>([])

  // ユーザーコンテキスト設定
  const handleSetUserContext = () => {
    SentryErrorHandler.setUserContext({
      id: 'demo-user-456',
      email: 'demo@boxlog.com',
      username: 'デモユーザー',
      role: 'tester'
    })
    addTestResult('✅ ユーザーコンテキストを設定しました')
  }

  // 操作コンテキスト設定
  const handleSetOperationContext = () => {
    SentryErrorHandler.setOperationContext({
      page: '/test-sentry',
      action: 'manual_test',
      feature: 'sentry_integration',
      component: 'test_page'
    })
    addTestResult('✅ 操作コンテキストを設定しました')
  }

  // パンくずリスト追加
  const handleAddBreadcrumb = () => {
    SentryErrorHandler.addBreadcrumb('テストページでボタンクリック', 'ui', 'info')
    addTestResult('✅ パンくずリストを追加しました')
  }

  // AppErrorテスト
  const handleAppErrorTest = () => {
    try {
      throw new AppError('テスト用AppError', 'TEST_APP_ERROR', 500, {
        test_context: 'frontend_test',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      SentryErrorHandler.captureError(error, {
        source: 'manual_test',
        page: '/test-sentry'
      })
      addTestResult('✅ AppErrorをSentryに送信しました')
    }
  }

  // ValidationErrorテスト
  const handleValidationErrorTest = () => {
    try {
      throw new ValidationError('テスト用バリデーションエラー', {
        field: 'test_field',
        value: 'invalid_test_value'
      })
    } catch (error) {
      SentryErrorHandler.captureError(error)
      addTestResult('✅ ValidationErrorをSentryに送信しました')
    }
  }

  // APIエラーテスト
  const handleApiTest = async (testType: string) => {
    try {
      const response = await fetch(`/api/test-sentry?type=${testType}`)
      const data = await response.json()

      if (!response.ok) {
        addTestResult(`❌ API ${testType}: ${data.error?.message || 'エラー発生'}`)
      } else {
        addTestResult(`✅ API ${testType}: ${data.data?.message || '成功'}`)
      }
    } catch (error) {
      addTestResult(`❌ API ${testType}: ネットワークエラー`)
    }
  }

  // スパン（パフォーマンス監視）テスト
  const handleSpanTest = () => {
    SentryErrorHandler.startSpan('test-span', 'test', () => {
      // 時間のかかる処理をシミュレート
      const start = Date.now()
      while (Date.now() - start < 100) {
        // 100ms の処理時間をシミュレート
      }

      addTestResult('✅ パフォーマンススパンを記録しました')
      return 'test completed'
    })
  }

  const addTestResult = (message: string) => {
    setTestResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  return (
    <div className={`min-h-screen ${colors.background.base} ${spacing.component.padding.lg}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`${typography.heading.h1} ${colors.text.primary} mb-6`}>
          🛡️ Sentry統合テストページ
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* コンテキスト設定テスト */}
          <div className={`${colors.background.secondary} ${spacing.component.padding.md} rounded-lg`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
              📝 コンテキスト設定
            </h2>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSetUserContext}
                className={`${colors.primary.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                ユーザーコンテキスト設定
              </button>
              <button
                type="button"
                onClick={handleSetOperationContext}
                className={`${colors.primary.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                操作コンテキスト設定
              </button>
              <button
                type="button"
                onClick={handleAddBreadcrumb}
                className={`${colors.primary.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                パンくずリスト追加
              </button>
            </div>
          </div>

          {/* フロントエンドエラーテスト */}
          <div className={`${colors.background.secondary} ${spacing.component.padding.md} rounded-lg`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
              ⚠️ フロントエンドエラー
            </h2>
            <div className="space-y-2">
              <button
                onClick={handleAppErrorTest}
                className={`${colors.warning.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                AppError送信
              </button>
              <button
                onClick={handleValidationErrorTest}
                className={`${colors.warning.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                ValidationError送信
              </button>
              <button
                onClick={() => setShowErrorComponent('render_error')}
                className={`${colors.danger.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                React Error発生
              </button>
            </div>
          </div>

          {/* APIエラーテスト */}
          <div className={`${colors.background.secondary} ${spacing.component.padding.md} rounded-lg`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
              🌐 API エラーテスト
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => handleApiTest('success')}
                className={`${colors.success.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                正常なAPI呼び出し
              </button>
              <button
                onClick={() => handleApiTest('validation_error')}
                className={`${colors.warning.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                バリデーションエラー
              </button>
              <button
                onClick={() => handleApiTest('unauthorized')}
                className={`${colors.danger.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                認証エラー
              </button>
            </div>
          </div>

          {/* その他のテスト */}
          <div className={`${colors.background.secondary} ${spacing.component.padding.md} rounded-lg`}>
            <h2 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
              🚀 その他の機能
            </h2>
            <div className="space-y-2">
              <button
                onClick={handleSpanTest}
                className={`${colors.info.DEFAULT} text-white px-4 py-2 rounded text-sm w-full`}
              >
                パフォーマンス監視
              </button>
            </div>
          </div>
        </div>

        {/* Error Boundary テストエリア */}
        <div className={`${colors.background.secondary} ${spacing.component.padding.md} rounded-lg mt-6`}>
          <h2 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
            🛡️ Error Boundary テスト
          </h2>

          <DetailedErrorBoundary componentName="SentryTestPage">
            <FeatureErrorBoundary featureName="エラーテスト機能">
              {showErrorComponent ? <ErrorTriggerComponent errorType={showErrorComponent} /> : null}
              {!showErrorComponent && (
                <p className={`${colors.text.secondary} text-center py-4`}>
                  上の「React Error発生」ボタンを押すとError Boundaryが作動します
                </p>
              )}
            </FeatureErrorBoundary>
          </DetailedErrorBoundary>

          {showErrorComponent ? <button
              onClick={() => setShowErrorComponent(null)}
              className={`${colors.primary.DEFAULT} text-white px-4 py-2 rounded text-sm mt-4`}
            >
              エラー状態をリセット
            </button> : null}
        </div>

        {/* テスト結果表示 */}
        <div className={`${colors.background.secondary} ${spacing.component.padding.md} rounded-lg mt-6`}>
          <h2 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
            📊 テスト結果
          </h2>
          <div className={`${colors.background.base} ${spacing.component.padding.sm} rounded max-h-64 overflow-y-auto`}>
            {testResults.length === 0 ? (
              <p className={`${colors.text.secondary} text-center`}>
                テストを実行すると結果がここに表示されます
              </p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={`${colors.text.primary} text-sm mb-1 font-mono`}>
                  {result}
                </div>
              ))
            )}
          </div>

          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className={`${colors.secondary.DEFAULT} text-white px-3 py-1 rounded text-sm mt-2`}
            >
              結果をクリア
            </button>
          )}
        </div>

        {/* 使用方法 */}
        <div className={`${colors.background.muted} ${spacing.component.padding.md} rounded-lg mt-6`}>
          <h2 className={`${typography.heading.h4} ${colors.text.primary} mb-2`}>
            📋 使用方法
          </h2>
          <ul className={`${colors.text.secondary} text-sm space-y-1`}>
            <li>1. 「コンテキスト設定」でユーザー・操作情報を設定</li>
            <li>2. 各種エラーテストを実行してSentryダッシュボードで確認</li>
            <li>3. Error Boundaryの動作をテスト</li>
            <li>4. パフォーマンス監視機能をテスト</li>
          </ul>
        </div>
      </div>
    </div>
  )
}