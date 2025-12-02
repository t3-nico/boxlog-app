/**
 * 品質メトリクス収集ライブラリ
 *
 * ESLint、TypeScript、テストカバレッジ、バンドルサイズ、Core Web Vitalsの測定
 *
 * @see ./types.ts - 型定義
 * @see ./collector.ts - メトリクスコレクター
 * @see ./utils.ts - ユーティリティ
 */

// 型定義
export type {
  BundleBreakdown,
  ErrorSummary,
  ESLintResult,
  QualityMetrics,
  Recommendation,
  TechnicalDebtDetail,
  TypeScriptError,
} from './types'

// コレクター
export { QualityMetricsCollector } from './collector'

// ユーティリティ
export { calculateQualityScore, getQualityGrade } from './utils'
