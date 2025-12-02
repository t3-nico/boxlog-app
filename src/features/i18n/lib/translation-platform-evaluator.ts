/**
 * 翻訳管理プラットフォーム評価システム
 * Issue #287: 翻訳管理システム選定（Crowdin/Lokalise等）
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./translation-platform-evaluator/
 */

export { boxLogRequirements, TranslationPlatformEvaluator } from './translation-platform-evaluator/index'
export type {
  BoxLogRequirements,
  EvaluatedPlatform,
  EvaluationScore,
  IntegrationSupport,
  PlatformFeatures,
  PricingInfo,
  RecommendationResult,
  TranslationPlatform,
} from './translation-platform-evaluator/index'

import { TranslationPlatformEvaluator } from './translation-platform-evaluator/index'
export default TranslationPlatformEvaluator
