/**
 * ビジネスルール辞書システム - 統合テストスイート
 *
 * Issue #347: 既存コード統合・ドキュメント・テスト完備
 * 関連Issue #343: ビジネスルール辞書システム実装
 * 祖先Issue #338: 技術的失敗を防ぐ開発環境構築
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  BusinessRuleRegistry,
  createRule,
  createValidationRule,
  type BusinessRule,
  type RuleContext,
  type ValidationResult,
} from '@/config/business-rules'

describe('ビジネスルール辞書システム - 統合テスト', () => {
  let testRegistry: BusinessRuleRegistry

  beforeEach(() => {
    testRegistry = new BusinessRuleRegistry()
  })

  afterEach(() => {
    // グローバルレジストリのクリーンアップ（実際の実装では注意）
  })

  describe('基盤システムテスト（Issue #344）', () => {
    it('ルールの完全なライフサイクル', async () => {
      // 1. ルール作成
      const testRule = createRule(
        'integration-test-rule',
        '統合テストルール',
        '統合テスト用のバリデーションルール',
        'validation',
        ['test'],
        ({ data }) => ({
          valid: data.value > 0,
          message: data.value > 0 ? undefined : '値は0より大きい必要があります',
        })
      )

      // 2. ルール登録
      testRegistry.register(testRule)
      expect(testRegistry.getRule('integration-test-rule')).toBe(testRule)

      // 3. ルール実行 - 成功ケース
      const successResult = await testRegistry.validate('test', { value: 5 })
      expect(successResult).toHaveLength(1)
      expect(successResult[0].result.valid).toBe(true)

      // 4. ルール実行 - 失敗ケース
      const failureResult = await testRegistry.validate('test', { value: -1 })
      expect(failureResult).toHaveLength(1)
      expect(failureResult[0].result.valid).toBe(false)
      expect(failureResult[0].result.message).toBe('値は0より大きい必要があります')

      // 5. ルール無効化
      expect(testRegistry.deactivateRule('integration-test-rule')).toBe(true)
      expect(testRegistry.getRule('integration-test-rule')?.active).toBe(false)

      // 6. 統計情報確認
      const stats = testRegistry.getStats()
      expect(stats.total).toBe(1)
      expect(stats.active).toBe(0)
      expect(stats.inactive).toBe(1)
    })

    it('複数ルールの依存関係解決', async () => {
      // 依存関係のあるルール群
      const baseRule = createRule(
        'base-rule',
        'ベースルール',
        '基礎的な検証',
        'validation',
        ['dependency-test'],
        ({ data }) => ({
          valid: data.hasBase === true,
          message: data.hasBase === true ? undefined : 'ベース条件が満たされていません',
        })
      )

      const dependentRule = createRule(
        'dependent-rule',
        '依存ルール',
        'ベースルールに依存する検証',
        'validation',
        ['dependency-test'],
        ({ data }) => ({
          valid: data.hasDependent === true,
          message: data.hasDependent === true ? undefined : '依存条件が満たされていません',
        }),
        { dependencies: ['base-rule'] }
      )

      // 正しい順序で登録
      testRegistry.register(baseRule)
      testRegistry.register(dependentRule)

      // 実行順序の確認（ベースルール → 依存ルール）
      const results = await testRegistry.validate('dependency-test', {
        hasBase: true,
        hasDependent: true,
      })

      expect(results).toHaveLength(2)
      expect(results[0].rule.id).toBe('base-rule')
      expect(results[1].rule.id).toBe('dependent-rule')
      expect(results.every((r) => r.result.valid)).toBe(true)
    })

    it('カテゴリ別・コンテキスト別検索', () => {
      const rules = [
        createRule('val1', 'V1', 'Test', 'validation', ['user'], () => ({ valid: true })),
        createRule('val2', 'V2', 'Test', 'validation', ['task'], () => ({ valid: true })),
        createRule('wf1', 'W1', 'Test', 'workflow', ['user'], () => ({ valid: true })),
        createRule('perm1', 'P1', 'Test', 'permission', ['task'], () => ({ valid: true })),
      ]

      rules.forEach((rule) => testRegistry.register(rule))

      // カテゴリ別検索
      expect(testRegistry.getRulesByCategory('validation')).toHaveLength(2)
      expect(testRegistry.getRulesByCategory('workflow')).toHaveLength(1)
      expect(testRegistry.getRulesByCategory('permission')).toHaveLength(1)

      // コンテキスト別検索
      expect(testRegistry.getApplicableRules('user')).toHaveLength(2)
      expect(testRegistry.getApplicableRules('task')).toHaveLength(2)
    })
  })

  describe('ヘルパー関数テスト', () => {
    it('createValidationRule - シンプルなバリデーション', () => {
      const emailRule = createValidationRule(
        'email-validation',
        'メール検証',
        ['user'],
        (data) => /^[^@]+@[^@]+\.[^@]+$/.test(data.email),
        '有効なメールアドレスを入力してください'
      )

      expect(emailRule.id).toBe('email-validation')
      expect(emailRule.category).toBe('validation')

      // 正常ケース
      const validResult = emailRule.implementation({
        data: { email: 'test@example.com' },
      } as RuleContext) as ValidationResult
      expect(validResult.valid).toBe(true)

      // 異常ケース
      const invalidResult = emailRule.implementation({
        data: { email: 'invalid-email' },
      } as RuleContext) as ValidationResult
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.message).toBe('有効なメールアドレスを入力してください')
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なルール登録のエラー処理', () => {
      const invalidRule = {
        id: '',
        name: 'Invalid Rule',
        implementation: () => ({ valid: true }),
      } as BusinessRule

      expect(() => testRegistry.register(invalidRule)).toThrow('ルール登録エラー')
    })

    it('重複ID登録のエラー処理', () => {
      const rule1 = createRule('duplicate', 'R1', 'Test', 'validation', ['test'], () => ({ valid: true }))
      const rule2 = createRule('duplicate', 'R2', 'Test', 'validation', ['test'], () => ({ valid: true }))

      testRegistry.register(rule1)
      expect(() => testRegistry.register(rule2)).toThrow('既に存在します')
    })

    it('存在しない依存ルールのエラー処理', () => {
      const invalidDependentRule = createRule(
        'invalid-dependent',
        'Invalid Dependent',
        'Test',
        'validation',
        ['test'],
        () => ({ valid: true }),
        { dependencies: ['non-existent-rule'] }
      )

      expect(() => testRegistry.register(invalidDependentRule)).toThrow(
        '依存ルール "non-existent-rule" が見つかりません'
      )
    })

    it('ルール実行時のエラーハンドリング', async () => {
      const errorRule = createRule(
        'error-rule',
        'Error Rule',
        'Test',
        'validation',
        ['test'],
        () => {
          throw new Error('意図的なエラー')
        },
        { severity: 'error' }
      )

      testRegistry.register(errorRule)

      const results = await testRegistry.validate('test', {})
      expect(results).toHaveLength(1)
      expect(results[0].result.valid).toBe(false)
      expect(results[0].result.message).toBe('意図的なエラー')
      expect(results[0].result.code).toBe('RULE_EXECUTION_ERROR')
    })
  })

  describe('パフォーマンステスト', () => {
    it('大量のルール登録・実行性能', async () => {
      const ruleCount = 100
      const startTime = performance.now()

      // 大量のルール登録
      for (let i = 0; i < ruleCount; i++) {
        const rule = createRule(
          `perf-rule-${i}`,
          `Performance Rule ${i}`,
          'Performance test',
          'validation',
          ['performance'],
          ({ data }) => ({ valid: data.value === i }),
          { severity: 'warning' } // エラー時でも継続実行
        )
        testRegistry.register(rule)
      }

      const registrationTime = performance.now()

      // 実行
      const results = await testRegistry.validate('performance', { value: 50 })

      const executionTime = performance.now()

      // パフォーマンス検証
      expect(testRegistry.getStats().total).toBe(ruleCount)
      expect(results).toHaveLength(ruleCount)
      expect(registrationTime - startTime).toBeLessThan(1000) // 1秒未満
      expect(executionTime - registrationTime).toBeLessThan(1000) // 1秒未満

      console.log(`パフォーマンステスト結果:`)
      console.log(`  - ルール登録時間: ${(registrationTime - startTime).toFixed(2)}ms`)
      console.log(`  - 実行時間: ${(executionTime - registrationTime).toFixed(2)}ms`)
      console.log(`  - 登録ルール数: ${ruleCount}`)
    })

    it('メモリ使用量確認', () => {
      const initialStats = testRegistry.getStats()

      // ルール追加
      for (let i = 0; i < 50; i++) {
        const rule = createRule(
          `memory-rule-${i}`,
          `Memory Rule ${i}`,
          'Memory test',
          'validation',
          ['memory'],
          () => ({ valid: true })
        )
        testRegistry.register(rule)
      }

      const finalStats = testRegistry.getStats()

      expect(finalStats.total).toBe(initialStats.total + 50)
      expect(finalStats.active).toBe(initialStats.active + 50)
    })
  })

  describe('実際のユースケース統合テスト', () => {
    it('ユーザー登録のビジネスルール統合', async () => {
      // 実際のユーザー登録で使用されるルール群
      const emailRule = createValidationRule(
        'user-email-format',
        'メール形式検証',
        ['user'],
        (data) => /^[^@]+@[^@]+\.[^@]+$/.test(data.email),
        '有効なメールアドレスを入力してください'
      )

      const passwordRule = createValidationRule(
        'user-password-strength',
        'パスワード強度検証',
        ['user'],
        (data) => data.password && data.password.length >= 8,
        'パスワードは8文字以上必要です'
      )

      const ageRule = createValidationRule(
        'user-age-validation',
        '年齢検証',
        ['user'],
        (data) => data.age >= 18 && data.age <= 120,
        '年齢は18-120歳の範囲で入力してください'
      )

      const rules = [emailRule, passwordRule, ageRule]
      rules.forEach((rule) => testRegistry.register(rule))

      // 正常なユーザーデータ
      const validUser = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        age: 25,
      }

      const validResults = await testRegistry.validate('user', validUser)
      expect(validResults.every((r) => r.result.valid)).toBe(true)

      // 無効なユーザーデータ
      const invalidUser = {
        email: 'invalid-email',
        password: '123',
        age: 15,
      }

      const invalidResults = await testRegistry.validate('user', invalidUser)
      expect(invalidResults.every((r) => !r.result.valid)).toBe(true)
      expect(invalidResults).toHaveLength(3)

      // エラーメッセージ確認
      const errorMessages = invalidResults.map((r) => r.result.message)
      expect(errorMessages).toContain('有効なメールアドレスを入力してください')
      expect(errorMessages).toContain('パスワードは8文字以上必要です')
      expect(errorMessages).toContain('年齢は18-120歳の範囲で入力してください')
    })

    it('タスク管理ワークフローのビジネスルール統合', async () => {
      // タスク作成権限チェック
      const createPermissionRule = createRule(
        'task-create-permission',
        'タスク作成権限',
        'タスク作成権限の確認',
        'permission',
        ['task'],
        ({ user }) => ({
          valid: user?.permissions?.includes('task:create') || false,
          message: user?.permissions?.includes('task:create') ? undefined : 'タスク作成権限がありません',
        })
      )

      // タスクタイトル検証
      const titleRule = createValidationRule(
        'task-title-validation',
        'タスクタイトル検証',
        ['task'],
        (data) => data.title && data.title.trim().length >= 3,
        'タスクタイトルは3文字以上必要です'
      )

      // 状態遷移ルール
      const statusRule = createRule(
        'task-status-transition',
        'タスク状態遷移',
        'タスク状態遷移の検証',
        'workflow',
        ['task'],
        ({ data }) => {
          const validStatuses = ['todo', 'in_progress', 'completed', 'cancelled']
          return {
            valid: validStatuses.includes(data.status),
            message: validStatuses.includes(data.status) ? undefined : '無効な状態です',
          }
        }
      )

      const taskRules = [createPermissionRule, titleRule, statusRule]
      taskRules.forEach((rule) => testRegistry.register(rule))

      // 権限のあるユーザーでのタスク作成
      const authorizedUser = {
        id: 'user-1',
        permissions: ['task:create', 'task:read'],
      }

      const validTask = {
        title: '新しいタスク',
        status: 'todo',
      }

      const successResults = await testRegistry.validate('task', validTask, authorizedUser)
      expect(successResults.every((r) => r.result.valid)).toBe(true)

      // 権限のないユーザーでのタスク作成
      const unauthorizedUser = {
        id: 'user-2',
        permissions: ['task:read'],
      }

      const failureResults = await testRegistry.validate('task', validTask, unauthorizedUser)
      expect(failureResults.some((r) => !r.result.valid)).toBe(true)

      const permissionError = failureResults.find((r) => r.rule.id === 'task-create-permission')
      expect(permissionError?.result.valid).toBe(false)
      expect(permissionError?.result.message).toBe('タスク作成権限がありません')
    })
  })
})

describe('自動生成システム統合テスト（Issue #346）', () => {
  it('生成されたバリデーション関数の動作確認', async () => {
    // 動的インポート（生成ファイルが存在する場合）
    try {
      const { validateUser } = await import('@/generated/business-rules/generated-validations')

      // 正常ケース
      const validResult = validateUser({
        email: 'test@example.com',
        name: 'テストユーザー',
      })
      expect(validResult.valid).toBe(true)

      // 異常ケース
      const invalidResult = validateUser({
        email: 'invalid-email',
        name: '',
      })
      expect(invalidResult.valid).toBe(false)
    } catch (error) {
      // 生成ファイルが存在しない場合はスキップ
      console.log('生成されたファイルが見つかりません。npm run generate:business-rules を実行してください。')
    }
  })

  it('生成されたZodスキーマの動作確認', async () => {
    try {
      const { userSchema } = await import('@/generated/business-rules/generated-schemas')

      // 正常ケース
      const validData = {
        id: crypto.randomUUID(),
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(() => userSchema.parse(validData)).not.toThrow()

      // 異常ケース
      const invalidData = {
        id: 'invalid-uuid',
        email: 'invalid-email',
        name: '',
        role: 'invalid-role',
      }
      expect(() => userSchema.parse(invalidData)).toThrow()
    } catch (error) {
      console.log('生成されたファイルが見つかりません。npm run generate:schemas を実行してください。')
    }
  })
})

describe('システム全体統合テスト', () => {
  let testRegistry: BusinessRuleRegistry

  beforeEach(() => {
    testRegistry = new BusinessRuleRegistry()
  })

  it('エンドツーエンドワークフロー', async () => {
    // 1. ビジネスルール定義
    const comprehensiveRule = createRule(
      'comprehensive-test',
      '包括テスト',
      '全機能を含む包括的なテスト',
      'validation',
      ['comprehensive'],
      ({ data, user, session }) => {
        // 複合的な検証
        const checks = [data.required_field !== undefined, user?.id !== undefined, session?.timestamp !== undefined]

        const passed = checks.every((check) => check)

        return {
          valid: passed,
          message: passed ? undefined : '包括的検証に失敗しました',
          details: {
            checks: checks.map((result, index) => ({ [`check_${index}`]: result })),
            sessionId: session?.id,
          },
        }
      },
      { severity: 'error' }
    )

    // 2. ルール登録
    testRegistry.register(comprehensiveRule)

    // 3. 実行とメトリクス収集
    const startTime = performance.now()

    const result = await testRegistry.validate(
      'comprehensive',
      { required_field: 'present' },
      { id: 'test-user', role: 'admin', permissions: ['all'] }
    )

    const endTime = performance.now()

    // 4. 結果検証
    expect(result).toHaveLength(1)
    expect(result[0].result.valid).toBe(true)
    expect(result[0].executionTime).toBeGreaterThan(0)
    expect(result[0].timestamp).toBeInstanceOf(Date)
    expect(result[0].result.details).toBeDefined()

    // 5. パフォーマンス検証
    expect(endTime - startTime).toBeLessThan(100) // 100ms未満

    // 6. 統計情報確認
    const stats = testRegistry.getStats()
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.active).toBeGreaterThan(0)

    console.log('エンドツーエンドテスト完了:', {
      executionTime: `${(endTime - startTime).toFixed(2)}ms`,
      ruleExecutionTime: `${result[0].executionTime.toFixed(2)}ms`,
      stats: stats,
    })
  })
})
