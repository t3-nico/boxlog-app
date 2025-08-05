// Smart Folders システムのコアロジック

import { 
  SmartFolder, 
  SmartFolderRule, 
  SmartFolderRuleField,
  SmartFolderRuleOperator,
  RuleEvaluationContext 
} from '@/types/smart-folders'

// ルール評価エンジン
export class SmartFolderRuleEngine {
  /**
   * 指定されたアイテムがルールにマッチするかを評価
   */
  static evaluateRules(
    rules: SmartFolderRule[], 
    item: any, 
    context: RuleEvaluationContext = { 
      item, 
      now: new Date(), 
      userTimeZone: 'UTC' 
    }
  ): boolean {
    if (rules.length === 0) return true

    let result = true
    let currentLogic: 'AND' | 'OR' = 'AND'

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      const ruleResult = this.evaluateRule(rule, item, context)

      if (i === 0) {
        result = ruleResult
      } else {
        if (currentLogic === 'AND') {
          result = result && ruleResult
        } else {
          result = result || ruleResult
        }
      }

      currentLogic = rule.logic
    }

    return result
  }

  /**
   * 個別ルールの評価
   */
  private static evaluateRule(
    rule: SmartFolderRule, 
    item: any, 
    context: RuleEvaluationContext
  ): boolean {
    const fieldValue = this.getFieldValue(item, rule.field)
    const ruleValue = rule.value

    switch (rule.operator) {
      case 'equals':
        return fieldValue === ruleValue

      case 'not_equals':
        return fieldValue !== ruleValue

      case 'contains':
        return this.stringContains(fieldValue, ruleValue)

      case 'not_contains':
        return !this.stringContains(fieldValue, ruleValue)

      case 'starts_with':
        return this.stringStartsWith(fieldValue, ruleValue)

      case 'ends_with':
        return this.stringEndsWith(fieldValue, ruleValue)

      case 'greater_than':
        return this.compareValues(fieldValue, ruleValue, context) > 0

      case 'less_than':
        return this.compareValues(fieldValue, ruleValue, context) < 0

      case 'greater_equal':
        return this.compareValues(fieldValue, ruleValue, context) >= 0

      case 'less_equal':
        return this.compareValues(fieldValue, ruleValue, context) <= 0

      case 'is_empty':
        return this.isEmpty(fieldValue)

      case 'is_not_empty':
        return !this.isEmpty(fieldValue)

      default:
        console.warn(`Unknown operator: ${rule.operator}`)
        return false
    }
  }

  /**
   * アイテムからフィールド値を取得
   */
  private static getFieldValue(item: any, field: SmartFolderRuleField): any {
    switch (field) {
      case 'tag':
        return item.tags || item.tag || []
      case 'created_date':
        return item.createdAt || item.created_at
      case 'updated_date':
        return item.updatedAt || item.updated_at
      case 'status':
        return item.status
      case 'priority':
        return item.priority
      case 'is_favorite':
        return item.isFavorite || item.is_favorite || item.favorite
      case 'due_date':
        return item.dueDate || item.due_date
      case 'title':
        return item.title || item.name
      case 'description':
        return item.description || item.content
      default:
        return item[field]
    }
  }

  /**
   * 文字列の包含チェック
   */
  private static stringContains(fieldValue: any, ruleValue: any): boolean {
    if (typeof fieldValue === 'string' && typeof ruleValue === 'string') {
      return fieldValue.toLowerCase().includes(ruleValue.toLowerCase())
    }
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(item => 
        typeof item === 'string' && 
        typeof ruleValue === 'string' &&
        item.toLowerCase().includes(ruleValue.toLowerCase())
      )
    }
    return false
  }

  /**
   * 文字列の開始チェック
   */
  private static stringStartsWith(fieldValue: any, ruleValue: any): boolean {
    if (typeof fieldValue === 'string' && typeof ruleValue === 'string') {
      return fieldValue.toLowerCase().startsWith(ruleValue.toLowerCase())
    }
    return false
  }

  /**
   * 文字列の終了チェック
   */
  private static stringEndsWith(fieldValue: any, ruleValue: any): boolean {
    if (typeof fieldValue === 'string' && typeof ruleValue === 'string') {
      return fieldValue.toLowerCase().endsWith(ruleValue.toLowerCase())
    }
    return false
  }

  /**
   * 値の比較（数値・日付対応）
   */
  private static compareValues(fieldValue: any, ruleValue: any, context: RuleEvaluationContext): number {
    // 日付の比較
    if (fieldValue instanceof Date || typeof fieldValue === 'string') {
      const fieldDate = new Date(fieldValue)
      let compareDate: Date

      if (typeof ruleValue === 'string' && ruleValue.endsWith('days')) {
        const days = parseInt(ruleValue.replace('days', ''))
        compareDate = new Date(context.now.getTime() - (days * 24 * 60 * 60 * 1000))
      } else {
        compareDate = new Date(ruleValue)
      }

      return fieldDate.getTime() - compareDate.getTime()
    }

    // 数値の比較
    if (typeof fieldValue === 'number' && typeof ruleValue === 'number') {
      return fieldValue - ruleValue
    }

    // 文字列の比較
    if (typeof fieldValue === 'string' && typeof ruleValue === 'string') {
      return fieldValue.localeCompare(ruleValue)
    }

    return 0
  }

  /**
   * 空値チェック
   */
  private static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }
}

