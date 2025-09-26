import { describe, expect, it } from 'vitest'

import { createTaskSchema, taskSchema } from '../generated-schemas'
import { validateTask } from '../generated-validations'

describe('task 自動生成テスト', () => {
  describe('Zodスキーマテスト', () => {
    it('正常なtaskデータでバリデーションが通る', () => {
      const validData = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),

        title: '有効なタスクタイトル',
        description: 'タスクの説明',
        priority: 'medium',
        status: 'todo',
      }

      expect(() => taskSchema.parse(validData)).not.toThrow()
    })

    it('作成用スキーマで正常なデータでバリデーションが通る', () => {
      const validCreateData = {
        title: '有効なタスクタイトル',
        description: 'タスクの説明',
        priority: 'medium',
        status: 'todo',
      }

      expect(() => createTaskSchema.parse(validCreateData)).not.toThrow()
    })

    it('無効なtaskデータでバリデーションエラーが発生', () => {
      const invalidData = {
        id: 'invalid-uuid',

        title: 'ab',
        priority: 'invalid',
        status: 'invalid',
      }

      expect(() => taskSchema.parse(invalidData)).toThrow()
    })
  })

  describe('カスタムバリデーション関数テスト', () => {
    it('validateTask - 正常ケース', () => {
      const validData = {
        title: '有効なタスクタイトル',
        description: 'タスクの説明',
        priority: 'medium',
        status: 'todo',
      }

      const result = validateTask(validData)
      expect(result.valid).toBe(true)
    })

    it('validateTask - 異常ケース', () => {
      const invalidData = {
        title: 'ab',
        priority: 'invalid',
        status: 'invalid',
      }

      const result = validateTask(invalidData)
      expect(result.valid).toBe(false)
      expect(result.message).toBeDefined()
    })
  })
})
