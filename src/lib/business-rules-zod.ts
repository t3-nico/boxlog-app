/**
 * ビジネスルール辞書 → Zod変換システム
 * 既存のビジネスルールをZodスキーマに自動変換
 */

import { z } from 'zod'
import {
  businessRulesDictionary,
  type ValidationRule,
  type RuleCondition,
  type RuleAction,
} from '@/config/business-rules'

/**
 * ビジネスルールをZodスキーマに変換する関数
 */
export function createZodSchemaFromBusinessRules(
  entityType: string,
  baseSchema: z.ZodObject<any>
): z.ZodObject<any> {
  const rules = businessRulesDictionary.getRulesForEntity(entityType) || []
  let schema = baseSchema

  rules.forEach(rule => {
    schema = applyBusinessRuleToSchema(schema, rule)
  })

  return schema
}

/**
 * 個別のビジネスルールをZodスキーマに適用
 */
function applyBusinessRuleToSchema(
  schema: z.ZodObject<any>,
  rule: ValidationRule
): z.ZodObject<any> {
  const { conditions, actions, severity } = rule

  // 条件をZodのrefinementに変換
  return schema.refine(
    (data) => evaluateConditions(data, conditions),
    {
      message: generateErrorMessage(actions, severity),
      path: extractFieldPath(conditions),
    }
  )
}

/**
 * ビジネスルールの条件を評価
 */
function evaluateConditions(data: any, conditions: RuleCondition[]): boolean {
  return conditions.every(condition => {
    const { field, operator, value, logicalOperator } = condition

    const fieldValue = getNestedFieldValue(data, field)

    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'not_equals':
        return fieldValue !== value
      case 'greater_than':
        return Number(fieldValue) > Number(value)
      case 'less_than':
        return Number(fieldValue) < Number(value)
      case 'greater_equal':
        return Number(fieldValue) >= Number(value)
      case 'less_equal':
        return Number(fieldValue) <= Number(value)
      case 'contains':
        return String(fieldValue).includes(String(value))
      case 'not_contains':
        return !String(fieldValue).includes(String(value))
      case 'starts_with':
        return String(fieldValue).startsWith(String(value))
      case 'ends_with':
        return String(fieldValue).endsWith(String(value))
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue)
      case 'is_null':
        return fieldValue == null
      case 'is_not_null':
        return fieldValue != null
      case 'is_empty':
        return fieldValue === '' || fieldValue == null
      case 'is_not_empty':
        return fieldValue !== '' && fieldValue != null
      case 'matches_pattern':
        return new RegExp(String(value)).test(String(fieldValue))
      case 'is_date':
        return fieldValue instanceof Date && !isNaN(fieldValue.getTime())
      case 'is_future_date':
        return fieldValue instanceof Date && fieldValue > new Date()
      case 'is_past_date':
        return fieldValue instanceof Date && fieldValue < new Date()
      default:
        console.warn(`Unknown operator: ${operator}`)
        return true
    }
  })
}

/**
 * ネストしたフィールドの値を取得
 */
function getNestedFieldValue(data: any, fieldPath: string): any {
  return fieldPath.split('.').reduce((obj, key) => {
    return obj?.[key]
  }, data)
}

/**
 * ビジネスルールアクションからエラーメッセージを生成
 */
function generateErrorMessage(actions: RuleAction[], severity: string): string {
  const messageAction = actions.find(action => action.type === 'show_message')

  if (messageAction?.parameters?.message) {
    return messageAction.parameters.message
  }

  // デフォルトメッセージ
  switch (severity) {
    case 'critical':
      return 'この操作は実行できません'
    case 'high':
      return '入力内容に問題があります'
    case 'medium':
      return '推奨されない設定です'
    case 'low':
      return '注意：この設定について確認してください'
    default:
      return 'バリデーションエラーが発生しました'
  }
}

/**
 * 条件からフィールドパスを抽出
 */
function extractFieldPath(conditions: RuleCondition[]): string[] {
  const paths: string[] = []

  conditions.forEach(condition => {
    if (condition.field && !paths.includes(condition.field)) {
      paths.push(condition.field)
    }
  })

  return paths
}

