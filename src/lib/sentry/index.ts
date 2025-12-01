/**
 * Sentry統合システム - エクスポートモジュール
 *
 * Sentryの初期化は instrumentation.ts / instrumentation-client.ts で行われます。
 * このモジュールはヘルパー関数のみを提供します。
 */

// メイン統合機能
export {
  SentryErrorHandler,
  /** @deprecated */
  SentryIntegration,
  // 推奨API
  handleApiError,
  handleReactError,
  // 後方互換性（非推奨）
  /** @deprecated */
  initializeSentry,
  isSentryInitialized,
  reportToSentry,
  /** @deprecated */
  sentryIntegration,
} from './integration'

// パフォーマンス監視
export { initPerformanceMonitoring, instrumentApiCalls, measureCoreWebVitals, measurePageLoad } from './performance'

// パフォーマンストレースヘルパー
export { traceApiCall, traceDbQuery, traceServerComponent, withTrace } from './trace'
