// スマートフォルダ ルール評価エンジン（拡張版）

import { RuleEvaluationContext, SmartFolderRule, SmartFolderRuleField } from '@/types/smart-folders'
import { Task } from '@/types/unified'

// ルールエンジンで評価可能なアイテムの型
export type EvaluableItem = Task | Record<string, unknown>

// フィールド値の型
type FieldValue = string | number | boolean | Date | string[] | null | undefined

// ルール評価結果のキャッシュ
interface RuleEvaluationCache {
  key: string
  result: boolean
  timestamp: number
}

// 評価統計情報
interface EvaluationStats {
  totalEvaluations: number
  cacheHits: number
  cacheMisses: number
  averageEvaluationTime: number
}

export class AdvancedRuleEngine {
  private static cache: Map<string, RuleEvaluationCache> = new Map()
  private static cacheMaxAge = 5 * 60 * 1000 // 5分
  private static cacheMaxSize = 10000
  private static stats: EvaluationStats = {
    totalEvaluations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageEvaluationTime: 0,
  }

  /**
   * 単一ルールの評価（キャッシュ付き）
   */
  static evaluateRule(
    item: EvaluableItem,
    rule: SmartFolderRule,
    context: RuleEvaluationContext = {
      item,
      now: new Date(),
      userTimeZone: 'UTC',
    }
  ): boolean {
    const startTime = performance.now()

    // キャッシュキーの生成
    const cacheKey = this.generateCacheKey(item, rule)

    // キャッシュチェック
    const cachedResult = this.getFromCache(cacheKey)
    if (cachedResult !== null) {
      this.stats.cacheHits++
      this.updateStats(performance.now() - startTime)
      return cachedResult
    }

    this.stats.cacheMisses++

    // ルール評価
    const result = this.evaluateSingleRule(item, rule, context)

    // キャッシュに保存
    this.saveToCache(cacheKey, result)

    this.updateStats(performance.now() - startTime)
    return result
  }

  /**
   * ルールセットの評価（AND/OR論理演算）
   */
  static evaluateRuleSet(item: EvaluableItem, rules: SmartFolderRule[], context?: RuleEvaluationContext): boolean {
    if (rules.length === 0) return true

    const evaluationContext = context || {
      item,
      now: new Date(),
      userTimeZone: 'UTC',
    }

    // グループ化されたルール評価
    const groups = this.groupRulesByLogic(rules)

    return this.evaluateRuleGroups(item, groups, evaluationContext)
  }

  /**
   * バッチ評価（複数アイテムを効率的に評価）
   */
  static evaluateBatch<T extends EvaluableItem>(
    items: T[],
    rules: SmartFolderRule[],
    context?: Partial<RuleEvaluationContext>
  ): { item: T; matches: boolean }[] {
    const results: { item: T; matches: boolean }[] = []

    // ルールを事前処理して最適化
    const optimizedRules = this.optimizeRules(rules)

    for (const item of items) {
      const evaluationContext = {
        item,
        now: new Date(),
        userTimeZone: 'UTC',
        ...context,
      }

      const matches = this.evaluateRuleSet(item, optimizedRules, evaluationContext)
      results.push({ item, matches })
    }

    return results
  }

  /**
   * 個別ルールの評価（実装部分）
   */
  private static evaluateSingleRule(
    item: EvaluableItem,
    rule: SmartFolderRule,
    context: RuleEvaluationContext
  ): boolean {
    const fieldValue = this.getFieldValue(item, rule.field)

    switch (rule.field) {
      case 'tag':
        return this.evaluateTagCondition(fieldValue, rule)
      case 'created_date':
      case 'updated_date':
      case 'due_date':
        return this.evaluateDateCondition(fieldValue, rule, context)
      case 'status':
        return this.evaluateStatusCondition(fieldValue, rule)
      case 'priority':
        return this.evaluatePriorityCondition(fieldValue, rule)
      case 'is_favorite':
        return this.evaluateBooleanCondition(fieldValue, rule)
      case 'title':
      case 'description':
        return this.evaluateTextCondition(fieldValue, rule)
      default:
        return this.evaluateGenericCondition(fieldValue, rule)
    }
  }

  /**
   * タグ条件の評価
   */
  private static evaluateTagCondition(fieldValue: FieldValue, rule: SmartFolderRule): boolean {
    const tags = Array.isArray(fieldValue) ? fieldValue : []
    const ruleValue = rule.value
    const ruleValueAsString = ruleValue != null ? String(ruleValue) : ''

    switch (rule.operator) {
      case 'contains':
        return tags.includes(ruleValueAsString)
      case 'not_contains':
        return !tags.includes(ruleValueAsString)
      case 'equals':
        return JSON.stringify(tags.sort()) === JSON.stringify([ruleValueAsString].sort())
      case 'is_empty':
        return tags.length === 0
      case 'is_not_empty':
        return tags.length > 0
      default:
        return false
    }
  }

