/**
 * 📋 Breaking Changes Manager
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./core.ts - メイン管理クラス
 * @see ./analysis.ts - 影響分析ユーティリティ
 * @see ./markdown.ts - Markdownドキュメント生成
 * @see ./migration.ts - マイグレーション計画
 * @see ./helpers.ts - ヘルパー関数
 */

export { BreakingChangeManager } from './core'

// ユーティリティ関数のエクスポート
export {
  calculateActionPriority,
  calculateDeadline,
  calculateGroupSpecificImpact,
  calculateRiskLevel,
  generateRecommendedActions,
  getGroupSpecificDetails,
  getGroupSpecificMitigation,
  identifyRisks,
  suggestRiskMitigation,
} from './analysis'

export {
  calculateEndDate,
  generateChangeId,
  generatePlanId,
  getChangeEmoji,
  getDefaultStartDate,
  getGroupDisplayName,
  getGroupEmoji,
  getImpactEmoji,
  groupChangesByVersion,
} from './helpers'

export { generateMarkdownDocument } from './markdown'

export { createMigrationPlan, createMigrationPhases } from './migration'

// グローバルインスタンスと便利関数
import { BreakingChangeManager } from './core'

/**
 * 🌍 グローバル管理インスタンス
 */
export const breakingChangeManager = new BreakingChangeManager()

/**
 * 🔧 便利関数
 */
export const addBreakingChange = (change: Parameters<BreakingChangeManager['addBreakingChange']>[0]) =>
  breakingChangeManager.addBreakingChange(change)

export const findBreakingChanges = (query: Parameters<BreakingChangeManager['findChanges']>[0]) =>
  breakingChangeManager.findChanges(query)

export const generateVersionSummary = (version: string) => breakingChangeManager.generateVersionSummary(version)

export default BreakingChangeManager
