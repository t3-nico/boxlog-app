import { describe, expect, it } from 'vitest'

import { createProjectSchema, projectSchema } from '../generated-schemas'
import { validateProject } from '../generated-validations'

describe('project 自動生成テスト', () => {
  describe('Zodスキーマテスト', () => {
    it('正常なprojectデータでバリデーションが通る', () => {
      const validData = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),

        name: '有効なプロジェクト',
        description: 'プロジェクトの説明',
        status: 'active',
        ownerId: crypto.randomUUID(),
      }

      expect(() => projectSchema.parse(validData)).not.toThrow()
    })

    it('作成用スキーマで正常なデータでバリデーションが通る', () => {
      const validCreateData = {
        name: '有効なプロジェクト',
        description: 'プロジェクトの説明',
        status: 'active',
        ownerId: crypto.randomUUID(),
      }

      expect(() => createProjectSchema.parse(validCreateData)).not.toThrow()
    })

    it('無効なprojectデータでバリデーションエラーが発生', () => {
      const invalidData = {
        id: 'invalid-uuid',

        name: '',
        status: 'invalid',
        ownerId: 'invalid-uuid',
      }

      expect(() => projectSchema.parse(invalidData)).toThrow()
    })
  })

  describe('カスタムバリデーション関数テスト', () => {
    it('validateProject - 正常ケース', () => {
      const validData = {
        name: '有効なプロジェクト',
        description: 'プロジェクトの説明',
        status: 'active',
        ownerId: crypto.randomUUID(),
      }

      const result = validateProject(validData)
      expect(result.valid).toBe(true)
    })

    it('validateProject - 異常ケース', () => {
      const invalidData = {
        name: '',
        status: 'invalid',
        ownerId: 'invalid-uuid',
      }

      const result = validateProject(invalidData)
      expect(result.valid).toBe(false)
      expect(result.message).toBeDefined()
    })
  })
})