// フィルタリングヘルパー
export class SmartFolderFilter {
  /**
   * アイテムリストをスマートフォルダでフィルタリング
   */
  static filterItems<T = any>(
    items: T[], 
    folder: SmartFolder,
    context?: Partial<RuleEvaluationContext>
  ): T[] {
    if (!folder.isActive || folder.rules.length === 0) {
      return items
    }

    const evaluationContext: RuleEvaluationContext = {
      item: null, // 各アイテムで設定される
      now: new Date(),
      userTimeZone: 'UTC',
      ...context
    }

    return items.filter(item => {
      evaluationContext.item = item
      return SmartFolderRuleEngine.evaluateRules(folder.rules, item, evaluationContext)
    })
  }

  /**
   * 複数のスマートフォルダでアイテムをグループ化
   */
  static groupItemsByFolders<T = any>(
    items: T[], 
    folders: SmartFolder[],
    context?: Partial<RuleEvaluationContext>
  ): Record<string, T[]> {
    const result: Record<string, T[]> = {}

    folders.forEach(folder => {
      result[folder.id] = this.filterItems(items, folder, context)
    })

    return result
  }
}

// プリセットルール
export const PRESET_RULES = {
  // 最近のタスク（7日以内）
  RECENT_TASKS: {
    id: 'recent_tasks',
    name: '最近のタスク',
    description: '7日以内に更新されたタスク',
    rules: [
      {
        field: 'updated_date' as SmartFolderRuleField,
        operator: 'greater_than' as SmartFolderRuleOperator,
        value: '7days',
        logic: 'AND' as const
      }
    ],
    icon: '🕒',
    color: '#10B981'
  },
  
  // 高優先度タスク
  HIGH_PRIORITY: {
    id: 'high_priority',
    name: '高優先度',
    description: '優先度が高いタスク',
    rules: [
      {
        field: 'priority' as SmartFolderRuleField,
        operator: 'equals' as SmartFolderRuleOperator,
        value: 'high',
        logic: 'AND' as const
      }
    ],
    icon: '🔥',
    color: '#EF4444'
  },
  
  // お気に入り
  FAVORITES: {
    id: 'favorites',
    name: 'お気に入り',
    description: 'お気に入りに登録されたタスク',
    rules: [
      {
        field: 'is_favorite' as SmartFolderRuleField,
        operator: 'equals' as SmartFolderRuleOperator,
        value: true,
        logic: 'AND' as const
      }
    ],
    icon: '⭐',
    color: '#F59E0B'
  },
  
  // 期限切れ
  OVERDUE: {
    id: 'overdue',
    name: '期限切れ',
    description: '期限が過ぎたタスク',
    rules: [
      {
        field: 'due_date' as SmartFolderRuleField,
        operator: 'less_than' as SmartFolderRuleOperator,
        value: new Date().toISOString(),
        logic: 'AND' as const
      }
    ],
    icon: '⚠️',
    color: '#DC2626'
  }
}

// ルール構築ヘルパー
export class RuleBuilder {
  private rules: SmartFolderRule[] = []

  field(field: SmartFolderRuleField): RuleBuilder {
    this.currentRule = { field, operator: 'equals', value: null, logic: 'AND' }
    return this
  }

  private currentRule: Partial<SmartFolderRule> = {}

  operator(operator: SmartFolderRuleOperator): RuleBuilder {
    this.currentRule.operator = operator
    return this
  }

  value(value: any): RuleBuilder {
    this.currentRule.value = value
    return this
  }

  and(): RuleBuilder {
    this.currentRule.logic = 'AND'
    this.addRule()
    return this
  }

  or(): RuleBuilder {
    this.currentRule.logic = 'OR'
    this.addRule()
    return this
  }

  private addRule(): void {
    if (this.currentRule.field && this.currentRule.operator !== undefined) {
      this.rules.push(this.currentRule as SmartFolderRule)
      this.currentRule = {}
    }
  }

  build(): SmartFolderRule[] {
    this.addRule()
    return [...this.rules]
  }

  static create(): RuleBuilder {
    return new RuleBuilder()
  }
}