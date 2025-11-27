// 高度なスマートフォルダルール機能

import { SmartFolderRule, SmartFolderRuleField, SmartFolderRuleOperator } from '@/types/smart-folders'

// 拡張演算子
export enum AdvancedRuleOperator {
  // 正規表現
  REGEX_MATCH = 'regex_match',
  REGEX_NOT_MATCH = 'regex_not_match',

  // 数値範囲
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',

  // 日付/時間の高度な比較
  WITHIN_HOURS = 'within_hours',
  WITHIN_DAYS = 'within_days',
  WITHIN_WEEKS = 'within_weeks',
  WITHIN_MONTHS = 'within_months',

  // 時間帯
  TIME_BETWEEN = 'time_between',
  TIME_NOT_BETWEEN = 'time_not_between',

  // 曜日
  DAY_OF_WEEK = 'day_of_week',
  NOT_DAY_OF_WEEK = 'not_day_of_week',

  // 配列/リスト操作
  ARRAY_LENGTH = 'array_length',
  ARRAY_CONTAINS_ALL = 'array_contains_all',
  ARRAY_CONTAINS_ANY = 'array_contains_any',
  ARRAY_CONTAINS_NONE = 'array_contains_none',

  // カスタム関数
  CUSTOM_FUNCTION = 'custom_function',
}

// 拡張ルールタイプ（operator と value フィールドをオーバーライド）
export interface AdvancedSmartFolderRule extends Omit<SmartFolderRule, 'operator' | 'value'> {
  // 演算子：基本演算子 + 拡張演算子
  operator: SmartFolderRuleOperator | AdvancedRuleOperator

  // 値：基本の値 + 配列や複雑な値も許可
  value: string | number | boolean | Date | null | [number, number] | unknown

  // 正規表現フラグ
  isRegex?: boolean
  regexFlags?: string

  // カスタムフィールド
  customField?: string

  // 時間範囲の詳細設定
  timeRange?: {
    startTime?: string // HH:MM format
    endTime?: string // HH:MM format
    timezone?: string
    excludeWeekends?: boolean
    excludeHolidays?: boolean
  }

  // 複合条件のグループ化
  groupId?: string
  groupLogic?: 'AND' | 'OR'

  // 重み付け（複数ルールの優先度）
  weight?: number

  // 条件の有効期間
  validFrom?: Date
  validUntil?: Date

  // 動的パラメータ
  parameters?: Record<string, unknown>
}

// カスタム関数のシグネチャ
export type CustomRuleFunction = (fieldValue: unknown, rule: AdvancedSmartFolderRule) => boolean

// 安全なカスタム関数の定義
export interface SafeCustomFunction {
  name: string
  description: string
  validator: (fieldValue: unknown, rule: AdvancedSmartFolderRule) => boolean
  // セキュリティレベル（開発モードのみ許可などの制御用）
  securityLevel: 'safe' | 'restricted' | 'dangerous'
}

// カスタムフィールド定義
export interface CustomFieldDefinition {
  id: string
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'array'
  description: string
  validator?: (value: unknown) => boolean
  extractor: (item: unknown) => unknown // アイテムからフィールド値を抽出する関数
}

// 高度なルール評価エンジン
export class AdvancedRuleEngine {
  private static customFields: Map<string, CustomFieldDefinition> = new Map()
  private static customFunctions: Map<string, SafeCustomFunction> = new Map()

  // 開発モード判定（本番環境では危険な関数を無効化）
  private static isDevelopmentMode = process.env.NODE_ENV === 'development'

  /**
   * カスタムフィールドの登録
   */
  static registerCustomField(field: CustomFieldDefinition) {
    this.customFields.set(field.id, field)
  }

  /**
   * 安全なカスタム関数の登録
   */
  static registerSafeCustomFunction(functionDef: SafeCustomFunction) {
    // セキュリティレベルのチェック
    if (functionDef.securityLevel === 'dangerous' && !this.isDevelopmentMode) {
      console.warn(`Dangerous function '${functionDef.name}' is not allowed in production mode`)
      return false
    }

    if (functionDef.securityLevel === 'restricted' && !this.isDevelopmentMode) {
      console.warn(`Restricted function '${functionDef.name}' requires development mode`)
      return false
    }

    this.customFunctions.set(functionDef.name, functionDef)
    return true
  }

