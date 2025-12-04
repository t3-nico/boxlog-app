/**
 * Crowdinプラットフォーム定義
 */

import type { TranslationPlatform } from '../types'

export function createCrowdinPlatform(): TranslationPlatform {
  return {
    id: 'crowdin',
    name: 'Crowdin',
    description: '最も人気のある翻訳管理プラットフォーム。豊富な機能と統合オプション',
    pricing: {
      tier: 'free',
      monthlyPrice: 0, // Free tier available
      pricePerTranslator: 15, // Pro plan: $15/user/month
      keyLimits: 60000, // Free tier limit
      includedFeatures: ['無制限プロジェクト', 'GitHub統合', '翻訳メモリ', '機械翻訳', 'Webhook', 'API', 'CLI'],
      limitations: ['Free tier: 最大60,000キー', 'Free tier: 最大2言語ターゲット', 'Pro tier以上で高度な機能'],
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
      '豊富な統合オプション（GitHub、CI/CD）',
      '強力な翻訳メモリと機械翻訳',
      '優れたレビュー・承認ワークフロー',
      '包括的なAPI・Webhook',
      '大規模プロジェクト対応',
      'アクティブなコミュニティ',
      '無料プランで基本機能利用可能',
    ],
    cons: [
      '無料プランの言語・キー制限',
      '高度な機能は有料プランのみ',
      'UI複雑さ（初心者には学習コスト）',
      'カスタマイゼーション制限',
    ],
    score: {
      overall: 90,
      breakdown: {
        features: 95,
        pricing: 85,
        usability: 80,
        integration: 95,
        support: 90,
        scalability: 95,
      },
    },
    recommendation: 'excellent',
  }
}
