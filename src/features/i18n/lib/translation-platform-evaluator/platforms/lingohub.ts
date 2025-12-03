/**
 * LingoHubプラットフォーム定義
 */

import type { TranslationPlatform } from '../types'

export function createLingoHubPlatform(): TranslationPlatform {
  return {
    id: 'lingohub',
    name: 'LingoHub',
    description: 'ヨーロッパ発の翻訳管理プラットフォーム。GDPR準拠',
    pricing: {
      tier: 'free',
      monthlyPrice: 0,
      pricePerTranslator: 56, // Professional plan
      keyLimits: 1000,
      includedFeatures: ['GitHub統合', '翻訳メモリ', 'API', 'GDPR準拠'],
      limitations: ['Free tier: 1,000キーまで', 'Free tier: 基本機能のみ', '料金が高め'],
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
      automaticKeyExtraction: false,
      webhooks: true,
      apiAccess: true,
      cicdIntegration: true,
      progressTracking: true,
      qualityMetrics: false,
      costAnalysis: false,
      customReports: false,
      rtlLanguages: true,
      pluralFormHandling: true,
      contextualTranslation: true,
      screenTranslation: false,
    },
    integrations: {
      github: true,
      nextjs: false,
      react: false,
      typescript: false,
      json: true,
      cli: false,
      vscode: false,
      figma: false,
    },
    pros: ['GDPR完全準拠', 'ヨーロッパのデータセンター', '高いセキュリティ基準', '基本的な翻訳機能は良好'],
    cons: [
      '料金が高い',
      '機能が限定的',
      'モダンな統合オプションが少ない',
      'コミュニティが小さい',
      'ドキュメントの質が低い',
    ],
    score: {
      overall: 60,
      breakdown: {
        features: 60,
        pricing: 50,
        usability: 60,
        integration: 50,
        support: 60,
        scalability: 60,
      },
    },
    recommendation: 'not_recommended',
  }
}
