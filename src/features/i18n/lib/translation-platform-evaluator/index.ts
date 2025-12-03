/**
 * 翻訳管理プラットフォーム評価システム
 * Issue #287: 翻訳管理システム選定（Crowdin/Lokalise等）
 */

export { TranslationPlatformEvaluator } from './evaluator'
export { boxLogRequirements } from './requirements'
export type {
  BoxLogRequirements,
  EvaluatedPlatform,
  EvaluationScore,
  IntegrationSupport,
  PlatformFeatures,
  PricingInfo,
  RecommendationResult,
  TranslationPlatform,
} from './types'

// プラットフォーム作成関数もエクスポート
export {
  createCrowdinPlatform,
  createLingoHubPlatform,
  createLokalisePlatform,
  createPhrasePlatform,
  createTransifexPlatform,
  createWeblatePlatform,
  initializePlatforms,
} from './platforms'

// デフォルトエクスポート
import { TranslationPlatformEvaluator } from './evaluator'
export default TranslationPlatformEvaluator
