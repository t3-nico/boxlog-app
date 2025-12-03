/**
 * BoxLog用のデフォルト要件
 */

import type { BoxLogRequirements } from './types'

export const boxLogRequirements: BoxLogRequirements = {
  // 技術要件
  nextjsSupport: true,
  typescriptSupport: true,
  jsonFormat: true,
  githubIntegration: true,

  // 言語要件
  supportedLanguages: ['en', 'ja'],
  rtlSupport: false, // 将来的にアラビア語等をサポート予定
  pluralizationSupport: true,

  // ワークフロー要件
  reviewProcess: true,
  qualityAssurance: true,
  automatedWorkflow: true,
  cicdIntegration: true,

  // チーム要件
  maxTranslators: 10,
  maxKeys: 50000, // 将来の拡張を見越して
  collaborationFeatures: true,

  // 予算制約
  budgetLimit: 100, // $100/month
  freeTierRequired: true,

  // 品質要件
  translationMemory: true,
  contextSupport: true,
  qualityMetrics: true,
}
