/**
 * Sentry統合システム - エクスポートモジュール
 *
 * Sentryの初期化は instrumentation.ts / instrumentation-client.ts で行われます。
 * このモジュールはヘルパー関数のみを提供します。
 */

// メイン統合機能
export {
  SentryErrorHandler,
  handleApiError,
  handleReactError,
  isSentryInitialized,
  reportToSentry,
} from './integration'

// パフォーマンス監視
export { initPerformanceMonitoring, instrumentApiCalls, measureCoreWebVitals, measurePageLoad } from './performance'

// パフォーマンストレースヘルパー
export { traceApiCall, traceDbQuery, traceServerComponent, withTrace } from './trace'
