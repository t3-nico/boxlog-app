/**
 * 📋 Breaking Changes Manager - コアクラス
 */

import fs from 'fs'

import type {
  AffectedGroup,
  BreakingChange,
  BreakingChangeSummary,
  ChangeImpactAnalysis,
  ImpactLevel,
  MigrationPlan,
} from '../types'

import { analyzeChangeImpact } from './analysis'
import { generateChangeId } from './helpers'
import { generateMarkdownDocument } from './markdown'
import { createMigrationPlan as createPlan } from './migration'

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
    const id = generateChangeId(change.version, change.title)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 動的に構築されるオブジェクト
      byType: byType as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 動的に構築されるオブジェクト
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

    return analyzeChangeImpact(change)
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
    return createPlan(this.changes, version, options)
  }

  /**
   * 📄 Markdownドキュメント生成
   */
  generateMarkdownDocument(): string {
    return generateMarkdownDocument(this.changes, this.generateVersionSummary.bind(this))
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
}
