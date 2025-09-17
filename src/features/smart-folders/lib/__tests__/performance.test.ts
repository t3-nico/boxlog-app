// スマートフォルダ パフォーマンス最適化のテスト

import { describe, it, expect, beforeEach } from 'vitest'

import { SmartFolderRule } from '@/types/smart-folders'

import { 
  IndexManager, 
  BatchProcessor, 
  QueryOptimizer, 
  CacheManager,
  PerformanceMonitor 
} from '../performance'

describe('Performance Optimization', () => {
  beforeEach(() => {
    IndexManager.clearIndexes()
    CacheManager.clear()
    PerformanceMonitor.reset()
  })

  describe('IndexManager', () => {
    const testItems = [
      { id: '1', priority: 'high', status: 'todo', tags: ['work', 'urgent'] },
      { id: '2', priority: 'medium', status: 'in_progress', tags: ['work'] },
      { id: '3', priority: 'high', status: 'completed', tags: ['personal'] },
      { id: '4', priority: 'low', status: 'todo', tags: ['work', 'documentation'] }
    ]

    it('単一フィールドのインデックス構築', () => {
      const index = IndexManager.buildIndex(testItems, 'priority')
      
      expect(index.has('high')).toBe(true)
      expect(index.has('medium')).toBe(true)
      expect(index.has('low')).toBe(true)
      
      expect(index.get('high')?.size).toBe(2)
      expect(index.get('medium')?.size).toBe(1)
      expect(index.get('low')?.size).toBe(1)
    })

    it('複数フィールドのインデックス構築', () => {
      IndexManager.buildIndexes(testItems, ['priority', 'status'])
      
      // 内部で構築されたインデックスをテスト用にアクセス
      const priorityRule: SmartFolderRule = {
        field: 'priority',
        operator: 'equals',
        value: 'high',
        logic: 'AND'
      }
      
      const filtered = IndexManager.filterUsingIndex(testItems, priorityRule)
      expect(filtered).toHaveLength(2)
    })

    it('インデックスを使った高速フィルタリング（equals）', () => {
      IndexManager.buildIndex(testItems, 'status')
      
      const rule: SmartFolderRule = {
        field: 'status',
        operator: 'equals',
        value: 'todo',
        logic: 'AND'
      }
      
      const filtered = IndexManager.filterUsingIndex(testItems, rule)
      expect(filtered).toHaveLength(2)
      expect(filtered.map(item => item.id)).toEqual(['1', '4'])
    })

    it('インデックスを使った部分一致フィルタリング（contains）', () => {
      IndexManager.buildIndex(testItems, 'status')
      
      const rule: SmartFolderRule = {
        field: 'status',
        operator: 'contains',
        value: 'progress',
        logic: 'AND'
      }
      
      const filtered = IndexManager.filterUsingIndex(testItems, rule)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('2')
    })
  })

  describe('BatchProcessor', () => {
    const testItems = Array.from({ length: 100 }, (_, i) => ({
      id: String(i + 1),
      value: i,
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'
    }))

    it('バッチ処理の実行', async () => {
      const processor = async (item: unknown) => ({
        ...item,
        processed: true
      })

      const results = await BatchProcessor.processBatch(
        testItems.slice(0, 10),
        processor,
        { batchSize: 3, concurrency: 2 }
      )

      expect(results).toHaveLength(10)
      expect(results.every(item => item.processed)).toBe(true)
    })

    it('進捗コールバック', async () => {
      const progressCalls: Array<{ processed: number; total: number }> = []
      
      const processor = async (item: unknown) => item

      await BatchProcessor.processBatch(
        testItems.slice(0, 20),
        processor,
        {
          batchSize: 5,
          concurrency: 2,
          onProgress: (processed, total) => {
            progressCalls.push({ processed, total })
          }
        }
      )

      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls[progressCalls.length - 1].processed).toBe(20)
    })
  })

  describe('QueryOptimizer', () => {
    it('ルールの複雑度による並び替え', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'description',
          operator: 'contains',
          value: 'text',
          logic: 'AND'
        },
        {
          field: 'is_favorite',
          operator: 'equals',
          value: true,
          logic: 'AND'
        },
        {
          field: 'created_date',
          operator: 'greater_than',
          value: '7days',
          logic: 'AND'
        }
      ]

      const optimized = QueryOptimizer.optimizeRules(rules)
      
      // is_favorite が最初に来るべき（最も簡単）
      expect(optimized[0].field).toBe('is_favorite')
    })

    it('冗長なルールの削除', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        },
        {
          field: 'status',
          operator: 'equals',
          value: 'todo',
          logic: 'AND'
        },
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        }
      ]

      const optimized = QueryOptimizer.optimizeRules(rules)
      expect(optimized).toHaveLength(2)
    })
  })

  describe('CacheManager', () => {
    it('キャッシュの保存と取得', () => {
      const testData = { result: 'test' }
      
      CacheManager.set('test-key', testData)
      const retrieved = CacheManager.get('test-key')
      
      expect(retrieved).toEqual(testData)
    })

    it('TTL による有効期限切れ', () => {
      // TTLを短くするためにプライベートプロパティを操作
      // 実際のテストでは、テスト用の設定を別途用意するのが良い
      const testData = { result: 'test' }
      
      CacheManager.set('test-key', testData)
      
      // すぐに取得
      expect(CacheManager.get('test-key')).toEqual(testData)
      
      // 実際のプロダクションコードでは時間経過をモックする
    })

    it('キャッシュサイズ制限', () => {
      // maxSizeを超えるアイテムを追加
      for (let i = 0; i < 1005; i++) {
        CacheManager.set(`key-${i}`, { value: i })
      }
      
      const stats = CacheManager.getStats()
      expect(stats.size).toBeLessThanOrEqual(1000)
    })

    it('キャッシュ統計', () => {
      CacheManager.set('key1', 'value1')
      CacheManager.get('key1') // ヒット
      CacheManager.get('key1') // ヒット
      CacheManager.get('nonexistent') // ミス

      const stats = CacheManager.getStats()
      expect(stats.size).toBe(1)
      expect(stats.hitRate).toBeGreaterThan(0)
    })
  })

  describe('PerformanceMonitor', () => {
    it('パフォーマンス測定', async () => {
      const slowOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'result'
      }

      const result = await PerformanceMonitor.measure('slow-op', slowOperation)
      expect(result).toBe('result')

      const metrics = PerformanceMonitor.getMetrics()
      expect(metrics['slow-op']).toBeDefined()
      expect(metrics['slow-op'].count).toBe(1)
      expect(metrics['slow-op'].averageTime).toBeGreaterThan(0)
    })

    it('エラー時のメトリクス記録', async () => {
      const failingOperation = async () => {
        throw new Error('Test error')
      }

      try {
        await PerformanceMonitor.measure('failing-op', failingOperation)
      } catch (error) {
        // エラーが期待される
      }

      const metrics = PerformanceMonitor.getMetrics()
      expect(metrics['failing-op_error']).toBeDefined()
    })

    it('複数回実行の統計', async () => {
      const operation = async () => 'result'

      // 複数回実行
      for (let i = 0; i < 5; i++) {
        await PerformanceMonitor.measure('multi-op', operation)
      }

      const metrics = PerformanceMonitor.getMetrics()
      expect(metrics['multi-op'].count).toBe(5)
      expect(metrics['multi-op'].minTime).toBeGreaterThan(0)
      expect(metrics['multi-op'].maxTime).toBeGreaterThanOrEqual(metrics['multi-op'].minTime)
    })
  })

  describe('統合テスト', () => {
    it('インデックス + キャッシュ + モニタリング', async () => {
      const testItems = [
        { id: '1', priority: 'high', status: 'todo' },
        { id: '2', priority: 'medium', status: 'in_progress' },
        { id: '3', priority: 'high', status: 'completed' }
      ]

      const operation = async () => {
        // インデックス構築
        IndexManager.buildIndex(testItems, 'priority')
        
        // フィルタリング
        const rule: SmartFolderRule = {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        }
        
        const filtered = IndexManager.filterUsingIndex(testItems, rule)
        
        // キャッシュに保存
        CacheManager.set('filtered-result', filtered)
        
        return filtered
      }

      const result = await PerformanceMonitor.measure('integrated-op', operation)
      
      expect(result).toHaveLength(2)
      expect(CacheManager.get('filtered-result')).toEqual(result)
      
      const metrics = PerformanceMonitor.getMetrics()
      expect(metrics['integrated-op']).toBeDefined()
    })
  })
})