  /**
   * 日付条件の評価
   */
  private static evaluateDateCondition(
    fieldValue: FieldValue,
    rule: SmartFolderRule,
    context: RuleEvaluationContext
  ): boolean {
    if (!fieldValue) return rule.operator === 'is_empty'

    const fieldDate = new Date(fieldValue as string | number | Date)
    if (isNaN(fieldDate.getTime())) return false

    let compareDate: Date

    // 相対日付の処理（例: "7days", "1month"）
    if (typeof rule.value === 'string' && /^\d+\w+$/.test(rule.value)) {
      compareDate = this.parseRelativeDate(rule.value, context.now)
    } else if (typeof rule.value === 'string' || typeof rule.value === 'number' || rule.value instanceof Date) {
      compareDate = new Date(rule.value)
    } else {
      return false
    }

    switch (rule.operator) {
      case 'greater_than':
        return fieldDate > compareDate
      case 'less_than':
        return fieldDate < compareDate
      case 'greater_equal':
        return fieldDate >= compareDate
      case 'less_equal':
        return fieldDate <= compareDate
      case 'equals':
        return fieldDate.toDateString() === compareDate.toDateString()
      default:
        return false
    }
  }

  /**
   * ステータス条件の評価
   */
  private static evaluateStatusCondition(fieldValue: FieldValue, rule: SmartFolderRule): boolean {
    const status = String(fieldValue).toLowerCase()
    const ruleValue = String(rule.value).toLowerCase()

    switch (rule.operator) {
      case 'equals':
        return status === ruleValue
      case 'not_equals':
        return status !== ruleValue
      case 'contains':
        return status.includes(ruleValue)
      case 'not_contains':
        return !status.includes(ruleValue)
      default:
        return false
    }
  }

  /**
   * 優先度条件の評価
   */
  private static evaluatePriorityCondition(fieldValue: FieldValue, rule: SmartFolderRule): boolean {
    const priorityMap: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    }

    const fieldPriority = priorityMap[String(fieldValue).toLowerCase()] || 0
    const rulePriority = priorityMap[String(rule.value).toLowerCase()] || 0

