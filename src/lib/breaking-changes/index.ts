/**
 * 🚨 Breaking Changes System
 *
 * 破壊的変更管理システムの統合エクスポート
 * - 型定義・検知・管理機能の統一インターフェース
 */

// Core exports
export * from './detector';
export * from './manager';
export * from './types';

// Type exports for convenience
export type {
  AffectedGroup,
  BreakingChange,
  BreakingChangeSummary,
  BreakingChangeType,
  ChangeImpactAnalysis,
  ImpactLevel,
  MigrationPlan,
} from './types';

// Detector exports
export {
  BreakingChangeDetector,
  breakingChangeDetector,
  detectBreakingChanges,
  filterHighConfidenceChanges,
} from './detector';

// Manager exports
export {
  addBreakingChange,
  BreakingChangeManager,
  breakingChangeManager,
  createMigrationPlan,
  findBreakingChanges,
  generateVersionSummary,
} from './manager';

// Convenience re-export
import { breakingChangeDetector, detectBreakingChanges } from './detector';
import {
  addBreakingChange,
  breakingChangeManager,
  createMigrationPlan,
  findBreakingChanges,
  generateVersionSummary,
} from './manager';

const breakingChanges = {
  detector: breakingChangeDetector,
  manager: breakingChangeManager,
  detectBreakingChanges,
  addBreakingChange,
  findBreakingChanges,
  generateVersionSummary,
  createMigrationPlan,
};

export default breakingChanges;
