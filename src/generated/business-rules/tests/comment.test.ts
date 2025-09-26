import { describe, expect, it } from 'vitest'

import { commentSchema, createCommentSchema } from '../generated-schemas'
import { validateComment } from '../generated-validations'

describe('comment 自動生成テスト', () => {
  describe('Zodスキーマテスト', () => {
    it('正常なcommentデータでバリデーションが通る', () => {
      const validData = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),

        content: '有効なコメント内容',
        authorId: crypto.randomUUID(),
        targetType: 'task',
        targetId: crypto.randomUUID(),
      }

      expect(() => commentSchema.parse(validData)).not.toThrow()
    })

    it('作成用スキーマで正常なデータでバリデーションが通る', () => {
      const validCreateData = {
        content: '有効なコメント内容',
        authorId: crypto.randomUUID(),
        targetType: 'task',
        targetId: crypto.randomUUID(),
      }

      expect(() => createCommentSchema.parse(validCreateData)).not.toThrow()
    })

    it('無効なcommentデータでバリデーションエラーが発生', () => {
      const invalidData = {
        id: 'invalid-uuid',

        content: '',
        authorId: 'invalid-uuid',
        targetType: 'invalid',
        targetId: 'invalid-uuid',
      }

      expect(() => commentSchema.parse(invalidData)).toThrow()
    })
  })

  describe('カスタムバリデーション関数テスト', () => {
    it('validateComment - 正常ケース', () => {
      const validData = {
        content: '有効なコメント内容',
        authorId: crypto.randomUUID(),
        targetType: 'task',
        targetId: crypto.randomUUID(),
      }

      const result = validateComment(validData)
      expect(result.valid).toBe(true)
    })

    it('validateComment - 異常ケース', () => {
      const invalidData = {
        content: '',
        authorId: 'invalid-uuid',
        targetType: 'invalid',
        targetId: 'invalid-uuid',
      }

      const result = validateComment(invalidData)
      expect(result.valid).toBe(false)
      expect(result.message).toBeDefined()
    })
  })
})