    switch (rule.operator) {
      case 'equals':
        return fieldPriority === rulePriority
      case 'not_equals':
        return fieldPriority !== rulePriority
      case 'greater_than':
        return fieldPriority > rulePriority
      case 'less_than':
        return fieldPriority < rulePriority
      case 'greater_equal':
        return fieldPriority >= rulePriority
      case 'less_equal':
        return fieldPriority <= rulePriority
      default:
        return false
    }
  }

  /**
   * ブール値条件の評価
   */
  private static evaluateBooleanCondition(fieldValue: FieldValue, rule: SmartFolderRule): boolean {
    const boolValue = Boolean(fieldValue)

    switch (rule.operator) {
      case 'equals':
        return boolValue === rule.value
      case 'not_equals':
        return boolValue !== rule.value
      default:
        return false
    }
  }

  /**
   * テキスト条件の評価
   */
  private static evaluateTextCondition(fieldValue: FieldValue, rule: SmartFolderRule): boolean {
    const text = String(fieldValue || '').toLowerCase()
    const ruleText = String(rule.value || '').toLowerCase()

    switch (rule.operator) {
      case 'contains':
        return text.includes(ruleText)
      case 'not_contains':
        return !text.includes(ruleText)
      case 'equals':
        return text === ruleText
      case 'not_equals':
        return text !== ruleText
      case 'starts_with':
        return text.startsWith(ruleText)
      case 'ends_with':
        return text.endsWith(ruleText)
      case 'is_empty':
        return text.trim() === ''
      case 'is_not_empty':
        return text.trim() !== ''
      default:
        return false
    }
  }

  /**
   * 汎用条件の評価
   */
  private static evaluateGenericCondition(fieldValue: FieldValue, rule: SmartFolderRule): boolean {
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value
      case 'not_equals':
        return fieldValue !== rule.value
      case 'is_empty':
        return !fieldValue
      case 'is_not_empty':
        return !!fieldValue
      default:
        return false
    }
  }

  /**
   * フィールド値の取得
   */
  private static getFieldValue(item: EvaluableItem, field: SmartFolderRuleField): FieldValue {
    const fieldMap: Record<string, string[]> = {
      tag: ['tags', 'tag'],
      created_date: ['createdAt', 'created_at', 'createdDate'],
      updated_date: ['updatedAt', 'updated_at', 'updatedDate'],
      status: ['status', 'state'],
      priority: ['priority', 'importance'],
      is_favorite: ['isFavorite', 'is_favorite', 'favorite', 'starred'],
      due_date: ['dueDate', 'due_date', 'deadline'],
      title: ['title', 'name', 'subject'],
      description: ['description', 'content', 'body'],
    }

    const possibleKeys = fieldMap[field] || [field]

    for (const key of possibleKeys) {
      if (key in item) {
        return item[key as keyof typeof item] as FieldValue
      }
    }

    return undefined
  }

  /**
   * ルールをロジックでグループ化
   */
  private static groupRulesByLogic(rules: SmartFolderRule[]): SmartFolderRule[][] {
    const groups: SmartFolderRule[][] = []
    let currentGroup: SmartFolderRule[] = []

    for (const rule of rules) {
      currentGroup.push(rule)

      if (rule.logic === 'OR' || rule === rules[rules.length - 1]) {
        groups.push([...currentGroup])
        currentGroup = []
      }
    }

    return groups
  }

  /**
   * グループ化されたルールの評価
   */
  private static evaluateRuleGroups(
    item: EvaluableItem,
    groups: SmartFolderRule[][],
    context: RuleEvaluationContext
  ): boolean {
    // OR グループの評価（いずれか1つでも true なら true）
    for (const group of groups) {
      const groupResult = group.every((rule) => this.evaluateRule(item, rule, context))

      if (groupResult) {
        return true
      }
    }

    return false
  }

  /**
   * 相対日付のパース
   */
  private static parseRelativeDate(relativeDate: string, now: Date): Date {
    const match = relativeDate.match(/^(\d+)(\w+)$/)
    if (!match) return now

    const [, amountStr, unit] = match
    const amount = parseInt(amountStr!)
    const result = new Date(now)

    switch (unit) {
      case 'days':
      case 'day':
        result.setDate(result.getDate() - amount)
        break
      case 'weeks':
      case 'week':
        result.setDate(result.getDate() - amount * 7)
        break
      case 'months':
      case 'month':
        result.setMonth(result.getMonth() - amount)
        break
      case 'years':
      case 'year':
        result.setFullYear(result.getFullYear() - amount)
        break
      case 'hours':
      case 'hour':
        result.setHours(result.getHours() - amount)
        break
      case 'minutes':
      case 'minute':
        result.setMinutes(result.getMinutes() - amount)
        break
    }

    return result
  }

  /**
   * ルールの最適化
   */
  private static optimizeRules(rules: SmartFolderRule[]): SmartFolderRule[] {
    // 簡単に評価できるルールを前に配置
    return [...rules].sort((a, b) => {
      const scoreA = this.getRuleComplexityScore(a)
      const scoreB = this.getRuleComplexityScore(b)
      return scoreA - scoreB
    })
  }

  /**
   * ルールの複雑度スコア
   */
  private static getRuleComplexityScore(rule: SmartFolderRule): number {
    const scores: Record<string, number> = {
      is_empty: 1,
      is_not_empty: 1,
      equals: 2,
      not_equals: 2,
      contains: 3,
      not_contains: 3,
      starts_with: 3,
      ends_with: 3,
      greater_than: 4,
      less_than: 4,
      greater_equal: 4,
      less_equal: 4,
    }

    return scores[rule.operator] || 5
  }

  /**
   * キャッシュキーの生成
   */
  private static generateCacheKey(item: EvaluableItem, rule: SmartFolderRule): string {
    const itemId = item.id || JSON.stringify(item).substring(0, 50)
    const ruleKey = `${rule.field}-${rule.operator}-${rule.value}`
    return `${itemId}-${ruleKey}`
  }

  /**
   * キャッシュから取得
   */
  private static getFromCache(key: string): boolean | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.cache.delete(key)
      return null
    }

    return cached.result
  }

  /**
   * キャッシュに保存
   */
  private static saveToCache(key: string, result: boolean): void {
    // キャッシュサイズ制限
    if (this.cache.size >= this.cacheMaxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now(),
    })
  }

  /**
   * 統計情報の更新
   */
  private static updateStats(evaluationTime: number): void {
    this.stats.totalEvaluations++
    this.stats.averageEvaluationTime =
      (this.stats.averageEvaluationTime * (this.stats.totalEvaluations - 1) + evaluationTime) /
      this.stats.totalEvaluations
  }

  /**
   * キャッシュのクリア
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * 統計情報の取得
   */
  static getStats(): EvaluationStats {
    return { ...this.stats }
  }

  /**
   * 統計情報のリセット
   */
  static resetStats(): void {
    this.stats = {
      totalEvaluations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageEvaluationTime: 0,
    }
  }
}
