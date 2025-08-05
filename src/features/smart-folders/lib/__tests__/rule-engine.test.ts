// スマートフォルダ ルール評価エンジンのテスト

import { describe, it, expect, beforeEach } from 'vitest'
import { AdvancedRuleEngine } from '../rule-engine'
import { SmartFolderRule, SmartFolderRuleField, SmartFolderRuleOperator } from '@/types/smart-folders'

describe('AdvancedRuleEngine', () => {
  beforeEach(() => {
    // 各テスト前にキャッシュとステータスをリセット
    AdvancedRuleEngine.clearCache()
    AdvancedRuleEngine.resetStats()
  })

  describe('evaluateRule - タグ条件', () => {
    const testItem = {
      id: '1',
      title: 'Test Task',
      tags: ['work', 'urgent', 'frontend']
    }

    it('タグを含む条件の評価', () => {
      const rule: SmartFolderRule = {
        field: 'tag',
        operator: 'contains',
        value: 'work',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('タグを含まない条件の評価', () => {
      const rule: SmartFolderRule = {
        field: 'tag',
        operator: 'not_contains',
        value: 'personal',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('タグが空の条件の評価', () => {
      const emptyTagItem = { id: '2', tags: [] }
      const rule: SmartFolderRule = {
        field: 'tag',
        operator: 'is_empty',
        value: null,
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(emptyTagItem, rule)
      expect(result).toBe(true)
    })
  })

  describe('evaluateRule - 日付条件', () => {
    const now = new Date('2024-01-15T10:00:00Z')
    const testItem = {
      id: '1',
      title: 'Test Task',
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-14T10:00:00Z')
    }

    it('相対日付の評価（7日以内）', () => {
      const rule: SmartFolderRule = {
        field: 'updated_date',
        operator: 'greater_than',
        value: '7days',
        logic: 'AND'
      }

      const context = { item: testItem, now, userTimeZone: 'UTC' }
      const result = AdvancedRuleEngine.evaluateRule(testItem, rule, context)
      expect(result).toBe(true)
    })

    it('具体的な日付との比較', () => {
      const rule: SmartFolderRule = {
        field: 'created_date',
        operator: 'greater_than',
        value: new Date('2024-01-01T00:00:00Z'),
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('同じ日付の比較（equals）', () => {
      const rule: SmartFolderRule = {
        field: 'created_date',
        operator: 'equals',
        value: new Date('2024-01-10T10:00:00Z'),
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })
  })

  describe('evaluateRule - ステータス条件', () => {
    const testItem = {
      id: '1',
      title: 'Test Task',
      status: 'in_progress'
    }

    it('ステータスの完全一致', () => {
      const rule: SmartFolderRule = {
        field: 'status',
        operator: 'equals',
        value: 'in_progress',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('ステータスの部分一致', () => {
      const rule: SmartFolderRule = {
        field: 'status',
        operator: 'contains',
        value: 'progress',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })
  })

  describe('evaluateRule - 優先度条件', () => {
    const testItem = {
      id: '1',
      title: 'Test Task',
      priority: 'high'
    }

    it('優先度の完全一致', () => {
      const rule: SmartFolderRule = {
        field: 'priority',
        operator: 'equals',
        value: 'high',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('優先度の大小比較', () => {
      const rule: SmartFolderRule = {
        field: 'priority',
        operator: 'greater_than',
        value: 'medium',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })
  })

  describe('evaluateRule - テキスト条件', () => {
    const testItem = {
      id: '1',
      title: 'Complete the React component',
      description: 'Build a new dashboard component using React and TypeScript'
    }

    it('タイトルの部分一致', () => {
      const rule: SmartFolderRule = {
        field: 'title',
        operator: 'contains',
        value: 'React',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('タイトルの開始文字チェック', () => {
      const rule: SmartFolderRule = {
        field: 'title',
        operator: 'starts_with',
        value: 'Complete',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })

    it('説明文の終了文字チェック', () => {
      const rule: SmartFolderRule = {
        field: 'description',
        operator: 'ends_with',
        value: 'TypeScript',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })
  })

  describe('evaluateRuleSet - 複合条件', () => {
    const testItem = {
      id: '1',
      title: 'Urgent Task',
      tags: ['work', 'urgent'],
      priority: 'high',
      status: 'todo'
    }

    it('AND条件の評価', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'tag',
          operator: 'contains',
          value: 'urgent',
          logic: 'AND'
        },
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        }
      ]

      const result = AdvancedRuleEngine.evaluateRuleSet(testItem, rules)
      expect(result).toBe(true)
    })

    it('OR条件の評価', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'status',
          operator: 'equals',
          value: 'completed',
          logic: 'OR'
        },
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        }
      ]

      const result = AdvancedRuleEngine.evaluateRuleSet(testItem, rules)
      expect(result).toBe(true)
    })

    it('複雑な条件の組み合わせ', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'tag',
          operator: 'contains',
          value: 'work',
          logic: 'AND'
        },
        {
          field: 'status',
          operator: 'not_equals',
          value: 'completed',
          logic: 'OR'
        },
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        }
      ]

      const result = AdvancedRuleEngine.evaluateRuleSet(testItem, rules)
      expect(result).toBe(true)
    })
  })

  describe('evaluateBatch - バッチ処理', () => {
    const testItems = [
      {
        id: '1',
        title: 'Task 1',
        priority: 'high',
        tags: ['urgent']
      },
      {
        id: '2',
        title: 'Task 2',
        priority: 'medium',
        tags: ['work']
      },
      {
        id: '3',
        title: 'Task 3',
        priority: 'high',
        tags: ['personal']
      }
    ]

    it('高優先度タスクのフィルタリング', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        }
      ]

      const results = AdvancedRuleEngine.evaluateBatch(testItems, rules)
      const matches = results.filter(r => r.matches)
      
      expect(matches).toHaveLength(2)
      expect(matches[0].item.id).toBe('1')
      expect(matches[1].item.id).toBe('3')
    })

    it('複合条件でのバッチフィルタリング', () => {
      const rules: SmartFolderRule[] = [
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          logic: 'AND'
        },
        {
          field: 'tag',
          operator: 'contains',
          value: 'urgent',
          logic: 'AND'
        }
      ]

      const results = AdvancedRuleEngine.evaluateBatch(testItems, rules)
      const matches = results.filter(r => r.matches)
      
      expect(matches).toHaveLength(1)
      expect(matches[0].item.id).toBe('1')
    })
  })

  describe('キャッシュ機能', () => {
    const testItem = {
      id: '1',
      title: 'Test Task',
      priority: 'high'
    }

    const rule: SmartFolderRule = {
      field: 'priority',
      operator: 'equals',
      value: 'high',
      logic: 'AND'
    }

    it('キャッシュヒット', () => {
      // 初回評価
      const result1 = AdvancedRuleEngine.evaluateRule(testItem, rule)
      
      // 2回目評価（キャッシュヒット）
      const result2 = AdvancedRuleEngine.evaluateRule(testItem, rule)
      
      expect(result1).toBe(result2)
      
      const stats = AdvancedRuleEngine.getStats()
      expect(stats.cacheHits).toBeGreaterThan(0)
    })

    it('統計情報の取得', () => {
      AdvancedRuleEngine.evaluateRule(testItem, rule)
      AdvancedRuleEngine.evaluateRule(testItem, rule)
      
      const stats = AdvancedRuleEngine.getStats()
      expect(stats.totalEvaluations).toBe(2)
      expect(stats.cacheHits).toBe(1)
      expect(stats.cacheMisses).toBe(1)
    })
  })

  describe('エッジケース', () => {
    it('空のルールセット', () => {
      const testItem = { id: '1', title: 'Test' }
      const result = AdvancedRuleEngine.evaluateRuleSet(testItem, [])
      expect(result).toBe(true)
    })

    it('存在しないフィールド', () => {
      const testItem = { id: '1', title: 'Test' }
      const rule: SmartFolderRule = {
        field: 'nonexistent_field' as SmartFolderRuleField,
        operator: 'equals',
        value: 'value',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(false)
    })

    it('無効な演算子', () => {
      const testItem = { id: '1', title: 'Test' }
      const rule: SmartFolderRule = {
        field: 'title',
        operator: 'invalid_operator' as SmartFolderRuleOperator,
        value: 'Test',
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(false)
    })

    it('null値の処理', () => {
      const testItem = { id: '1', title: null }
      const rule: SmartFolderRule = {
        field: 'title',
        operator: 'is_empty',
        value: null,
        logic: 'AND'
      }

      const result = AdvancedRuleEngine.evaluateRule(testItem, rule)
      expect(result).toBe(true)
    })
  })
})