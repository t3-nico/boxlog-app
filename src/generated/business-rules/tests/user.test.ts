import { describe, expect, it } from 'vitest'

import { createUserSchema, userSchema } from '../generated-schemas'
import { validateUser } from '../generated-validations'

describe('user 自動生成テスト', () => {
  describe('Zodスキーマテスト', () => {
    it('正常なuserデータでバリデーションが通る', () => {
      const validData = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),

        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'user',
      }

      expect(() => userSchema.parse(validData)).not.toThrow()
    })

    it('作成用スキーマで正常なデータでバリデーションが通る', () => {
      const validCreateData = {
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'user',
      }

      expect(() => createUserSchema.parse(validCreateData)).not.toThrow()
    })

    it('無効なuserデータでバリデーションエラーが発生', () => {
      const invalidData = {
        id: 'invalid-uuid',

        email: 'invalid-email',
        name: '',
        role: 'invalid',
      }

      expect(() => userSchema.parse(invalidData)).toThrow()
    })
  })

  describe('カスタムバリデーション関数テスト', () => {
    it('validateUser - 正常ケース', () => {
      const validData = {
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'user',
      }

      const result = validateUser(validData)
      expect(result.valid).toBe(true)
    })

    it('validateUser - 異常ケース', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        role: 'invalid',
      }

      const result = validateUser(invalidData)
      expect(result.valid).toBe(false)
      expect(result.message).toBeDefined()
    })
  })
})
