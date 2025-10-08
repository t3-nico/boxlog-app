// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * 📋 Breaking Changes Manager
 *
 * 破壊的変更の管理・記録・通知システム
 * - 変更記録管理・マイグレーション計画・通知送信
 */

import fs from 'fs'

import type {
  AffectedGroup,
  BreakingChange,
  BreakingChangeSummary,
  ChangeImpactAnalysis,
  ImpactLevel,
  MigrationPlan,
} from './types'

/**
 * 🎯 Breaking Change 管理クラス
 */
export class BreakingChangeManager {
  private changesFilePath: string
  private changes: BreakingChange[] = []

  constructor(changesFilePath: string = './BREAKING_CHANGES.md') {
    this.changesFilePath = changesFilePath
    this.loadChanges()
  }

  /**
   * 📊 破壊的変更の追加
   */
  addBreakingChange(change: Omit<BreakingChange, 'id' | 'metadata'>): BreakingChange {
    const id = this.generateChangeId(change.version, change.title)
    const timestamp = new Date().toISOString()

    const newChange: BreakingChange = {
      ...change,
      id,
      metadata: {
        author: 'Claude Code Development Team',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    }

    this.changes.push(newChange)
    this.saveChanges()

    return newChange
  }

  /**
   * 🔍 破壊的変更の検索
   */
  findChanges(
    query: {
      version?: string
      impact?: ImpactLevel[]
      affectedGroups?: AffectedGroup[]
      keywords?: string[]
    } = {}
  ): BreakingChange[] {
    return this.changes.filter((change) => {
      // バージョンフィルター
      if (query.version && change.version !== query.version) {
        return false
      }

      // 影響度フィルター
      if (query.impact && !query.impact.includes(change.impact)) {
        return false
      }

      // 対象グループフィルター
      if (query.affectedGroups) {
        const hasMatchingGroup = change.affectedGroups.some((group) => query.affectedGroups!.includes(group))
        if (!hasMatchingGroup) {
          return false
        }
      }

      // キーワード検索
      if (query.keywords && query.keywords.length > 0) {
        const searchText = `${change.title} ${change.description} ${change.reason}`.toLowerCase()
        const hasKeyword = query.keywords.some((keyword) => searchText.includes(keyword.toLowerCase()))
        if (!hasKeyword) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 📊 バージョン別サマリー生成
   */
  generateVersionSummary(version: string): BreakingChangeSummary {
    const versionChanges = this.changes.filter((change) => change.version === version)

    const byImpact: Record<ImpactLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }

    const byType: Record<string, number> = {}
    const byAffectedGroup: Record<string, number> = {}

    let requiredMigrations = 0
    let totalMigrationTime = 0

    versionChanges.forEach((change) => {
      // 影響度別カウント
      byImpact[change.impact]++

      // タイプ別カウント
      byType[change.type] = (byType[change.type] || 0) + 1

      // 対象グループ別カウント
      change.affectedGroups.forEach((group) => {
        byAffectedGroup[group] = (byAffectedGroup[group] || 0) + 1
      })

      // マイグレーション情報
      if (change.migration.required) {
        requiredMigrations++
      }
      totalMigrationTime += change.migration.estimatedTime || 0
    })

    return {
      version,
      releaseDate: versionChanges[0]?.releaseDate || '',
      totalChanges: versionChanges.length,
      byImpact,
      byType: byType as any,
      byAffectedGroup: byAffectedGroup as any,
      requiredMigrations,
      totalMigrationTime,
    }
  }

  /**
   * 🎯 変更影響分析
   */
  analyzeChangeImpact(changeId: string): ChangeImpactAnalysis | null {
    const change = this.changes.find((c) => c.id === changeId)
    if (!change) {
      return null
    }

    // 影響評価の生成
    const groupImpacts: Record<
      AffectedGroup,
      {
        impact: ImpactLevel
        details: string[]
        mitigation?: string[]
      }
    > = {} as any

    change.affectedGroups.forEach((group) => {
      groupImpacts[group] = {
        impact: this.calculateGroupSpecificImpact(change, group),
        details: this.getGroupSpecificDetails(change, group),
        mitigation: this.getGroupSpecificMitigation(change, group),
      }
    })

    // リスク評価
    const riskLevel = this.calculateRiskLevel(change)
    const risks = this.identifyRisks(change)
    const mitigation = this.suggestRiskMitigation(change)

    // 推奨アクション
    const priority = this.calculateActionPriority(change)
    const actions = this.generateRecommendedActions(change)

    return {
      change,
      assessment: {
        overallImpact: change.impact,
        groupImpacts,
      },
      risks: {
        level: riskLevel,
        details: risks,
        mitigation,
      },
      recommendations: {
        priority,
        actions,
        deadline: this.calculateDeadline(change),
      },
    }
  }

  /**
   * 📋 マイグレーション計画生成
   */
  createMigrationPlan(
    version: string,
    options: {
      targetGroups?: AffectedGroup[]
      timeConstraints?: {
        startDate?: string
        endDate?: string
      }
    } = {}
  ): MigrationPlan {
    const relevantChanges = this.changes.filter(
      (change) =>
        change.version === version &&
        (!options.targetGroups || change.affectedGroups.some((group) => options.targetGroups!.includes(group)))
    )

    const planId = this.generatePlanId(version)
    const totalSteps = relevantChanges.reduce((sum, change) => sum + change.migration.steps.length, 0)

    const checklist = relevantChanges.flatMap((change) =>
      change.migration.steps.map((step) => ({
        item: `${change.title}: ${step.title}`,
        completed: false,
        assignee: undefined,
        dueDate: undefined,
      }))
    )

    return {
      id: planId,
      changes: relevantChanges,
      schedule: {
        startDate: options.timeConstraints?.startDate || this.getDefaultStartDate(),
        endDate: options.timeConstraints?.endDate || this.calculateEndDate(relevantChanges),
        phases: this.createMigrationPhases(relevantChanges),
      },
      assignees: [],
      status: 'planned',
      progress: 0,
      checklist,
    }
  }

  /**
   * 📄 Markdownドキュメント生成
   */
  generateMarkdownDocument(): string {
    const sortedChanges = this.changes.sort(
      (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )

    let markdown = `# 🚨 BoxLog Breaking Changes

このドキュメントは、BoxLogアプリケーションの破壊的変更（Breaking Changes）の記録です。
アップグレード時の影響評価とマイグレーション計画の参考にしてください。

## 📋 記録フォーマット

各破壊的変更には以下の情報を含めています：

- **変更内容**: 何が変更されたか
- **影響範囲**: 誰・何に影響するか
- **マイグレーション**: 対応方法・手順
- **理由**: なぜ変更が必要だったか
- **回避方法**: 可能な場合の代替手段

---

`

    // バージョンごとにグループ化
    const versionGroups = this.groupChangesByVersion(sortedChanges)

    Object.entries(versionGroups).forEach(([version, changes]) => {
      const summary = this.generateVersionSummary(version)

      markdown += `## ${version} (${changes[0].releaseDate})\n\n`

      if (changes.length > 1) {
        markdown += `### 📊 概要\n\n`
        markdown += `- **変更総数**: ${summary.totalChanges}\n`
        markdown += `- **必須マイグレーション**: ${summary.requiredMigrations}件\n`
        markdown += `- **推定作業時間**: ${Math.round(summary.totalMigrationTime / 60)}時間\n`
        markdown += `- **影響度別**: `

        Object.entries(summary.byImpact)
          .filter(([, count]) => count > 0)
          .forEach(([level, count]) => {
            const emoji = this.getImpactEmoji(level as ImpactLevel)
            markdown += `${emoji}${level}:${count} `
          })

        markdown += `\n\n`
      }

      changes.forEach((change) => {
        markdown += `### ${this.getChangeEmoji(change.type)} ${change.title}\n\n`
        markdown += `**変更内容:**\n${change.description}\n\n`

        // 影響範囲
        markdown += `**影響範囲:**\n`
        change.affectedGroups.forEach((group) => {
          const emoji = this.getGroupEmoji(group)
          markdown += `- ${emoji} **${this.getGroupDisplayName(group)}**: 影響あり\n`
        })
        markdown += `\n`

        // マイグレーション
        if (change.migration.steps.length > 0) {
          markdown += `**マイグレーション:**\n`
          if (change.migration.automationScript) {
            markdown += `\`\`\`bash\n# 自動マイグレーション\n${change.migration.automationScript}\n\`\`\`\n\n`
          } else {
            markdown += `\`\`\`bash\n`
            change.migration.steps.forEach((step, index) => {
              markdown += `# ${index + 1}. ${step.title}\n`
              if (step.command) {
                markdown += `${step.command}\n`
              }
            })
            markdown += `\`\`\`\n\n`
          }
        }

        markdown += `**理由:** ${change.reason}\n\n`

        // 回避方法
        if (change.workaround) {
          markdown += `**回避方法:** ${change.workaround.description}\n\n`
        }

        markdown += `---\n\n`
      })
    })

    // フッター情報
    markdown += `
## 📞 サポート

アップグレードでお困りの場合は、[GitHub Issues](https://github.com/t3-nico/boxlog-app/issues)で報告してください。

---

**📝 最終更新**: ${new Date().toISOString().split('T')[0]}
**📋 記録担当**: Claude Code Development Team
`

    return markdown
  }

  /**
   * 💾 変更の保存
   */
  saveChanges(): void {
    const markdown = this.generateMarkdownDocument()
    fs.writeFileSync(this.changesFilePath, markdown, 'utf8')
  }

  /**
   * 📂 変更の読み込み
   */
  private loadChanges(): void {
    try {
      if (fs.existsSync(this.changesFilePath)) {
        // Markdownファイルからの解析は複雑なため、
        // 実際の実装では別途JSONファイルでの管理も考慮
        this.changes = []
      }
    } catch (error) {
      console.warn('Failed to load existing breaking changes:', error)
      this.changes = []
    }
  }

  /**
   * 🆔 変更IDの生成
   */
  private generateChangeId(version: string, title: string): string {
    const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `${version}-${sanitized}`.substring(0, 50)
  }

  /**
   * 🆔 プランIDの生成
   */
  private generatePlanId(version: string): string {
    return `migration-plan-${version}-${Date.now()}`
  }

  /**
   * 📊 グループ固有の影響度計算
   */
  private calculateGroupSpecificImpact(change: BreakingChange, group: AffectedGroup): ImpactLevel {
    // グループごとの影響度調整ロジック
    if (group === 'end_users' && change.type === 'api_change') {
      return 'low' // エンドユーザーはAPI変更の影響は間接的
    }
    if (group === 'api_consumers' && change.type === 'api_change') {
      return 'critical' // API利用者は直接的な影響
    }
    return change.impact
  }

  /**
   * 📋 グループ固有の詳細取得
   */
  private getGroupSpecificDetails(change: BreakingChange, group: AffectedGroup): string[] {
    const details: string[] = []

    switch (group) {
      case 'developers':
        details.push('コード修正が必要')
        details.push('ビルド・テストの確認が必要')
        break
      case 'devops':
        details.push('デプロイメント設定の更新が必要')
        details.push('監視・アラート設定の見直しが必要')
        break
      case 'api_consumers':
        details.push('API呼び出し方法の変更が必要')
        details.push('レスポンス処理の更新が必要')
        break
    }

    return details
  }

  /**
   * 🛡️ グループ固有の軽減策取得
   */
  private getGroupSpecificMitigation(change: BreakingChange, group: AffectedGroup): string[] {
    // グループごとの軽減策を返す
    return change.workaround?.steps || []
  }

  /**
   * ⚠️ リスクレベル計算
   */
  private calculateRiskLevel(change: BreakingChange): 'low' | 'medium' | 'high' {
    const impactWeight = { low: 1, medium: 2, high: 3, critical: 4 }[change.impact]
    const groupsCount = change.affectedGroups.length

    if (impactWeight >= 3 || groupsCount >= 4) return 'high'
    if (impactWeight >= 2 || groupsCount >= 2) return 'medium'
    return 'low'
  }

  /**
   * 🎯 リスク特定
   */
  private identifyRisks(change: BreakingChange): string[] {
    const risks: string[] = []

    if (change.impact === 'critical') {
      risks.push('サービス停止の可能性')
    }
    if (change.affectedGroups.includes('end_users')) {
      risks.push('ユーザーエクスペリエンスの低下')
    }
    if (!change.migration.automatable) {
      risks.push('手動作業によるヒューマンエラー')
    }

    return risks
  }

  /**
   * 🛡️ リスク軽減策提案
   */
  private suggestRiskMitigation(change: BreakingChange): string[] {
    return ['段階的ロールアウトの実施', 'バックアップとロールバック計画の準備', '十分なテスト期間の確保']
  }

  /**
   * 📅 アクション優先度計算
   */
  private calculateActionPriority(change: BreakingChange): 'low' | 'medium' | 'high' {
    return change.impact === 'critical' ? 'high' : change.impact === 'high' ? 'medium' : 'low'
  }

  /**
   * 💡 推奨アクション生成
   */
  private generateRecommendedActions(change: BreakingChange): string[] {
    const actions: string[] = []

    actions.push(`${change.title}のマイグレーション計画を作成`)
    actions.push('影響範囲の詳細分析を実施')

    if (change.migration.required) {
      actions.push('必須マイグレーション作業をスケジュール')
    }

    return actions
  }

  /**
   * 📅 期限計算
   */
  private calculateDeadline(change: BreakingChange): string {
    const releaseDate = new Date(change.releaseDate)
    const deadline = new Date(releaseDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30日後
    return deadline.toISOString().split('T')[0]
  }

  /**
   * 🔄 ヘルパーメソッド群
   */
  private groupChangesByVersion(changes: BreakingChange[]): Record<string, BreakingChange[]> {
    return changes.reduce(
      (groups, change) => {
        if (!groups[change.version]) {
          groups[change.version] = []
        }
        groups[change.version].push(change)
        return groups
      },
      {} as Record<string, BreakingChange[]>
    )
  }

  private getDefaultStartDate(): string {
    return new Date().toISOString().split('T')[0]
  }

  private calculateEndDate(changes: BreakingChange[]): string {
    const totalTime = changes.reduce((sum, change) => sum + (change.migration.estimatedTime || 0), 0)
    const days = Math.ceil(totalTime / (8 * 60)) // 8時間/日として計算
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    return endDate.toISOString().split('T')[0]
  }

  private createMigrationPhases(changes: BreakingChange[]) {
    // フェーズ分けのロジック（簡略版）
    return changes.map((change, index) => ({
      phase: index + 1,
      name: `Phase ${index + 1}: ${change.title}`,
      description: change.description,
      changes: [change.id],
      startDate: this.getDefaultStartDate(),
      endDate: this.calculateEndDate([change]),
      successCriteria: [`${change.title}のマイグレーション完了`],
    }))
  }

  private getImpactEmoji(impact: ImpactLevel): string {
    const emojis = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }
    return emojis[impact]
  }

  private getChangeEmoji(type: string): string {
    const emojis = {
      api_change: '🔌',
      config_change: '⚙️',
      database_change: '🗄️',
      dependency_change: '📦',
      interface_change: '🎨',
      auth_change: '🔐',
      behavior_change: '🔄',
      removal: '🗑️',
    }
    return emojis[type] || '🔧'
  }

  private getGroupEmoji(group: AffectedGroup): string {
    const emojis = {
      end_users: '👥',
      developers: '💻',
      api_consumers: '🔌',
      devops: '🚀',
      administrators: '👮',
      external_systems: '🌐',
    }
    return emojis[group] || '👤'
  }

  private getGroupDisplayName(group: AffectedGroup): string {
    const names = {
      end_users: 'エンドユーザー',
      developers: '開発者',
      api_consumers: 'API利用者',
      devops: 'DevOps・運用担当',
      administrators: 'システム管理者',
      external_systems: '外部システム連携',
    }
    return names[group] || group
  }
}

/**
 * 🌍 グローバル管理インスタンス
 */
export const breakingChangeManager = new BreakingChangeManager()

/**
 * 🔧 便利関数
 */
export const addBreakingChange = (change: Parameters<BreakingChangeManager['addBreakingChange']>[0]) =>
  breakingChangeManager.addBreakingChange(change)

export const findBreakingChanges = (query: Parameters<BreakingChangeManager['findChanges']>[0]) =>
  breakingChangeManager.findChanges(query)

export const generateVersionSummary = (version: string) => breakingChangeManager.generateVersionSummary(version)

export const createMigrationPlan = (
  version: string,
  options?: Parameters<BreakingChangeManager['createMigrationPlan']>[1]
) => breakingChangeManager.createMigrationPlan(version, options)

export default BreakingChangeManager