  /**
   * 登録されたカスタム関数の一覧取得
   */
  static getRegisteredFunctions(): SafeCustomFunction[] {
    return Array.from(this.customFunctions.values())
  }

  /**
   * カスタム関数の削除
   */
  static unregisterCustomFunction(name: string): boolean {
    return this.customFunctions.delete(name)
  }

  /**
   * 高度なルールの評価
   */
  static evaluateAdvancedRule(item: unknown, rule: AdvancedSmartFolderRule): boolean {
    // 有効期間チェック
    if (!this.isRuleValid(rule)) {
      return false
    }

    // パラメータ置換
    const processedRule = this.processRuleParameters(rule)

    // フィールド値の取得（カスタムフィールド対応）
    const fieldValue = this.getAdvancedFieldValue(item, processedRule)

    // 演算子による評価
    return this.evaluateAdvancedOperator(fieldValue, processedRule)
  }

  /**
   * グループ化されたルールの評価
   */
  static evaluateRuleGroups(item: unknown, rules: AdvancedSmartFolderRule[]): boolean {
    // ルールをグループごとに分類
    const groups = this.groupRules(rules)

    // 各グループを評価
    const groupResults = groups.map((group) => this.evaluateGroup(item, group))

    // グループ間のロジック演算（通常はOR）
    return groupResults.some((result) => result)
  }

  /**
   * 正規表現の評価
   */
  private static evaluateRegex(value: unknown, pattern: string, flags: string = 'i'): boolean {
    if (typeof value !== 'string') return false

    try {
      // ESLint除外: 正規表現パターンは入力時に検証済み
      const regex = new RegExp(pattern, flags)
      return regex.test(value)
    } catch (error) {
      console.warn('Invalid regex pattern:', pattern, error)
      return false
    }
  }

  /**
   * 数値範囲の評価
   */
  private static evaluateBetween(value: unknown, range: [number, number]): boolean {
    const numValue = Number(value)
    if (isNaN(numValue)) return false

    return numValue >= range[0] && numValue <= range[1]
  }

  /**
   * 日時範囲の評価
   */
  private static evaluateTimeRange(value: unknown, rule: AdvancedSmartFolderRule): boolean {
    // 型ガード: value が Date コンストラクタに渡せる型かチェック
    if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
      return false
    }

    const date = new Date(value)
    if (isNaN(date.getTime())) return false

    const { timeRange } = rule
    if (!timeRange) return true

    // 時間帯チェック
    if (timeRange.startTime && timeRange.endTime) {
      const timeStr = date.toTimeString().substring(0, 5) // HH:MM
      if (timeStr < timeRange.startTime || timeStr > timeRange.endTime) {
        return false
      }
    }

