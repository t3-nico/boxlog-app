/**
 * Transifexプラットフォーム定義
 */

import type { TranslationPlatform } from '../types'

export function createTransifexPlatform(): TranslationPlatform {
  return {
    id: 'transifex',
    name: 'Transifex',
    description: '老舗の翻訳管理プラットフォーム。豊富な実績と安定性',
    pricing: {
      tier: 'free',
      monthlyPrice: 0,
      pricePerTranslator: 20,
      keyLimits: 1000, // Free tier
      includedFeatures: ['GitHub統合', 'API', '翻訳メモリ', '基本的なワークフロー'],
      limitations: ['Free tier: 1,000文字列まで', 'Free tier: 2言語まで', '古いUI/UX'],
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
      contextualTranslation: false,
      screenTranslation: false,
    },
    integrations: {
      github: true,
      nextjs: false,
      react: false,
      typescript: false,
      json: true,
      cli: true,
      vscode: false,
      figma: false,
    },
    pros: [
      '長い運営実績と安定性',
      'オープンソースプロジェクトの多くが利用',
      '基本機能は充実',
      'GitHub統合',
      'コミュニティ翻訳サポート',
    ],
    cons: ['UI/UXが古い', 'モダンな開発環境との統合が弱い', '新機能追加が遅い', '自動化機能が限定的'],
    score: {
      overall: 65,
      breakdown: {
        features: 70,
        pricing: 80,
        usability: 50,
        integration: 60,
        support: 70,
        scalability: 60,
      },
    },
    recommendation: 'acceptable',
  }
}
