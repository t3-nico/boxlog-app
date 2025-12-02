/**
 * 事前定義済み関数とプリセット
 */

import { SmartFolderRuleField } from '../../types'

import { AdvancedRuleBuilder } from './builder'
import { AdvancedRuleEngine } from './engine'
import { AdvancedRuleOperator } from './operators'
import type { AdvancedSmartFolderRule, SafeCustomFunction } from './types'

// 事前定義済み安全なカスタム関数
export const PREDEFINED_SAFE_FUNCTIONS: SafeCustomFunction[] = [
  {
    name: 'isValidEmail',
    description: 'メールアドレスの形式チェック',
    securityLevel: 'safe',
    validator: (fieldValue: unknown) => {
      if (typeof fieldValue !== 'string') return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(fieldValue)
    },
  },
  {
    name: 'isRecentDate',
    description: '直近7日以内の日付かチェック',
    securityLevel: 'safe',
    validator: (fieldValue: unknown) => {
      const date = new Date(fieldValue as string)
      if (isNaN(date.getTime())) return false
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return date >= weekAgo && date <= now
    },
  },
  {
    name: 'hasMinimumWords',
    description: '指定された最小単語数を満たしているかチェック',
    securityLevel: 'safe',
    validator: (fieldValue: unknown, rule: AdvancedSmartFolderRule) => {
      if (typeof fieldValue !== 'string') return false
      const wordCount = fieldValue.trim().split(/\s+/).length
      const minWords = Number(rule.parameters?.minWords || 5)
      return wordCount >= minWords
    },
  },
]

// カスタム関数の初期化
export const initializeSafeFunctions = () => {
  PREDEFINED_SAFE_FUNCTIONS.forEach((funcDef) => {
    AdvancedRuleEngine.registerSafeCustomFunction(funcDef)
  })
}

// プリセット高度ルール
export const ADVANCED_RULE_PRESETS = {
  // 作業時間のタスク
  WORK_HOURS: AdvancedRuleBuilder.create()
    .timeRange('created_date', '09:00', '17:00', { excludeWeekends: true })
    .build(),

  // 緊急かつ重要なタスク（アイゼンハワーマトリックス）
  URGENT_IMPORTANT: AdvancedRuleBuilder.create()
    .startGroup('urgent', 'AND')
    .regex('title', '(urgent|asap|emergency)', 'i')
    .between('priority', 3, 4) // high to urgent
    .endGroup()
    .build(),

  // 複雑なタスク（説明が長い、タグが多い）
  COMPLEX_TASKS: AdvancedRuleBuilder.create()
    .startGroup('complexity', 'OR')
    .regex('description', '.{200,}') // 200文字以上の説明
    .between('tag' as SmartFolderRuleField, 3, 10) // 3-10個のタグ
    .endGroup()
    .build(),

  // メールアドレスを含むタスク（安全なカスタム関数使用例）
  EMAIL_TASKS: AdvancedRuleBuilder.create()
    .addRule({
      field: 'description',
      operator: AdvancedRuleOperator.CUSTOM_FUNCTION,
      value: 'isValidEmail',
      logic: 'AND',
    })
    .build(),

  // 最近作成されたタスク（安全なカスタム関数使用例）
  RECENT_TASKS: AdvancedRuleBuilder.create()
    .addRule({
      field: 'created_date',
      operator: AdvancedRuleOperator.CUSTOM_FUNCTION,
      value: 'isRecentDate',
      logic: 'AND',
    })
    .build(),
}
