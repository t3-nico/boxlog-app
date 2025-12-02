/**
 * 高度なスマートフォルダルール機能
 */

export { AdvancedRuleBuilder } from './builder'
export { AdvancedRuleEngine } from './engine'
export { AdvancedRuleOperator } from './operators'
export { ADVANCED_RULE_PRESETS, initializeSafeFunctions, PREDEFINED_SAFE_FUNCTIONS } from './presets'
export type {
  AdvancedSmartFolderRule,
  CustomFieldDefinition,
  CustomRuleFunction,
  SafeCustomFunction,
} from './types'
