/**
 * ビジネスルール辞書システム - コア基盤
 *
 * Issue #344: ビジネスルール辞書の基盤設計・実装
 * 関連Issue #343: ビジネスルール辞書システム実装
 * 祖先Issue #338: 技術的失敗を防ぐ開発環境構築
 *
 * 目的:
 * - バリデーションルールの一元管理
 * - ワークフロー定義の統一
 * - 権限制御ルールの自動化
 * - データ整合性チェックの自動化
 */

/**
 * バリデーション結果
 */
export interface ValidationResult {
  /** 検証成功/失敗 */
  valid: boolean
  /** エラーメッセージ（失敗時） */
  message?: string
  /** エラーコード */
  code?: string
  /** 追加詳細情報 */
  details?: Record<string, any>
}

/**
 * ビジネスルール実行コンテキスト
 */
export interface RuleContext {
  /** 実行対象のデータ */
  data: any
  /** ユーザー情報 */
  user?: {
    id: string
    role: string
    permissions: string[]
  }
  /** セッション情報 */
  session?: {
    id: string
    timestamp: Date
  }
  /** 追加メタデータ */
  metadata?: Record<string, any>
}

/**
 * ビジネスルール定義
 */
export interface BusinessRule {
  /** 一意識別子 */
  id: string

  /** ルール名（人間可読） */
  name: string

  /** ルールの説明 */
  description: string

  /** カテゴリ分類 */
  category: 'validation' | 'workflow' | 'permission' | 'constraint'

  /** 重要度 */
  severity: 'error' | 'warning' | 'info'

  /** 適用対象のコンテキスト */
  contexts: string[]

  /** ルール実装関数 */
  implementation: (context: RuleContext) => ValidationResult | Promise<ValidationResult>

  /** 依存ルール（このルールより先に実行すべきルール） */
  dependencies?: string[]

  /** 作成日時 */
  createdAt: Date

  /** 更新日時 */
  updatedAt: Date

  /** アクティブ/非アクティブ */
  active: boolean
}

/**
 * ルール実行結果
 */
export interface RuleExecutionResult {
  /** 実行されたルール */
  rule: BusinessRule
  /** 実行結果 */
  result: ValidationResult
  /** 実行時間（ミリ秒） */
  executionTime: number
  /** 実行タイムスタンプ */
  timestamp: Date
}

/**
 * ビジネスルールレジストリ - ルール管理の中央システム
 */
export class BusinessRuleRegistry {
  private rules: Map<string, BusinessRule> = new Map()
  private contextIndex: Map<string, Set<string>> = new Map()
  private categoryIndex: Map<string, Set<string>> = new Map()

  /**
   * ルールを登録
   */
  register(rule: BusinessRule): void {
    // バリデーション
    if (!rule.id || !rule.name || !rule.implementation) {
      throw new Error('ルール登録エラー: id, name, implementationは必須です')
    }

    // 重複チェック
    if (this.rules.has(rule.id)) {
      throw new Error(`ルール登録エラー: ID "${rule.id}" は既に存在します`)
    }

    // 依存関係チェック
    if (rule.dependencies) {
      for (const dep of rule.dependencies) {
        if (!this.rules.has(dep)) {
          throw new Error(`ルール登録エラー: 依存ルール "${dep}" が見つかりません`)
        }
      }
    }

    this.rules.set(rule.id, rule)

    // インデックス更新
    this.updateContextIndex(rule)
    this.updateCategoryIndex(rule)
  }

  /**
   * ルールを取得
   */
  getRule(id: string): BusinessRule | undefined {
    return this.rules.get(id)
  }

  /**
   * 全ルールを取得
   */
  getAllRules(): BusinessRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * コンテキストに適用されるルールを取得
   */
  getApplicableRules(context: string): BusinessRule[] {
    const ruleIds = this.contextIndex.get(context) || new Set()
    return Array.from(ruleIds)
      .map((id) => this.rules.get(id))
      .filter((rule): rule is BusinessRule => rule !== undefined && rule.active)
      .sort(this.sortRulesByPriority)
  }

  /**
   * カテゴリ別ルールを取得
   */
  getRulesByCategory(category: BusinessRule['category']): BusinessRule[] {
    const ruleIds = this.categoryIndex.get(category) || new Set()
    return Array.from(ruleIds)
      .map((id) => this.rules.get(id))
      .filter((rule): rule is BusinessRule => rule !== undefined)
  }

