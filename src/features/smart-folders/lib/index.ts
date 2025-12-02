/**
 * Smart Folders Library - Public API
 */

// Core
export {
  evaluateSmartFolderRules,
  getSmartFolderResults,
  validateSmartFolderRules,
} from './smart-folders'

// Rule Engine
export { RuleEngine } from './rule-engine'

// Advanced Rules
export {
  AdvancedRuleEngine,
  AdvancedRuleBuilder,
  PREDEFINED_SAFE_FUNCTIONS,
  initializeSafeFunctions,
  ADVANCED_RULE_PRESETS,
} from './advanced-rules'

export type {
  AdvancedSmartFolderRule,
  CustomRuleFunction,
  SafeCustomFunction,
  CustomFieldDefinition,
} from './advanced-rules'

// Templates
export {
  BUILT_IN_TEMPLATES,
  TemplateManager,
  TemplateApplicator,
  TemplateAnalytics,
} from './templates'

export type { SmartFolderTemplate, TemplateUsageStats } from './templates'

// Analytics
export { SmartFolderAnalytics } from './analytics'

export type {
  AnalyticsEvent,
  FolderUsageStats,
  RuleEfficiencyAnalysis,
  UserBehaviorAnalysis,
} from './analytics'

// Performance & Optimization
export { optimizeRuleEvaluation, memoizeResults } from './optimization'
export { measureRulePerformance, createPerformanceReport } from './performance'
