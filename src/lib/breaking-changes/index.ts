/**
 * 🚨 Breaking Changes System
 *
 * 破壊的変更管理システムの統合エクスポート
 * - 型定義・検知・管理機能の統一インターフェース
 */

// Core exports
export * from './types'
export * from './detector'
export * from './manager'

// Type exports for convenience
export type {
  BreakingChange,
  BreakingChangeType,
  ImpactLevel,
  AffectedGroup,
  MigrationPlan,
  BreakingChangeSummary,
  ChangeImpactAnalysis,
} from './types'

// Detector exports
export {
  BreakingChangeDetector,
  breakingChangeDetector,
  detectBreakingChanges,
  filterHighConfidenceChanges,
} from './detector'

// Manager exports
export {
  BreakingChangeManager,
  breakingChangeManager,
  addBreakingChange,
  findBreakingChanges,
  generateVersionSummary,
  createMigrationPlan,
} from './manager'

// Convenience re-export
export default {
  detector: breakingChangeDetector,
  manager: breakingChangeManager,
  detectBreakingChanges,
  addBreakingChange,
  findBreakingChanges,
  generateVersionSummary,
  createMigrationPlan,
}