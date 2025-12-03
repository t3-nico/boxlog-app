/**
 * 翻訳管理プラットフォーム評価システム - 型定義
 * Issue #287: 翻訳管理システム選定（Crowdin/Lokalise等）
 */

// 翻訳管理プラットフォームの基本情報
export interface TranslationPlatform {
  id: string
  name: string
  description: string
  pricing: PricingInfo
  features: PlatformFeatures
  integrations: IntegrationSupport
  pros: string[]
  cons: string[]
  score: EvaluationScore
  recommendation: 'excellent' | 'good' | 'acceptable' | 'not_recommended'
}

// 料金情報
export interface PricingInfo {
  tier: 'free' | 'startup' | 'business' | 'enterprise'
  monthlyPrice: number // USD
  pricePerTranslator?: number
  pricePerWord?: number
  keyLimits?: number
  includedFeatures: string[]
  limitations: string[]
}

// プラットフォーム機能
export interface PlatformFeatures {
  // 基本機能
  translationMemory: boolean
  machineTranslation: boolean
  glossaryManagement: boolean
  qualityAssurance: boolean

  // ワークフロー
  reviewWorkflow: boolean
  approvalProcess: boolean
  commentSystem: boolean
  versionControl: boolean

  // 自動化
  automaticKeyExtraction: boolean
  webhooks: boolean
  apiAccess: boolean
  cicdIntegration: boolean

  // 分析・レポート
  progressTracking: boolean
  qualityMetrics: boolean
  costAnalysis: boolean
  customReports: boolean

  // 多言語サポート
  rtlLanguages: boolean
  pluralFormHandling: boolean
  contextualTranslation: boolean
  screenTranslation: boolean
}

// 統合サポート
export interface IntegrationSupport {
  github: boolean
  nextjs: boolean
  react: boolean
  typescript: boolean
  json: boolean
  cli: boolean
  vscode: boolean
  figma: boolean
}

// 評価スコア
export interface EvaluationScore {
  overall: number // 0-100
  breakdown: {
    features: number
    pricing: number
    usability: number
    integration: number
    support: number
    scalability: number
  }
}

// BoxLog要件定義
export interface BoxLogRequirements {
  // 技術要件
  nextjsSupport: boolean
  typescriptSupport: boolean
  jsonFormat: boolean
  githubIntegration: boolean

  // 言語要件
  supportedLanguages: string[]
  rtlSupport: boolean
  pluralizationSupport: boolean

  // ワークフロー要件
  reviewProcess: boolean
  qualityAssurance: boolean
  automatedWorkflow: boolean
  cicdIntegration: boolean

  // チーム要件
  maxTranslators: number
  maxKeys: number
  collaborationFeatures: boolean

  // 予算制約
  budgetLimit: number // USD/month
  freeTierRequired: boolean

  // 品質要件
  translationMemory: boolean
  contextSupport: boolean
  qualityMetrics: boolean
}

// 評価結果付きプラットフォーム
export type EvaluatedPlatform = TranslationPlatform & { compatibilityScore: number }

// 推奨結果
export interface RecommendationResult {
  primary: TranslationPlatform
  alternative: TranslationPlatform
  reasoning: string[]
  implementationPlan: string[]
}
