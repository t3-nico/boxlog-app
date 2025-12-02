/**
 * Weblateプラットフォーム定義
 */

import type { TranslationPlatform } from '../types'

export function createWeblatePlatform(): TranslationPlatform {
  return {
    id: 'weblate',
    name: 'Weblate',
    description: 'オープンソースの翻訳管理プラットフォーム。自由度が高く、セルフホスト可能',
    pricing: {
      tier: 'free',
      monthlyPrice: 0, // Self-hosted is free
      pricePerTranslator: 19, // Hosted plan
      keyLimits: 10000, // Free hosted tier
      includedFeatures: ['セルフホスト無制限', 'Git統合', '翻訳メモリ', 'API', 'Webhook', '品質チェック'],
      limitations: ['セルフホストには技術知識が必要', 'ホスト版は機能制限あり', 'UI/UXが他社より劣る'],
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
      cli: true,
      vscode: false,
      figma: false,
    },
    pros: [
      'オープンソースで完全に無料',
      '自己ホスト可能（データ管理の自由）',
      'Git統合が優秀',
      '高度なカスタマイゼーション',
      'プライバシー重視',
      '豊富なファイル形式サポート',
    ],
    cons: [
      'セルフホストには技術的スキルが必要',
      'UI/UXが他社プラットフォームより劣る',
      'Next.js/React直接統合なし',
      '商用サポートが限定的',
      'モダンな開発者ツールが少ない',
    ],
    score: {
      overall: 70,
      breakdown: {
        features: 75,
        pricing: 95, // 無料のため高評価
        usability: 50,
        integration: 60,
        support: 60,
        scalability: 80,
      },
    },
    recommendation: 'acceptable',
  }
}