/**
 * エンティティ固有のバリデーション関数
 */

/**
 * タスク用のビジネスルール適用
 */
export function createTaskValidationSchema<T extends z.ZodObject<any>>(baseSchema: T): T {
  return createZodSchemaFromBusinessRules('task', baseSchema) as T
}

/**
 * プロジェクト用のビジネスルール適用
 */
export function createProjectValidationSchema<T extends z.ZodObject<any>>(baseSchema: T): T {
  return createZodSchemaFromBusinessRules('project', baseSchema) as T
}

/**
 * ユーザー用のビジネスルール適用
 */
export function createUserValidationSchema<T extends z.ZodObject<any>>(baseSchema: T): T {
  return createZodSchemaFromBusinessRules('user', baseSchema) as T
}

/**
 * カスタムバリデーション関数の定義
 */

/**
 * 複雑な条件の組み合わせを処理
 */
export function createComplexValidation(
  schema: z.ZodObject<any>,
  validationFn: (data: any) => { isValid: boolean; message?: string; path?: string[] }
): z.ZodObject<any> {
  return schema.refine(
    (data) => {
      const result = validationFn(data)
      return result.isValid
    },
    (data) => {
      const result = validationFn(data)
      return {
        message: result.message || 'バリデーションエラー',
        path: result.path || [],
      }
    }
  )
}

/**
 * 条件付きバリデーション
 */
export function createConditionalValidation<T extends z.ZodObject<any>>(
  schema: T,
  condition: (data: any) => boolean,
  validationFn: (data: any) => boolean,
  errorMessage: string,
  errorPath?: string[]
): T {
  return schema.refine(
    (data) => {
      if (!condition(data)) {
        return true // 条件が満たされない場合はバリデーションをスキップ
      }
      return validationFn(data)
    },
    {
      message: errorMessage,
      path: errorPath,
    }
  ) as T
}

/**
 * 非同期バリデーション（データベースチェック等）
 */
export function createAsyncValidation<T extends z.ZodObject<any>>(
  schema: T,
  asyncValidationFn: (data: any) => Promise<{ isValid: boolean; message?: string; path?: string[] }>
): z.ZodEffects<T> {
  return schema.refine(
    async (data) => {
      const result = await asyncValidationFn(data)
      return result.isValid
    },
    async (data) => {
      const result = await asyncValidationFn(data)
      return {
        message: result.message || '非同期バリデーションエラー',
        path: result.path || [],
      }
    }
  )
}

/**
 * ビジネスルール違反の詳細情報を生成
 */
export function analyzeBusinessRuleViolations(
  entityType: string,
  data: any
): Array<{
  ruleId: string
  ruleName: string
  severity: string
  message: string
  field: string
  suggestedAction?: string
}> {
  const rules = businessRulesDictionary.getRulesForEntity(entityType)
  const violations: any[] = []

  rules.forEach(rule => {
    if (!evaluateConditions(data, rule.conditions)) {
      const messageAction = rule.actions.find(action => action.type === 'show_message')
      const suggestedAction = rule.actions.find(action => action.type === 'suggest_correction')

      violations.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        message: messageAction?.parameters?.message || generateErrorMessage(rule.actions, rule.severity),
        field: extractFieldPath(rule.conditions)[0] || 'unknown',
        suggestedAction: suggestedAction?.parameters?.suggestion,
      })
    }
  })

  return violations
}

/**
 * ビジネスルールの統計情報
 */
export function getBusinessRuleStats(entityType: string) {
  const rules = businessRulesDictionary.getRulesForEntity(entityType)

  return {
    totalRules: rules.length,
    bySeverity: {
      critical: rules.filter(r => r.severity === 'critical').length,
      high: rules.filter(r => r.severity === 'high').length,
      medium: rules.filter(r => r.severity === 'medium').length,
      low: rules.filter(r => r.severity === 'low').length,
    },
    byCategory: rules.reduce((acc: Record<string, number>, rule) => {
      acc[rule.category] = (acc[rule.category] || 0) + 1
      return acc
    }, {}),
    activeRules: rules.filter(r => r.isActive).length,
  }
}