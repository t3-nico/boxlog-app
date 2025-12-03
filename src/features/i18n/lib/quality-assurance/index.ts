/**
 * 翻訳品質保証（QA）システム
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

export { TranslationQualityAssurance } from './qa-system'
export type {
  QualityAssessment,
  QualityIssue,
  QualityMetrics,
  QualityReport,
  ReviewComment,
  ReviewHistoryEntry,
  ReviewWorkflow,
} from './types'

// メトリクス関数のエクスポート
export {
  calculateOverallScore,
  checkAccuracy,
  checkCompleteness,
  checkConsistency,
  checkCulturalAdaptation,
  checkFluency,
  checkTechnicalAccuracy,
  determineQualityLevel,
  generateRecommendations,
  identifyQualityIssues,
} from './metrics'

// ヘルパー関数のエクスポート
export { detectWritingStyle, getTerminologyGlossary, groupBy } from './helpers'

// デフォルトエクスポート
import { TranslationQualityAssurance } from './qa-system'
export default TranslationQualityAssurance
