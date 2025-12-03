/**
 * 📋 Breaking Changes Manager
 *
 * 破壊的変更の管理・記録・通知システム
 * - 変更記録管理・マイグレーション計画・通知送信
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./manager/
 */

export {
  addBreakingChange,
  breakingChangeManager,
  BreakingChangeManager,
  createMigrationPlan,
  findBreakingChanges,
  generateVersionSummary,
} from './manager/index'

import { BreakingChangeManager } from './manager/index'

export default BreakingChangeManager
