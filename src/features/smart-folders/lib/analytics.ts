// スマートフォルダアナリティクスシステム

import { SmartFolder, SmartFolderRule } from '@/types/smart-folders'

// アナリティクスイベント
export interface AnalyticsEvent {
  type: 'folder_created' | 'folder_updated' | 'folder_deleted' | 'folder_accessed' | 'rule_executed' | 'item_matched'
  folderId?: string
  folderName?: string
  userId: string
  timestamp: Date
  metadata?: Record<string, unknown>
  duration?: number
  itemCount?: number
  matchCount?: number
}

// フォルダ使用統計
export interface FolderUsageStats {
  folderId: string
  folderName: string
  totalAccesses: number
  uniqueUsers: number
  averageMatchCount: number
  averageExecutionTime: number
  lastAccessed: Date
  createdAt: Date
  efficiency: number // マッチ率
  popularity: number // アクセス頻度
  complexity: number // ルールの複雑さ
  trend: 'increasing' | 'decreasing' | 'stable'
}

// ルール効率性分析
export interface RuleEfficiencyAnalysis {
  ruleId: string
  field: string
  operator: string
  executionCount: number
  averageExecutionTime: number
  selectivity: number // 結果の絞り込み効果
  costBenefit: number // コストパフォーマンス
  optimizationSuggestions: string[]
}

// ユーザー行動分析
export interface UserBehaviorAnalysis {
  userId: string
  favoriteCategories: string[]
  averageRulesPerFolder: number
  preferredOperators: string[]
  activityPattern: {
    hourly: number[]
    daily: number[]
    weekly: number[]
  }
  folderLifecycle: {
    averageLifespan: number
    abandonmentRate: number
    modificationFrequency: number
  }
}

// アナリティクスマネージャー
export class SmartFolderAnalytics {
  private static events: AnalyticsEvent[] = []
  private static maxEvents = 10000

