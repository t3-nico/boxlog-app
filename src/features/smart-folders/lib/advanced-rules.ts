/**
 * 高度なスマートフォルダルール機能
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./advanced-rules/
 */

export {
  ADVANCED_RULE_PRESETS,
  AdvancedRuleBuilder,
  AdvancedRuleEngine,
  AdvancedRuleOperator,
  initializeSafeFunctions,
  PREDEFINED_SAFE_FUNCTIONS,
} from './advanced-rules/index'
export type {
  AdvancedSmartFolderRule,
  CustomFieldDefinition,
  CustomRuleFunction,
  SafeCustomFunction,
} from './advanced-rules/index'
