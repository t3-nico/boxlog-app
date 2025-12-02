/**
 * Lokaliseプラットフォーム定義
 */

import type { TranslationPlatform } from '../types'

export function createLokalisePlatform(): TranslationPlatform {
  return {
    id: 'lokalise',
    name: 'Lokalise',
    description: 'モダンでユーザーフレンドリーな翻訳管理プラットフォーム',
    pricing: {
      tier: 'free',
      monthlyPrice: 0, // Free tier available
      pricePerTranslator: 25, // Growth plan
      keyLimits: 1000, // Free tier limit
      includedFeatures: ['翻訳メモリ', 'GitHub統合', '機械翻訳', 'API', 'CLI', 'Webhook'],
      limitations: ['Free tier: 1,000キーまで', 'Free tier: 1プロジェクトのみ', '高度な機能は有料プランのみ'],
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
      '直感的で美しいUI/UX',
      '強力な開発者ツール（CLI、API）',
      'GitHub統合の質が高い',
      'TypeScript完全サポート',
      'リアルタイム共同編集',
      '優れたモバイルアプリ',
      '高品質なドキュメント',
    ],
    cons: [
      '無料プランの制限が厳しい（1,000キー）',
      'Crowdinに比べて機能が少ない',
      '料金が高め',
      'コミュニティが小さい',
    ],
    score: {
      overall: 85,
      breakdown: {
        features: 85,
        pricing: 75,
        usability: 95,
        integration: 90,
        support: 85,
        scalability: 80,
      },
    },
    recommendation: 'good',
  }
}
