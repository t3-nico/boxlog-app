/**
 * データベースクエリ最適化
 */

import { SmartFolder } from '../../types'

export class QueryOptimizer {
  private static queryStats: Map<
    string,
    {
      count: number
      totalTime: number
      avgTime: number
      lastUsed: Date
    }
  > = new Map()

  /**
   * クエリの実行と統計収集
   */
  static async executeQuery<T>(queryId: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await queryFn()
      const executionTime = performance.now() - startTime

      this.recordQueryStats(queryId, executionTime)

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      this.recordQueryStats(`${queryId}_error`, executionTime)
      throw error
    }
  }

  /**
   * スロークエリの検出
   */
  static getSlowQueries(threshold: number = 1000): Array<{
    queryId: string
    avgTime: number
    count: number
  }> {
    return Array.from(this.queryStats.entries())
      .filter(([_, stats]) => stats.avgTime > threshold)
      .map(([queryId, stats]) => ({
        queryId,
        avgTime: stats.avgTime,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
  }

  /**
   * インデックス最適化の提案
   */
  static suggestIndexes(folder: SmartFolder): string[] {
    const suggestions: string[] = []

    // よく使用されるフィールドのインデックスを提案
    for (const rule of folder.rules) {
      switch (rule.field) {
        case 'created_date':
        case 'updated_date':
        case 'due_date':
          suggestions.push(`CREATE INDEX idx_${rule.field} ON tasks(${rule.field})`)
          break
        case 'status':
        case 'priority':
          suggestions.push(`CREATE INDEX idx_${rule.field} ON tasks(${rule.field})`)
          break
        case 'tag':
          suggestions.push(`CREATE INDEX idx_tags ON tasks USING GIN(tags)`)
          break
      }
    }

    // 複合インデックスの提案
    if (folder.rules.length > 1) {
      const fields = folder.rules.map((r) => r.field).slice(0, 3) // 最大3フィールド
      suggestions.push(`CREATE INDEX idx_composite ON tasks(${fields.join(', ')})`)
    }

    return Array.from(new Set(suggestions)) // 重複を除去
  }

  /**
   * クエリ統計の記録
   */
  private static recordQueryStats(queryId: string, executionTime: number) {
    const stats = this.queryStats.get(queryId) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      lastUsed: new Date(),
    }

    stats.count++
    stats.totalTime += executionTime
    stats.avgTime = stats.totalTime / stats.count
    stats.lastUsed = new Date()

    this.queryStats.set(queryId, stats)
  }
}