    // 週末除外
    if (timeRange.excludeWeekends) {
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) return false
    }

    // 祝日除外（簡易実装）
    if (timeRange.excludeHolidays) {
      // 実際のプロダクションでは祝日APIを使用
      const holidays = ['2024-01-01', '2024-12-25'] // 例
      const dateStr = date.toISOString().split('T')[0]
      if (holidays.includes(dateStr)) return false
    }

    return true
  }

  /**
   * 配列操作の評価
   */
  private static evaluateArrayOperation(
    value: unknown,
    operator: AdvancedRuleOperator,
    compareValue: unknown
  ): boolean {
    if (!Array.isArray(value)) return false

    switch (operator) {
      case AdvancedRuleOperator.ARRAY_LENGTH:
        return value.length === Number(compareValue)

      case AdvancedRuleOperator.ARRAY_CONTAINS_ALL:
        const targetAll = Array.isArray(compareValue) ? compareValue : [compareValue]
        return targetAll.every((item) => value.includes(item))

      case AdvancedRuleOperator.ARRAY_CONTAINS_ANY:
        const targetAny = Array.isArray(compareValue) ? compareValue : [compareValue]
        return targetAny.some((item) => value.includes(item))

      case AdvancedRuleOperator.ARRAY_CONTAINS_NONE:
        const targetNone = Array.isArray(compareValue) ? compareValue : [compareValue]
        return !targetNone.some((item) => value.includes(item))

      default:
        return false
    }
  }

  /**
   * ルールの有効性チェック
   */
  private static isRuleValid(rule: AdvancedSmartFolderRule): boolean {
    const now = new Date()

    if (rule.validFrom && now < rule.validFrom) return false
    if (rule.validUntil && now > rule.validUntil) return false

    return true
  }

  /**
   * ルールパラメータの処理
   */
  private static processRuleParameters(rule: AdvancedSmartFolderRule): AdvancedSmartFolderRule {
    if (!rule.parameters) return rule

    const processedRule = { ...rule }

    // 値のパラメータ置換
    if (typeof processedRule.value === 'string') {
      processedRule.value = this.replaceParameters(processedRule.value, rule.parameters)
    }

    return processedRule
  }

  /**
   * パラメータ置換
   */
  private static replaceParameters(template: string, parameters: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      return parameters[paramName] !== undefined ? String(parameters[paramName]) : match
    })
  }

  /**
   * 高度なフィールド値取得
   */
  private static getAdvancedFieldValue(item: unknown, rule: AdvancedSmartFolderRule): unknown {
    // カスタムフィールドの処理
    if (rule.customField) {
      const customField = this.customFields.get(rule.customField)
      if (customField) {
        return customField.extractor(item)
      }
    }

    // 標準フィールドの処理
    return this.getStandardFieldValue(item, rule.field)
  }

  /**
   * 標準フィールド値の取得
   */
  private static getStandardFieldValue(item: unknown, field: SmartFolderRuleField): unknown {
    const fieldMap: Record<string, string[]> = {
      tag: ['tags', 'tag'],
      created_date: ['createdAt', 'created_at', 'createdDate'],
      updated_date: ['updatedAt', 'updated_at', 'updatedDate'],
      status: ['status', 'state'],
      priority: ['priority', 'importance'],
      is_favorite: ['isFavorite', 'is_favorite', 'favorite'],
      due_date: ['dueDate', 'due_date', 'deadline'],
      title: ['title', 'name', 'subject'],
      description: ['description', 'content', 'body'],
    }

    const possibleKeys = fieldMap[field] || [field]

    // 型ガード: itemがオブジェクトであることを確認
    if (typeof item !== 'object' || item === null) {
      return undefined
    }

    for (const key of possibleKeys) {
      if (key in item) {
        return (item as Record<string, unknown>)[key]
      }
    }

    return undefined
  }

  /**
   * 高度な演算子の評価
   */
  private static evaluateAdvancedOperator(fieldValue: unknown, rule: AdvancedSmartFolderRule): boolean {
    const operator = rule.operator as string

    switch (operator) {
      case AdvancedRuleOperator.REGEX_MATCH:
        return this.evaluateRegex(fieldValue, String(rule.value), rule.regexFlags)

      case AdvancedRuleOperator.REGEX_NOT_MATCH:
        return !this.evaluateRegex(fieldValue, String(rule.value), rule.regexFlags)

      case AdvancedRuleOperator.BETWEEN:
        return this.evaluateBetween(fieldValue, rule.value as unknown as [number, number])

      case AdvancedRuleOperator.NOT_BETWEEN:
        return !this.evaluateBetween(fieldValue, rule.value as unknown as [number, number])

      case AdvancedRuleOperator.TIME_BETWEEN:
        return this.evaluateTimeRange(fieldValue, rule)

      case AdvancedRuleOperator.ARRAY_LENGTH:
      case AdvancedRuleOperator.ARRAY_CONTAINS_ALL:
      case AdvancedRuleOperator.ARRAY_CONTAINS_ANY:
      case AdvancedRuleOperator.ARRAY_CONTAINS_NONE:
        return this.evaluateArrayOperation(fieldValue, operator, rule.value)

      case AdvancedRuleOperator.CUSTOM_FUNCTION:
        const funcDef = this.customFunctions.get(String(rule.value))
        if (!funcDef) {
          console.warn(`Custom function '${rule.value}' not found`)
          return false
        }

        try {
          return funcDef.validator(fieldValue, rule)
        } catch (error) {
          console.error(`Error executing custom function '${funcDef.name}':`, error)
          return false
        }

      default:
        // 標準演算子にフォールバック
        return this.evaluateStandardOperator(fieldValue, rule)
    }
  }

  /**
   * 標準演算子の評価（フォールバック）
   */
  private static evaluateStandardOperator(fieldValue: unknown, rule: AdvancedSmartFolderRule): boolean {
    // 既存のBasicRuleEngineの実装を使用
    // ここでは簡略化
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value
      case 'contains':
        return String(fieldValue).includes(String(rule.value))
      // ... 他の標準演算子
      default:
        return false
    }
  }

  /**
   * ルールのグループ化
   */
  private static groupRules(rules: AdvancedSmartFolderRule[]): AdvancedSmartFolderRule[][] {
    const groups: Map<string, AdvancedSmartFolderRule[]> = new Map()
    const ungrouped: AdvancedSmartFolderRule[] = []

    for (const rule of rules) {
      if (rule.groupId) {
        if (!groups.has(rule.groupId)) {
          groups.set(rule.groupId, [])
        }
        groups.get(rule.groupId)!.push(rule)
      } else {
        ungrouped.push(rule)
      }
    }

    const result = Array.from(groups.values())
    if (ungrouped.length > 0) {
      result.push(ungrouped)
    }

    return result
  }

  /**
   * グループの評価
   */
  private static evaluateGroup(item: unknown, group: AdvancedSmartFolderRule[]): boolean {
    if (group.length === 0) return true

    // グループ内のロジック（最初のルールのgroupLogicを使用）
    const groupLogic = group[0].groupLogic || 'AND'

    if (groupLogic === 'AND') {
      return group.every((rule) => this.evaluateAdvancedRule(item, rule))
    } else {
      return group.some((rule) => this.evaluateAdvancedRule(item, rule))
    }
  }
}

