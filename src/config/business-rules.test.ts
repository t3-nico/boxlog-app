/**
 * ビジネスルール辞書システム - テストスイート
 *
 * Issue #344: ビジネスルール辞書の基盤設計・実装
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  BusinessRuleRegistry,
  createRule,
  createValidationRule,
  type BusinessRule,
  type RuleContext,
  type ValidationResult,
} from './business-rules'

describe('BusinessRuleRegistry', () => {
  let registry: BusinessRuleRegistry

  beforeEach(() => {
    registry = new BusinessRuleRegistry()
  })

  describe('ルール登録', () => {
    it('有効なルールを正常に登録できる', () => {
      const rule = createRule('test-rule', 'テストルール', 'テスト用のルール', 'validation', ['test'], () => ({
        valid: true,
      }))

      registry.register(rule)
      expect(registry.getRule('test-rule')).toBe(rule)
    })

    it('必須フィールドが不足している場合はエラー', () => {
      const invalidRule = {
        id: '',
        name: 'テストルール',
        implementation: () => ({ valid: true }),
      } as BusinessRule

      expect(() => registry.register(invalidRule)).toThrow('ルール登録エラー')
    })

    it('重複IDの場合はエラー', () => {
      const rule1 = createRule('duplicate', 'ルール1', 'テスト', 'validation', ['test'], () => ({ valid: true }))
      const rule2 = createRule('duplicate', 'ルール2', 'テスト', 'validation', ['test'], () => ({ valid: true }))

      registry.register(rule1)
      expect(() => registry.register(rule2)).toThrow('既に存在します')
    })
  })

  describe('ルール検索', () => {
    beforeEach(() => {
      const rules = [
        createRule('rule1', 'ルール1', 'テスト', 'validation', ['user', 'task'], () => ({ valid: true })),
        createRule('rule2', 'ルール2', 'テスト', 'workflow', ['user'], () => ({ valid: true })),
        createRule('rule3', 'ルール3', 'テスト', 'permission', ['task'], () => ({ valid: true })),
      ]

      rules.forEach((rule) => registry.register(rule))
    })

    it('コンテキストで適用可能なルールを取得', () => {
      const userRules = registry.getApplicableRules('user')
      expect(userRules).toHaveLength(2)
      expect(userRules.map((r) => r.id).sort()).toEqual(['rule1', 'rule2'])
    })

    it('カテゴリ別でルールを取得', () => {
      const validationRules = registry.getRulesByCategory('validation')
      expect(validationRules).toHaveLength(1)
      expect(validationRules[0].id).toBe('rule1')
    })
  })

  describe('ルール実行', () => {
    beforeEach(() => {
      const successRule = createRule(
        'success-rule',
        '成功ルール',
        'テスト',
        'validation',
        ['test'],
        () => ({ valid: true }),
        { severity: 'warning' }
      )

      const errorRule = createRule(
        'error-rule',
        'エラールール',
        'テスト',
        'validation',
        ['test'],
        () => ({ valid: false, message: 'エラーメッセージ' }),
        { severity: 'error' }
      )

      registry.register(successRule)
      registry.register(errorRule)
    })

    it('成功するルールを正常実行', async () => {
      const results = await registry.validate('test', { value: 'test' })

      // エラールールが先に実行され、エラーで停止するはず
      expect(results).toHaveLength(1)
      expect(results[0].rule.id).toBe('error-rule')
      expect(results[0].result.valid).toBe(false)
      expect(results[0].result.message).toBe('エラーメッセージ')
    })

    it('実行時間が記録される', async () => {
      const results = await registry.validate('test', { value: 'test' })

      expect(results[0].executionTime).toBeGreaterThan(0)
      expect(results[0].timestamp).toBeInstanceOf(Date)
    })
  })

  describe('依存関係解決', () => {
    it('依存関係のあるルールを正しい順序で実行', async () => {
      const baseRule = createRule(
        'base-rule',
        'ベースルール',
        'テスト',
        'validation',
        ['dependency-test'],
        ({ data }) => ({ valid: data.base === true })
      )

      const dependentRule = createRule(
        'dependent-rule',
        '依存ルール',
        'テスト',
        'validation',
        ['dependency-test'],
        ({ data }) => ({ valid: data.dependent === true }),
        { dependencies: ['base-rule'] }
      )

      registry.register(baseRule)
      registry.register(dependentRule)

      const results = await registry.validate('dependency-test', {
        base: true,
        dependent: true,
      })

      expect(results).toHaveLength(2)
      expect(results[0].rule.id).toBe('base-rule') // 依存元が先
      expect(results[1].rule.id).toBe('dependent-rule')
    })

    it('存在しない依存ルールの場合はエラー', () => {
      const rule = createRule(
        'invalid-dep',
        '無効依存ルール',
        'テスト',
        'validation',
        ['test'],
        () => ({ valid: true }),
        { dependencies: ['non-existent'] }
      )

      expect(() => registry.register(rule)).toThrow('依存ルール "non-existent" が見つかりません')
    })
  })

  describe('ルール管理', () => {
    let testRule: BusinessRule

    beforeEach(() => {
      testRule = createRule('management-test', '管理テスト', 'テスト', 'validation', ['test'], () => ({ valid: true }))
      registry.register(testRule)
    })

    it('ルールを無効化', () => {
      expect(registry.deactivateRule('management-test')).toBe(true)
      expect(registry.getRule('management-test')?.active).toBe(false)
    })

    it('ルールを有効化', () => {
      registry.deactivateRule('management-test')
      expect(registry.activateRule('management-test')).toBe(true)
      expect(registry.getRule('management-test')?.active).toBe(true)
    })

    it('存在しないルールの管理は失敗', () => {
      expect(registry.deactivateRule('non-existent')).toBe(false)
      expect(registry.activateRule('non-existent')).toBe(false)
    })
  })

  describe('統計情報', () => {
    it('レジストリ統計を正しく計算', () => {
      const rules = [
        createRule('v1', 'Val1', 'Test', 'validation', ['test'], () => ({ valid: true })),
        createRule('v2', 'Val2', 'Test', 'validation', ['test'], () => ({ valid: true })),
        createRule('w1', 'Work1', 'Test', 'workflow', ['test'], () => ({ valid: true })),
        createRule('p1', 'Perm1', 'Test', 'permission', ['test'], () => ({ valid: true }), { active: false }),
      ]

      rules.forEach((rule) => registry.register(rule))

      const stats = registry.getStats()
      expect(stats.total).toBe(4)
      expect(stats.active).toBe(3)
      expect(stats.inactive).toBe(1)
      expect(stats.byCategory.validation).toBe(2)
      expect(stats.byCategory.workflow).toBe(1)
      expect(stats.byCategory.permission).toBe(1)
    })
  })
})

describe('ヘルパー関数', () => {
  describe('createValidationRule', () => {
    it('シンプルなバリデーションルールを作成', () => {
      const rule = createValidationRule(
        'simple-validation',
        'シンプル検証',
        ['test'],
        (data) => data.value > 0,
        '値は0より大きい必要があります'
      )

      expect(rule.id).toBe('simple-validation')
      expect(rule.category).toBe('validation')

      // 正常ケース
      const successResult = rule.implementation({
        data: { value: 5 },
      } as RuleContext) as ValidationResult
      expect(successResult.valid).toBe(true)

      // エラーケース
      const errorResult = rule.implementation({
        data: { value: -1 },
      } as RuleContext) as ValidationResult
      expect(errorResult.valid).toBe(false)
      expect(errorResult.message).toBe('値は0より大きい必要があります')
    })
  })
})
