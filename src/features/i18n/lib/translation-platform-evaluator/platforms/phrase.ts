/**
 * Phraseプラットフォーム定義
 */

import type { TranslationPlatform } from '../types'

export function createPhrasePlatform(): TranslationPlatform {
  return {
    id: 'phrase',
    name: 'Phrase (Strings)',
    description: 'エンタープライズ向けの高機能翻訳管理プラットフォーム',
    pricing: {
      tier: 'business',
      monthlyPrice: 99, // Starter plan
      pricePerTranslator: 28,
      keyLimits: 0, // No key limits
      includedFeatures: ['エンタープライズ機能', 'GitHub統合', 'API', '翻訳メモリ', '品質保証', '24/7サポート'],
      limitations: ['無料プランなし', '最低料金が高い', '小規模チームには過剰'],
    },
    features: {
      translationMemory: true,
      machineTranslation: true,
      glossaryManagement: true,
      qualityAssurance: true,
      reviewWorkflow: true,
      approvalProcess: true,
      commentSystem: true,
      versionControl: true,
      automaticKeyExtraction: true,
      webhooks: true,
      apiAccess: true,
      cicdIntegration: true,
      progressTracking: true,
      qualityMetrics: true,
      costAnalysis: true,
      customReports: true,
      rtlLanguages: true,
      pluralFormHandling: true,
      contextualTranslation: true,
      screenTranslation: true,
    },
    integrations: {
      github: true,
      nextjs: true,
      react: true,
      typescript: true,
      json: true,
      cli: true,
      vscode: true,
      figma: true,
    },
    pros: [
      'エンタープライズレベルの機能',
      '優れたセキュリティ・コンプライアンス',
      '24/7専用サポート',
      '高度な分析・レポート機能',
      'カスタムワークフロー',
      'SSO・権限管理',
    ],
    cons: ['料金が非常に高い', '無料プランなし', '小規模プロジェクトには過剰', '学習コストが高い'],
    score: {
      overall: 80,
      breakdown: {
        features: 95,
        pricing: 40, // 高価格のため低評価
        usability: 75,
        integration: 90,
        support: 95,
        scalability: 95,
      },
    },
    recommendation: 'acceptable',
  }
}