// ルールビルダー（高度版）
export class AdvancedRuleBuilder {
  private rules: AdvancedSmartFolderRule[] = []
  private currentGroupId?: string

  /**
   * グループの開始
   */
  startGroup(groupId: string, _logic: 'AND' | 'OR' = 'AND'): this {
    this.currentGroupId = groupId
    return this
  }

  /**
   * グループの終了
   */
  endGroup(): this {
    this.currentGroupId = undefined
    return this
  }

  /**
   * 正規表現ルールの追加
   */
  regex(field: SmartFolderRuleField, pattern: string, flags?: string): this {
    this.addRule({
      field,
      operator: AdvancedRuleOperator.REGEX_MATCH,
      value: pattern,
      logic: 'AND',
      isRegex: true,
      regexFlags: flags,
      groupId: this.currentGroupId,
    })
    return this
  }

  /**
   * 範囲ルールの追加
   */
  between(field: SmartFolderRuleField, min: number, max: number): this {
    this.addRule({
      field,
      operator: AdvancedRuleOperator.BETWEEN,
      value: [min, max],
      logic: 'AND',
      groupId: this.currentGroupId,
    })
    return this
  }

  /**
   * 時間範囲ルールの追加
   */
  timeRange(
    field: SmartFolderRuleField,
    startTime: string,
    endTime: string,
    options?: Partial<AdvancedSmartFolderRule['timeRange']>
  ): this {
    this.addRule({
      field,
      operator: AdvancedRuleOperator.TIME_BETWEEN,
      value: null,
      logic: 'AND',
      timeRange: {
        startTime,
        endTime,
        ...options,
      },
      groupId: this.currentGroupId,
    })
    return this
  }

  /**
   * ルールの追加（パブリックメソッドに変更）
   */
  addRule(rule: AdvancedSmartFolderRule): this {
    this.rules.push(rule)
    return this
  }

  /**
   * ルールの構築
   */
  build(): AdvancedSmartFolderRule[] {
    return [...this.rules]
  }

  /**
   * ビルダーのリセット
   */
  reset(): this {
    this.rules = []
    this.currentGroupId = undefined
    return this
  }

  /**
   * 静的ビルダーの作成
   */
  static create(): AdvancedRuleBuilder {
    return new AdvancedRuleBuilder()
  }
}

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