  /**
   * コンテキストでルールを実行
   */
  async validate(contextName: string, data: any, user?: RuleContext['user']): Promise<RuleExecutionResult[]> {
    const rules = this.getApplicableRules(contextName)
    const context: RuleContext = {
      data,
      user,
      session: {
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
    }

    const results: RuleExecutionResult[] = []

    // 依存関係を考慮してルールを実行
    const resolvedRules = this.resolveDependencies(rules)

    for (const rule of resolvedRules) {
      const startTime = performance.now()
      try {
        const result = await rule.implementation(context)
        const endTime = performance.now()

        results.push({
          rule,
          result,
          executionTime: endTime - startTime,
          timestamp: new Date(),
        })

        // エラーの場合は後続を停止
        if (!result.valid && rule.severity === 'error') {
          break
        }
      } catch (error) {
        const endTime = performance.now()
        results.push({
          rule,
          result: {
            valid: false,
            message: error instanceof Error ? error.message : '不明なエラー',
            code: 'RULE_EXECUTION_ERROR',
          },
          executionTime: endTime - startTime,
          timestamp: new Date(),
        })

        if (rule.severity === 'error') {
          break
        }
      }
    }

    return results
  }

  /**
   * ルールを無効化
   */
  deactivateRule(id: string): boolean {
    const rule = this.rules.get(id)
    if (rule) {
      rule.active = false
      rule.updatedAt = new Date()
      return true
    }
    return false
  }

  /**
   * ルールを有効化
   */
  activateRule(id: string): boolean {
    const rule = this.rules.get(id)
    if (rule) {
      rule.active = true
      rule.updatedAt = new Date()
      return true
    }
    return false
  }

  /**
   * ルール統計情報を取得
   */
  getStats() {
    const total = this.rules.size
    const active = Array.from(this.rules.values()).filter((r) => r.active).length
    const byCategory = {
      validation: this.getRulesByCategory('validation').length,
      workflow: this.getRulesByCategory('workflow').length,
      permission: this.getRulesByCategory('permission').length,
      constraint: this.getRulesByCategory('constraint').length,
    }

    return {
      total,
      active,
      inactive: total - active,
      byCategory,
      contexts: this.contextIndex.size,
    }
  }

  /**
   * コンテキストインデックス更新
   */
  private updateContextIndex(rule: BusinessRule): void {
    for (const context of rule.contexts) {
      if (!this.contextIndex.has(context)) {
        this.contextIndex.set(context, new Set())
      }
      this.contextIndex.get(context)!.add(rule.id)
    }
  }

  /**
   * カテゴリインデックス更新
   */
  private updateCategoryIndex(rule: BusinessRule): void {
    if (!this.categoryIndex.has(rule.category)) {
      this.categoryIndex.set(rule.category, new Set())
    }
    this.categoryIndex.get(rule.category)!.add(rule.id)
  }

  /**
   * ルール優先度ソート（エラー > 警告 > 情報）
   */
  private sortRulesByPriority(a: BusinessRule, b: BusinessRule): number {
    const priorityOrder = { error: 0, warning: 1, info: 2 }
    return priorityOrder[a.severity] - priorityOrder[b.severity]
  }

  /**
   * 依存関係を解決してルールを順序付け
   */
  private resolveDependencies(rules: BusinessRule[]): BusinessRule[] {
    const resolved: BusinessRule[] = []
    const visiting = new Set<string>()
    const visited = new Set<string>()

    const visit = (rule: BusinessRule) => {
      if (visiting.has(rule.id)) {
        throw new Error(`循環依存エラー: ルール "${rule.id}"`)
      }
      if (visited.has(rule.id)) {
        return
      }

      visiting.add(rule.id)

      if (rule.dependencies) {
        for (const depId of rule.dependencies) {
          const depRule = this.rules.get(depId)
          if (depRule && rules.includes(depRule)) {
            visit(depRule)
          }
        }
      }

      visiting.delete(rule.id)
      visited.add(rule.id)
      resolved.push(rule)
    }

    for (const rule of rules) {
      if (!visited.has(rule.id)) {
        visit(rule)
      }
    }

    return resolved
  }
}

/**
 * グローバルビジネスルールレジストリインスタンス
 */
export const businessRuleRegistry = new BusinessRuleRegistry()

/**
 * 便利関数: ルール登録ヘルパー
 */
export function createRule(
  id: string,
  name: string,
  description: string,
  category: BusinessRule['category'],
  contexts: string[],
  implementation: BusinessRule['implementation'],
  options?: {
    severity?: BusinessRule['severity']
    dependencies?: string[]
    active?: boolean
  }
): BusinessRule {
  const now = new Date()
  return {
    id,
    name,
    description,
    category,
    contexts,
    implementation,
    severity: options?.severity || 'error',
    dependencies: options?.dependencies,
    active: options?.active ?? true,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * 便利関数: シンプルなバリデーションルール作成
 */
export function createValidationRule(
  id: string,
  name: string,
  contexts: string[],
  validator: (data: any) => boolean,
  errorMessage: string
): BusinessRule {
  return createRule(id, name, `${name}のバリデーション`, 'validation', contexts, ({ data }) => ({
    valid: validator(data),
    message: validator(data) ? undefined : errorMessage,
  }))
}
