/**
 * 翻訳品質保証（QA）システム
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./quality-assurance/
 */

export { TranslationQualityAssurance } from './quality-assurance/index'
export type {
  QualityAssessment,
  QualityIssue,
  QualityMetrics,
  QualityReport,
  ReviewComment,
  ReviewHistoryEntry,
  ReviewWorkflow,
} from './quality-assurance/index'

import { TranslationQualityAssurance } from './quality-assurance/index'
export default TranslationQualityAssurance
