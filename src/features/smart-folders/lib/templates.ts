// スマートフォルダテンプレートシステム

import { CreateSmartFolderInput, SmartFolderRule } from '@/types/smart-folders'

// テンプレートカテゴリ
export enum TemplateCategory {
  PRODUCTIVITY = 'productivity',
  TIME_MANAGEMENT = 'time_management',
  PROJECT_MANAGEMENT = 'project_management',
  PERSONAL = 'personal',
  CUSTOM = 'custom',
}

// テンプレート定義
export interface SmartFolderTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  icon: string
  color: string
  rules: SmartFolderRule[]
  isBuiltIn: boolean
  usageCount?: number
  tags: string[]
  createdAt?: Date
  updatedAt?: Date
}

// プリセットテンプレート
export const BUILT_IN_TEMPLATES: SmartFolderTemplate[] = [
  // 生産性テンプレート
  {
    id: 'urgent-important',
    name: 'Urgent & Important',
    description: 'High priority tasks that require immediate attention',
    category: TemplateCategory.PRODUCTIVITY,
    icon: '🔥',
    color: '#EF4444',
    isBuiltIn: true,
    tags: ['urgent', 'priority', 'eisenhower'],
    rules: [
      {
        field: 'priority',
        operator: 'greater_equal',
        value: 'high',
        logic: 'AND',
      },
      {
        field: 'due_date',
        operator: 'less_equal',
        value: '3days',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'today-focus',
    name: "Today's Focus",
    description: 'Tasks due today or marked for today',
    category: TemplateCategory.TIME_MANAGEMENT,
    icon: '🎯',
    color: '#3B82F6',
    isBuiltIn: true,
    tags: ['today', 'focus', 'daily'],
    rules: [
      {
        field: 'due_date',
        operator: 'equals',
        value: new Date().toISOString().split('T')[0],
        logic: 'OR',
      },
      {
        field: 'tag',
        operator: 'contains',
        value: 'today',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'overdue-tasks',
    name: 'Overdue Tasks',
    description: 'Tasks that have passed their due date',
    category: TemplateCategory.TIME_MANAGEMENT,
    icon: '⚠️',
    color: '#DC2626',
    isBuiltIn: true,
    tags: ['overdue', 'late', 'urgent'],
    rules: [
      {
        field: 'due_date',
        operator: 'less_than',
        value: new Date().toISOString(),
        logic: 'AND',
      },
      {
        field: 'status',
        operator: 'not_equals',
        value: 'completed',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'quick-wins',
    name: 'Quick Wins',
    description: 'Low effort, high impact tasks',
    category: TemplateCategory.PRODUCTIVITY,
    icon: '⚡',
    color: '#10B981',
    isBuiltIn: true,
    tags: ['quick', 'easy', 'wins'],
    rules: [
      {
        field: 'tag',
        operator: 'contains',
        value: 'quick',
        logic: 'OR',
      },
      {
        field: 'description',
        operator: 'contains',
        value: '15min',
        logic: 'OR',
      },
      {
        field: 'title',
        operator: 'contains',
        value: 'quick',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'waiting-for',
    name: 'Waiting For',
    description: 'Tasks waiting for external input or response',
    category: TemplateCategory.PROJECT_MANAGEMENT,
    icon: '⏳',
    color: '#F59E0B',
    isBuiltIn: true,
    tags: ['waiting', 'blocked', 'external'],
    rules: [
      {
        field: 'status',
        operator: 'equals',
        value: 'waiting',
        logic: 'OR',
      },
      {
        field: 'tag',
        operator: 'contains',
        value: 'waiting',
        logic: 'OR',
      },
      {
        field: 'tag',
        operator: 'contains',
        value: 'blocked',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'this-week',
    name: 'This Week',
    description: 'Tasks scheduled for this week',
    category: TemplateCategory.TIME_MANAGEMENT,
    icon: '📅',
    color: '#8B5CF6',
    isBuiltIn: true,
    tags: ['week', 'schedule', 'upcoming'],
    rules: [
      {
        field: 'due_date',
        operator: 'greater_equal',
        value: new Date().toISOString(),
        logic: 'AND',
      },
      {
        field: 'due_date',
        operator: 'less_equal',
        value: '7days',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'favorites',
    name: 'Favorites',
    description: 'Tasks marked as favorites or starred',
    category: TemplateCategory.PERSONAL,
    icon: '⭐',
    color: '#F59E0B',
    isBuiltIn: true,
    tags: ['favorites', 'starred', 'important'],
    rules: [
      {
        field: 'is_favorite',
        operator: 'equals',
        value: true,
        logic: 'AND',
      },
    ],
  },

  {
    id: 'recent-activity',
    name: 'Recent Activity',
    description: 'Tasks updated in the last 3 days',
    category: TemplateCategory.PRODUCTIVITY,
    icon: '🔄',
    color: '#06B6D4',
    isBuiltIn: true,
    tags: ['recent', 'activity', 'updated'],
    rules: [
      {
        field: 'updated_date',
        operator: 'greater_than',
        value: '3days',
        logic: 'AND',
      },
    ],
  },

  {
    id: 'no-due-date',
    name: 'No Due Date',
    description: 'Tasks without a specific due date',
    category: TemplateCategory.PROJECT_MANAGEMENT,
    icon: '📋',
    color: '#6B7280',
    isBuiltIn: true,
    tags: ['someday', 'backlog', 'no-date'],
    rules: [
      {
        field: 'due_date',
        operator: 'is_empty',
        value: null,
        logic: 'AND',
      },
    ],
  },

  {
    id: 'work-tasks',
    name: 'Work Tasks',
    description: 'All work-related tasks',
    category: TemplateCategory.PROJECT_MANAGEMENT,
    icon: '💼',
    color: '#1F2937',
    isBuiltIn: true,
    tags: ['work', 'professional', 'business'],
    rules: [
      {
        field: 'tag',
        operator: 'contains',
        value: 'work',
        logic: 'OR',
      },
      {
        field: 'tag',
        operator: 'contains',
        value: 'business',
        logic: 'OR',
      },
      {
        field: 'tag',
        operator: 'contains',
        value: 'office',
        logic: 'AND',
      },
    ],
  },
]

// テンプレートマネージャー
export class TemplateManager {
  private static templates: Map<string, SmartFolderTemplate> = new Map()
  private static initialized = false

  /**
   * テンプレートシステムの初期化
   */
  static initialize() {
    if (this.initialized) return

    // ビルトインテンプレートを読み込み
    BUILT_IN_TEMPLATES.forEach((template) => {
      this.templates.set(template.id, template)
    })

    // ローカルストレージからカスタムテンプレートを読み込み
    this.loadCustomTemplates()

    this.initialized = true
  }

  /**
   * 全テンプレートの取得
   */
  static getAllTemplates(): SmartFolderTemplate[] {
    this.initialize()
    return Array.from(this.templates.values())
  }

  /**
   * カテゴリ別テンプレート取得
   */
  static getTemplatesByCategory(category: TemplateCategory): SmartFolderTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category)
  }

  /**
   * 人気テンプレートの取得
   */
  static getPopularTemplates(limit: number = 5): SmartFolderTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit)
  }

  /**
   * テンプレート検索
   */
  static searchTemplates(query: string): SmartFolderTemplate[] {
    const searchTerm = query.toLowerCase()
    return this.getAllTemplates().filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * テンプレートから スマートフォルダ作成
   */
  static createFolderFromTemplate(templateId: string, customName?: string): CreateSmartFolderInput | null {
    const template = this.templates.get(templateId)
    if (!template) return null

    // 使用回数をインクリメント
    this.incrementUsageCount(templateId)

    return {
      name: customName || template.name,
      description: template.description,
      rules: template.rules,
      icon: template.icon,
      color: template.color,
    }
  }

  /**
   * カスタムテンプレートの保存
   */
  static saveCustomTemplate(template: Omit<SmartFolderTemplate, 'id' | 'isBuiltIn'>): string {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const customTemplate: SmartFolderTemplate = {
      ...template,
      id,
      isBuiltIn: false,
      category: template.category || TemplateCategory.CUSTOM,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.templates.set(id, customTemplate)
    this.saveCustomTemplates()

    return id
  }

  /**
   * テンプレートの削除
   */
  static deleteTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId)
    if (!template || template.isBuiltIn) return false

    this.templates.delete(templateId)
    this.saveCustomTemplates()
    return true
  }

  /**
   * テンプレートの更新
   */
  static updateTemplate(templateId: string, updates: Partial<SmartFolderTemplate>): boolean {
    const template = this.templates.get(templateId)
    if (!template || template.isBuiltIn) return false

    const updatedTemplate = {
      ...template,
      ...updates,
      id: templateId, // IDは変更不可
      isBuiltIn: false, // カスタムテンプレートのまま
      updatedAt: new Date(),
    }

    this.templates.set(templateId, updatedTemplate)
    this.saveCustomTemplates()
    return true
  }

  /**
   * テンプレートのエクスポート
   */
  static exportTemplate(templateId: string): string | null {
    const template = this.templates.get(templateId)
    if (!template) return null

    const exportData = {
      ...template,
      id: undefined, // エクスポート時はIDを除外
      usageCount: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * テンプレートのインポート
   */
  static importTemplate(templateJson: string): string | null {
    try {
      const templateData = JSON.parse(templateJson)

      // 基本検証
      if (!templateData.name || !templateData.rules || !Array.isArray(templateData.rules)) {
        throw new Error('Invalid template format')
      }

      return this.saveCustomTemplate(templateData)
    } catch (error) {
      console.error('Template import error:', error)
      return null
    }
  }

  /**
   * 使用回数のインクリメント
   */
  private static incrementUsageCount(templateId: string) {
    const template = this.templates.get(templateId)
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1
      if (!template.isBuiltIn) {
        this.saveCustomTemplates()
      }
    }
  }

  /**
   * カスタムテンプレートの保存
   */
  private static saveCustomTemplates() {
    const customTemplates = Array.from(this.templates.values()).filter((t) => !t.isBuiltIn)

    try {
      localStorage.setItem('smart-folder-custom-templates', JSON.stringify(customTemplates))
    } catch (error) {
      console.error('Failed to save custom templates:', error)
    }
  }

  /**
   * カスタムテンプレートの読み込み
   */
  private static loadCustomTemplates() {
    try {
      const stored = localStorage.getItem('smart-folder-custom-templates')
      if (stored) {
        const customTemplates: SmartFolderTemplate[] = JSON.parse(stored)
        customTemplates.forEach((template) => {
          this.templates.set(template.id, template)
        })
      }
    } catch (error) {
      console.error('Failed to load custom templates:', error)
    }
  }
}

// テンプレート適用のユーティリティ
export class TemplateApplicator {
  /**
   * ルールのパラメータ化（動的値の設定）
   */
  static parameterizeRules(rules: SmartFolderRule[], parameters: Record<string, unknown>): SmartFolderRule[] {
    return rules.map((rule) => ({
      ...rule,
      value: this.replaceParameters(rule.value, parameters),
    }))
  }

  /**
   * パラメータ置換
   */
  private static replaceParameters(value: unknown, parameters: Record<string, unknown>): unknown {
    if (typeof value !== 'string') return value

    // ${parameter} 形式のパラメータを置換
    return value.replace(/\$\{(\w+)\}/g, (match, paramName) => {
      return parameters[paramName] !== undefined ? parameters[paramName] : match
    })
  }

  /**
   * 相対日付の動的更新
   */
  static updateRelativeDates(rules: SmartFolderRule[]): SmartFolderRule[] {
    const now = new Date()

    return rules.map((rule) => {
      if (rule.field.includes('date') && typeof rule.value === 'string') {
        // 今日の日付に置換
        if (rule.value === 'today') {
          return { ...rule, value: now.toISOString().split('T')[0] }
        }

        // 相対日付はそのまま（エンジンで処理される）
        if (/^\d+\w+$/.test(rule.value)) {
          return rule
        }
      }

      return rule
    })
  }
}

// テンプレート使用統計
export interface TemplateUsageStats {
  templateId: string
  templateName: string
  usageCount: number
  lastUsed: Date
  averageRating?: number
  category: TemplateCategory
}

export class TemplateAnalytics {
  /**
   * 使用統計の取得
   */
  static getUsageStats(): TemplateUsageStats[] {
    const templates = TemplateManager.getAllTemplates()

    return templates
      .map((template) => ({
        templateId: template.id,
        templateName: template.name,
        usageCount: template.usageCount || 0,
        lastUsed: template.updatedAt || template.createdAt || new Date(),
        category: template.category,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  /**
   * 推奨テンプレートの生成
   */
  static getRecommendedTemplates(_userBehavior: Record<string, unknown>): SmartFolderTemplate[] {
    // ユーザーの行動パターンに基づいて推奨テンプレートを選択
    // ここでは簡単な実装
    return TemplateManager.getPopularTemplates(3)
  }
}