  /**
   * イベントの記録
   */
  static trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>) {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    }

    this.events.push(fullEvent)

    // 古いイベントを削除
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents)
    }

    // リアルタイム分析の実行
    this.processRealtimeAnalytics(fullEvent)
  }

  /**
   * フォルダ使用統計の生成
   */
  static generateFolderUsageStats(timeRange?: { from: Date; to: Date }): FolderUsageStats[] {
    const filteredEvents = this.filterEventsByTimeRange(this.events, timeRange)
    const folderGroups = this.groupEventsByFolder(filteredEvents)

    return Array.from(folderGroups.entries())
      .map(([folderId, events]) => {
        const accessEvents = events.filter((e) => e.type === 'folder_accessed')
        const matchEvents = events.filter((e) => e.type === 'item_matched')

        const totalAccesses = accessEvents.length
        const uniqueUsers = new Set(accessEvents.map((e) => e.userId)).size
        const averageMatchCount = this.calculateAverage(matchEvents.map((e) => e.matchCount || 0))
        const averageExecutionTime = this.calculateAverage(events.map((e) => e.duration || 0))
        const lastAccessed = Math.max(...accessEvents.map((e) => e.timestamp.getTime()))

        return {
          folderId,
          folderName: events[0]?.folderName || '',
          totalAccesses,
          uniqueUsers,
          averageMatchCount,
          averageExecutionTime,
          lastAccessed: new Date(lastAccessed),
          createdAt: new Date(Math.min(...events.map((e) => e.timestamp.getTime()))),
          efficiency: this.calculateEfficiency(matchEvents),
          popularity: this.calculatePopularity(accessEvents, timeRange),
          complexity: this.calculateComplexity(folderId),
          trend: this.calculateTrend(accessEvents),
        }
      })
      .sort((a, b) => b.totalAccesses - a.totalAccesses)
  }

  /**
   * ルール効率性分析
   */
  static analyzeRuleEfficiency(folder: SmartFolder): RuleEfficiencyAnalysis[] {
    return folder.rules.map((rule, index) => {
      const ruleEvents = this.events.filter(
        (e) => e.folderId === folder.id && e.type === 'rule_executed' && e.metadata?.ruleIndex === index
      )

      const executionCount = ruleEvents.length
      const averageExecutionTime = this.calculateAverage(ruleEvents.map((e) => e.duration || 0))

      const selectivity = this.calculateSelectivity(rule, ruleEvents)
      const costBenefit = this.calculateCostBenefit(rule, averageExecutionTime, selectivity)

      return {
        ruleId: `${folder.id}-${index}`,
        field: rule.field,
        operator: rule.operator,
        executionCount,
        averageExecutionTime,
        selectivity,
        costBenefit,
        optimizationSuggestions: this.generateRuleOptimizationSuggestions(rule, {
          executionTime: averageExecutionTime,
          selectivity,
          costBenefit,
        }),
      }
    })
  }

  /**
   * ユーザー行動分析
   */
  static analyzeUserBehavior(userId: string): UserBehaviorAnalysis {
    const userEvents = this.events.filter((e) => e.userId === userId)

    return {
      userId,
      favoriteCategories: this.identifyFavoriteCategories(userEvents),
      averageRulesPerFolder: this.calculateAverageRulesPerFolder(userEvents),
      preferredOperators: this.identifyPreferredOperators(userEvents),
      activityPattern: this.analyzeActivityPattern(userEvents),
      folderLifecycle: this.analyzeFolderLifecycle(userEvents),
    }
  }

  /**
   * 最適化提案の生成
   */
  static generateOptimizationSuggestions(folder: SmartFolder): {
    type: 'performance' | 'usability' | 'efficiency'
    priority: 'high' | 'medium' | 'low'
    suggestion: string
    expectedImpact: string
    implementation: string
  }[] {
    const suggestions: {
      type: 'efficiency' | 'performance' | 'usability'
      priority: 'low' | 'medium' | 'high'
      suggestion: string
      expectedImpact: string
      implementation: string
    }[] = []
    const stats = this.generateFolderUsageStats().find((s) => s.folderId === folder.id)
    const ruleAnalysis = this.analyzeRuleEfficiency(folder)

    // パフォーマンス最適化
    if (stats && stats.averageExecutionTime > 1000) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        suggestion: 'Optimize slow-executing rules',
        expectedImpact: 'Reduce execution time by 40-60%',
        implementation: 'Reorder rules by selectivity, add indexes for date/status fields',
      })
    }

    // 効率性改善
    if (stats && stats.efficiency < 0.1) {
      suggestions.push({
        type: 'efficiency',
        priority: 'medium',
        suggestion: 'Improve rule selectivity',
        expectedImpact: 'Increase match accuracy by 20-30%',
        implementation: 'Refine rule conditions, add more specific criteria',
      })
    }

    // 使いやすさ改善
    if (folder.rules.length > 5) {
      suggestions.push({
        type: 'usability',
        priority: 'low',
        suggestion: 'Simplify complex rule set',
        expectedImpact: 'Improve maintainability and performance',
        implementation: 'Group related rules, use rule templates',
      })
    }

    // ルール固有の最適化
    ruleAnalysis.forEach((analysis) => {
      if (analysis.costBenefit < 0.5) {
        suggestions.push({
          type: 'efficiency',
          priority: 'medium',
          suggestion: `Optimize ${analysis.field} rule with ${analysis.operator} operator`,
          expectedImpact: 'Improve cost-benefit ratio',
          implementation: analysis.optimizationSuggestions.join(', '),
        })
      }
    })

    return suggestions
  }

  /**
   * 自動最適化の実行
   */
  static async executeAutoOptimization(folder: SmartFolder): Promise<{
    optimized: boolean
    changes: string[]
    newRules?: SmartFolderRule[]
  }> {
    const suggestions = this.generateOptimizationSuggestions(folder)
    const highPrioritySuggestions = suggestions.filter((s) => s.priority === 'high')

    if (highPrioritySuggestions.length === 0) {
      return { optimized: false, changes: [] }
    }

    const changes: string[] = []
    let newRules = [...folder.rules]

    // ルールの並び替え（選択性による）
    const ruleAnalysis = this.analyzeRuleEfficiency(folder)
    newRules = newRules.sort((a, b) => {
      const analysisA = ruleAnalysis.find((r) => r.field === a.field && r.operator === a.operator)
      const analysisB = ruleAnalysis.find((r) => r.field === b.field && r.operator === b.operator)

      return (analysisB?.selectivity || 0) - (analysisA?.selectivity || 0)
    })
    changes.push('Reordered rules by selectivity')

    // 非効率なルールの除去
    const inefficientRules = ruleAnalysis.filter((r) => r.costBenefit < 0.3)
    if (inefficientRules.length > 0 && newRules.length > 2) {
      // 最も非効率なルールを1つだけ除去（安全のため）
      const worstRule = inefficientRules.sort((a, b) => a.costBenefit - b.costBenefit)[0]
      if (worstRule) {
        newRules = newRules.filter((r) => !(r.field === worstRule.field && r.operator === worstRule.operator))
        changes.push(`Removed inefficient rule: ${worstRule.field} ${worstRule.operator}`)
      }
    }

    return {
      optimized: changes.length > 0,
      changes,
      ...(changes.length > 0 && { newRules }),
    }
  }

  /**
   * リアルタイム分析処理
   */
  private static processRealtimeAnalytics(event: AnalyticsEvent) {
    // 異常検知
    if (event.type === 'rule_executed' && event.duration && event.duration > 5000) {
      console.warn(`Slow rule execution detected: ${event.duration}ms for folder ${event.folderId}`)
    }

    // 効率性アラート
    if (event.type === 'item_matched' && event.matchCount === 0) {
      // マッチ数が0の場合はルールが厳しすぎる可能性
      this.trackPotentialIssue(event.folderId!, 'no_matches')
    }
  }

  /**
   * 潜在的問題の追跡
   */
  private static issueTracking: Map<string, { type: string; count: number; lastSeen: Date }> = new Map()

  private static trackPotentialIssue(folderId: string, issueType: string) {
    const key = `${folderId}-${issueType}`
    const existing = this.issueTracking.get(key)

    if (existing) {
      existing.count++
      existing.lastSeen = new Date()
    } else {
      this.issueTracking.set(key, {
        type: issueType,
        count: 1,
        lastSeen: new Date(),
      })
    }

    // 閾値を超えた場合は警告
    const issue = this.issueTracking.get(key)!
    if (issue.count >= 5) {
      console.warn(`Potential issue detected: ${issueType} for folder ${folderId} (${issue.count} times)`)
    }
  }

  // ユーティリティメソッド
  private static filterEventsByTimeRange(events: AnalyticsEvent[], timeRange?: { from: Date; to: Date }) {
    if (!timeRange) return events

    return events.filter((e) => e.timestamp >= timeRange.from && e.timestamp <= timeRange.to)
  }

  private static groupEventsByFolder(events: AnalyticsEvent[]) {
    const groups = new Map<string, AnalyticsEvent[]>()

    events.forEach((event) => {
      if (event.folderId) {
        if (!groups.has(event.folderId)) {
          groups.set(event.folderId, [])
        }
        groups.get(event.folderId)!.push(event)
      }
    })

    return groups
  }

  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
  }

  private static calculateEfficiency(matchEvents: AnalyticsEvent[]): number {
    if (matchEvents.length === 0) return 0

    const totalItems = matchEvents.reduce((sum, e) => sum + (e.itemCount || 0), 0)
    const totalMatches = matchEvents.reduce((sum, e) => sum + (e.matchCount || 0), 0)

    return totalItems > 0 ? totalMatches / totalItems : 0
  }

  private static calculatePopularity(accessEvents: AnalyticsEvent[], timeRange?: { from: Date; to: Date }): number {
    if (accessEvents.length === 0) return 0

    const days = timeRange ? Math.ceil((timeRange.to.getTime() - timeRange.from.getTime()) / (1000 * 60 * 60 * 24)) : 30

    return accessEvents.length / days
  }

  private static calculateComplexity(__folderId: string): number {
    // フォルダのルール数と演算子の複雑さに基づいて計算
    // 実際の実装では、フォルダ情報にアクセスする必要がある
    return 1 // プレースホルダー
  }

  private static calculateTrend(accessEvents: AnalyticsEvent[]): 'increasing' | 'decreasing' | 'stable' {
    if (accessEvents.length < 10) return 'stable'

    const recent = accessEvents.slice(-7).length
    const previous = accessEvents.slice(-14, -7).length

    if (recent > previous * 1.2) return 'increasing'
    if (recent < previous * 0.8) return 'decreasing'
    return 'stable'
  }

  private static calculateSelectivity(_rule: SmartFolderRule, _ruleEvents: AnalyticsEvent[]): number {
    // ルールの選択性（結果の絞り込み効果）を計算
    // 実際の実装では、実行前後のアイテム数を比較
    return 0.5 // プレースホルダー
  }

  private static calculateCostBenefit(_rule: SmartFolderRule, executionTime: number, selectivity: number): number {
    // コストパフォーマンス = 選択性 / 実行時間
    return executionTime > 0 ? selectivity / (executionTime / 1000) : 0
  }

  private static generateRuleOptimizationSuggestions(
    rule: SmartFolderRule,
    metrics: { executionTime: number; selectivity: number; costBenefit: number }
  ): string[] {
    const suggestions: string[] = []

    if (metrics.executionTime > 1000) {
      suggestions.push('Add database index for this field')
    }

    if (metrics.selectivity < 0.1) {
      suggestions.push('Use more specific criteria')
    }

    if (rule.operator === 'contains' && rule.field === 'description') {
      suggestions.push('Consider using full-text search index')
    }

    return suggestions
  }

  private static identifyFavoriteCategories(_userEvents: AnalyticsEvent[]): string[] {
    // ユーザーの好みのカテゴリを特定
    return [] // プレースホルダー
  }

  private static calculateAverageRulesPerFolder(_userEvents: AnalyticsEvent[]): number {
    // フォルダあたりの平均ルール数
    return 3 // プレースホルダー
  }

  private static identifyPreferredOperators(_userEvents: AnalyticsEvent[]): string[] {
    // よく使用される演算子を特定
    return ['equals', 'contains'] // プレースホルダー
  }

  private static analyzeActivityPattern(_userEvents: AnalyticsEvent[]): UserBehaviorAnalysis['activityPattern'] {
    // アクティビティパターンの分析
    return {
      hourly: new Array(24).fill(0),
      daily: new Array(7).fill(0),
      weekly: new Array(52).fill(0),
    }
  }

  private static analyzeFolderLifecycle(_userEvents: AnalyticsEvent[]): UserBehaviorAnalysis['folderLifecycle'] {
    // フォルダのライフサイクル分析
    return {
      averageLifespan: 30,
      abandonmentRate: 0.1,
      modificationFrequency: 5,
    }
  }

  /**
   * アナリティクスデータのエクスポート
   */
  static exportAnalytics(format: 'json' | 'csv' = 'json'): string {
    const data = {
      folderStats: this.generateFolderUsageStats(),
      events: this.events.slice(-1000), // 最新1000件
      summary: {
        totalEvents: this.events.length,
        uniqueFolders: new Set(this.events.map((e) => e.folderId).filter(Boolean)).size,
        uniqueUsers: new Set(this.events.map((e) => e.userId)).size,
        generatedAt: new Date(),
      },
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    }

    // CSV形式の実装
    return 'CSV export not implemented'
  }

  /**
   * アナリティクスの初期化
   */
  static initialize() {
    // 永続化されたイベントの読み込み
    this.loadPersistedEvents()

    // 定期的なバックアップの設定
    setInterval(() => this.persistEvents(), 5 * 60 * 1000) // 5分毎
  }

  private static loadPersistedEvents() {
    try {
      const stored = localStorage.getItem('smart-folder-analytics')
      if (stored) {
        const data = JSON.parse(stored)
        this.events = data.events || []
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    }
  }

  private static persistEvents() {
    try {
      const data = {
        events: this.events.slice(-5000), // 最新5000件のみ保存
        lastUpdated: new Date(),
      }
      localStorage.setItem('smart-folder-analytics', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to persist analytics data:', error)
    }
  }
}
