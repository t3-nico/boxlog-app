/**
 * API自動バリデーション統合テスト
 * tRPC + Zod + ビジネスルール辞書の統合動作確認
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { tasksRouter } from '@/server/api/routers/tasks'
import { createTRPCContext } from '@/server/api/trpc'
import {
  createTaskInputSchema,
  updateTaskInputSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@/schemas/api/tasks'
import { createTaskValidationSchema } from '@/lib/business-rules-zod'
import { businessRulesDictionary } from '@/config/business-rules'

// テスト用のモック関数
vi.mock('@/config/business-rules', () => ({
  businessRulesDictionary: {
    getRulesForEntity: vi.fn(),
  },
}))

vi.mock('@/lib/analytics/vercel-analytics', () => ({
  trackTaskCreated: vi.fn(),
  trackTaskCompleted: vi.fn(),
  trackError: vi.fn(),
}))

vi.mock('@/config/error-patterns', () => ({
  createAppError: vi.fn((message, code, context) => ({
    message,
    code,
    context,
  })),
  ERROR_CODES: {
    NOT_FOUND: 'NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  },
}))

describe('API自動バリデーション統合テスト', () => {
  const mockUser = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのビジネスルール設定
    const mockGetRulesForEntity = vi.mocked(businessRulesDictionary.getRulesForEntity)
    mockGetRulesForEntity.mockReturnValue([])
  })

  describe('Zodスキーマ基本バリデーション', () => {
    it('正常なタスク作成データが検証をパスする', () => {
      const validInput: CreateTaskInput = {
        title: '新しいタスク',
        description: 'タスクの詳細説明',
        priority: 'medium',
        estimatedHours: 2.5,
      }

      const result = createTaskInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.title).toBe('新しいタスク')
        expect(result.data.priority).toBe('medium')
        expect(result.data.estimatedHours).toBe(2.5)
      }
    })

    it('無効なデータ型で検証が失敗する', () => {
      const invalidInput = {
        title: '', // 空文字列
        priority: 'invalid-priority', // 無効な優先度
        estimatedHours: -1, // 負の数値
      }

      const result = createTaskInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = result.error.errors
        expect(errors.some(e => e.path.includes('title'))).toBe(true)
        expect(errors.some(e => e.path.includes('priority'))).toBe(true)
        expect(errors.some(e => e.path.includes('estimatedHours'))).toBe(true)
      }
    })

    it('期限日の未来日チェックが正しく動作する', () => {
      const pastDate = new Date('2020-01-01')
      const futureDate = new Date('2030-12-31')

      const invalidInput: CreateTaskInput = {
        title: '有効なタスク',
        description: 'テスト用',
        priority: 'low',
        dueDate: pastDate,
      }

      const validInput: CreateTaskInput = {
        title: '有効なタスク',
        description: 'テスト用',
        priority: 'low',
        dueDate: futureDate,
      }

      expect(createTaskInputSchema.safeParse(invalidInput).success).toBe(false)
      expect(createTaskInputSchema.safeParse(validInput).success).toBe(true)
    })
  })

  describe('ビジネスルール統合バリデーション', () => {
    it('ビジネスルール適用済みスキーマが正しく動作する', () => {
      const validatedSchema = createTaskValidationSchema(createTaskInputSchema)

      const validInput: CreateTaskInput = {
        title: '適切な長さのタイトル',
        description: 'テスト用の説明',
        priority: 'high',
      }

      const result = validatedSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('ビジネスルール違反でバリデーションが失敗する', () => {
      // 短すぎるタイトルのビジネスルールを設定
      const mockGetRulesForEntity = vi.mocked(businessRulesDictionary.getRulesForEntity)
      mockGetRulesForEntity.mockReturnValue([
        {
          id: 'task-title-min-length',
          name: 'タスクタイトル最小長',
          description: 'タスクのタイトルは5文字以上必須',
          entity: 'task',
          category: 'validation',
          priority: 1,
          isActive: true,
          severity: 'critical',
          conditions: [
            {
              field: 'title',
              operator: 'greater_equal',
              value: 5,
              logicalOperator: 'AND',
            },
          ],
          actions: [
            {
              type: 'show_message',
              parameters: {
                message: 'タスクタイトルは5文字以上で入力してください',
              },
            },
          ],
        },
      ])

      const validatedSchema = createTaskValidationSchema(createTaskInputSchema)

      const invalidInput: CreateTaskInput = {
        title: 'ABC', // 3文字（5文字未満）
        description: 'テスト用の説明',
        priority: 'high',
      }

      const result = validatedSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('複数のビジネスルールが同時に適用される', () => {
      const mockGetRulesForEntity = vi.mocked(businessRulesDictionary.getRulesForEntity)
      mockGetRulesForEntity.mockReturnValue([
        {
          id: 'task-title-length',
          name: 'タスクタイトル長さ制限',
          description: 'タスクのタイトルは3文字以上',
          entity: 'task',
          category: 'validation',
          priority: 1,
          isActive: true,
          severity: 'high',
          conditions: [
            {
              field: 'title',
              operator: 'greater_equal',
              value: 3,
              logicalOperator: 'AND',
            },
          ],
          actions: [
            {
              type: 'show_message',
              parameters: {
                message: 'タスクタイトルは3文字以上で入力してください',
              },
            },
          ],
        },
        {
          id: 'task-priority-required',
          name: 'タスク優先度必須',
          description: 'タスクには必ず優先度を設定',
          entity: 'task',
          category: 'validation',
          priority: 1,
          isActive: true,
          severity: 'medium',
          conditions: [
            {
              field: 'priority',
              operator: 'is_not_null',
              value: null,
              logicalOperator: 'AND',
            },
          ],
          actions: [
            {
              type: 'show_message',
              parameters: {
                message: '優先度を選択してください',
              },
            },
          ],
        },
      ])

      const validatedSchema = createTaskValidationSchema(createTaskInputSchema)

      // 正常データ
      const validInput: CreateTaskInput = {
        title: '適切なタイトル',
        description: 'テスト用',
        priority: 'medium',
      }

      expect(validatedSchema.safeParse(validInput).success).toBe(true)

      // 両方のルールに違反
      const invalidInput = {
        title: 'AB', // 3文字未満
        description: 'テスト用',
        // priority が欠如
      }

      expect(validatedSchema.safeParse(invalidInput).success).toBe(false)
    })
  })

  describe('tRPCルーター統合テスト', () => {
    it('タスク作成APIが正常に動作する', async () => {
      const ctx = await createTRPCContext({
        req: {} as any,
        res: {} as any,
      })

      // ユーザー認証状態をモック
      const authenticatedCtx = { ...ctx, userId: mockUser.userId }

      const caller = tasksRouter.createCaller(authenticatedCtx)

      const input: CreateTaskInput = {
        title: '統合テスト用タスク',
        description: 'tRPC + Zod + ビジネスルールの統合テスト',
        priority: 'high',
        estimatedHours: 3,
      }

      const result = await caller.create(input)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.title).toBe(input.title)
      expect(result.description).toBe(input.description)
      expect(result.priority).toBe(input.priority)
      expect(result.status).toBe('todo')
      expect(result.completed).toBe(false)
      expect(result.progress).toBe(0)
      expect(result.createdBy).toBe(mockUser.userId)
    })

    it('無効なデータでtRPCエラーが発生する', async () => {
      const ctx = await createTRPCContext({
        req: {} as any,
        res: {} as any,
      })

      const authenticatedCtx = { ...ctx, userId: mockUser.userId }
      const caller = tasksRouter.createCaller(authenticatedCtx)

      const invalidInput = {
        title: '', // 空文字列
        priority: 'invalid' as any,
        estimatedHours: -1,
      }

      await expect(caller.create(invalidInput)).rejects.toThrow()
    })

    it('認証されていないユーザーでアクセス拒否される', async () => {
      const ctx = await createTRPCContext({
        req: {} as any,
        res: {} as any,
      })

      // 認証されていないコンテキスト
      const unauthenticatedCtx = { ...ctx, userId: undefined }
      const caller = tasksRouter.createCaller(unauthenticatedCtx)

      const input: CreateTaskInput = {
        title: '認証テスト用タスク',
        description: 'テスト',
        priority: 'medium',
      }

      await expect(caller.create(input)).rejects.toThrow(TRPCError)
    })
  })

  describe('エラーハンドリング統合テスト', () => {
    it('バリデーションエラーが適切な形式で返される', () => {
      const invalidInput = {
        title: '', // 必須フィールドが空
        priority: 'invalid-priority',
        estimatedHours: 'not-a-number' as any,
      }

      const result = createTaskInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = result.error.errors

        // エラーメッセージが日本語で含まれることを確認
        expect(errors.some(e => e.message.includes('入力してください'))).toBe(true)

        // 各フィールドのエラーが含まれることを確認
        const fieldPaths = errors.map(e => e.path.join('.'))
        expect(fieldPaths).toContain('title')
        expect(fieldPaths).toContain('priority')
        expect(fieldPaths).toContain('estimatedHours')
      }
    })

    it('ビジネスルール違反エラーが適切なメッセージで返される', () => {
      const mockGetRulesForEntity = vi.mocked(businessRulesDictionary.getRulesForEntity)
      mockGetRulesForEntity.mockReturnValue([
        {
          id: 'task-custom-rule',
          name: 'カスタムルール',
          description: 'カスタムバリデーションルール',
          entity: 'task',
          category: 'validation',
          priority: 1,
          isActive: true,
          severity: 'critical',
          conditions: [
            {
              field: 'title',
              operator: 'not_contains',
              value: '禁止ワード',
              logicalOperator: 'AND',
            },
          ],
          actions: [
            {
              type: 'show_message',
              parameters: {
                message: 'タスクタイトルに禁止ワードが含まれています',
              },
            },
          ],
        },
      ])

      const validatedSchema = createTaskValidationSchema(createTaskInputSchema)

      const input: CreateTaskInput = {
        title: '禁止ワードを含むタスク',
        description: 'テスト用',
        priority: 'medium',
      }

      const result = validatedSchema.safeParse(input)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('タスクタイトルに禁止ワードが含まれています')
      }
    })
  })

  describe('タスク更新バリデーション', () => {
    it('正常なタスク更新データが検証をパスする', () => {
      const validUpdate: UpdateTaskInput = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: '更新されたタスク',
        completed: true,
        progress: 100,
        actualHours: 2.5,
      }

      const result = updateTaskInputSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('完了時の進捗率チェックが正しく動作する', () => {
      // 完了フラグがtrueなのに進捗率が100%未満
      const invalidUpdate: UpdateTaskInput = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        completed: true,
        progress: 80, // 100%でない
      }

      const result = updateTaskInputSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)

      if (!result.success) {
        // refineで追加したエラーメッセージを確認
        const refineError = result.error.errors.find(e => e.message === '完了時は進捗を100%にしてください')
        expect(refineError).toBeDefined()
      }
    })

    it('期限日の未来日チェックが更新時も動作する', () => {
      const pastDate = new Date('2020-01-01')

      const invalidUpdate: UpdateTaskInput = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        dueDate: pastDate,
      }

      const result = updateTaskInputSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)

      if (!result.success) {
        // refineで追加したエラーメッセージを確認
        const refineError = result.error.errors.find(e => e.message === '期限は現在時刻以降を指定してください')
        expect(refineError).toBeDefined()
      }
    })
  })

  describe('パフォーマンステスト', () => {
    it('大量データでもバリデーションが高速に動作する', () => {
      const startTime = Date.now()

      // 100個のタスクデータを一気にバリデーション
      for (let i = 0; i < 100; i++) {
        const input: CreateTaskInput = {
          title: `タスク ${i}`,
          description: `テスト用タスク ${i} の説明`,
          priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
          estimatedHours: Math.random() * 10,
        }

        const result = createTaskInputSchema.safeParse(input)
        expect(result.success).toBe(true)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // 100個のバリデーションが1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000)
    })

    it('ビジネスルール適用でもパフォーマンスが維持される', () => {
      const validatedSchema = createTaskValidationSchema(createTaskInputSchema)
      const startTime = Date.now()

      // 50個のデータをビジネスルール適用でバリデーション
      for (let i = 0; i < 50; i++) {
        const input: CreateTaskInput = {
          title: `ビジネスルールテスト ${i}`,
          description: `テスト用 ${i}`,
          priority: 'medium',
          estimatedHours: 2,
        }

        const result = validatedSchema.safeParse(input)
        expect(result.success).toBe(true)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // ビジネスルール適用でも1秒以内に完了
      expect(duration).toBeLessThan(1000)
    })
  })
})