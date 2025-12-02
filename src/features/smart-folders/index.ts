/**
 * Smart Folders Feature - Public API
 *
 * @example
 * ```tsx
 * // ✅ 推奨: バレルファイル経由
 * import { SmartFolderList, useSmartFolders } from '@/features/smart-folders'
 *
 * // ❌ 非推奨: 深いパス指定
 * import { SmartFolderList } from '@/features/smart-folders/components/smart-folder-list'
 * ```
 */

// Components
export {
  SmartFolderList,
  SmartFolderDialog,
  SmartFolderContextMenu,
  RuleEditor,
  RulePreview,
  SortableRuleItem,
} from './components'

// Hooks
export {
  useSmartFolders,
  useCreateSmartFolder,
  useUpdateSmartFolder,
  useDeleteSmartFolder,
  useReorderSmartFolders,
  useDuplicateSmartFolder,
  useToggleSmartFolder,
  smartFolderKeys,
} from './hooks'

// Stores
export { useSmartFolderStore } from './stores'

// Library (advanced usage)
export {
  // Core
  evaluateSmartFolderRules,
  getSmartFolderResults,
  validateSmartFolderRules,
  // Rule Engine
  RuleEngine,
  // Advanced Rules
  AdvancedRuleEngine,
  AdvancedRuleBuilder,
  ADVANCED_RULE_PRESETS,
  // Templates
  BUILT_IN_TEMPLATES,
  TemplateManager,
  // Analytics
  SmartFolderAnalytics,
} from './lib'

// Validations
export {
  smartFolderRuleSchema,
  createSmartFolderSchema,
  updateSmartFolderSchema,
} from './validations'
