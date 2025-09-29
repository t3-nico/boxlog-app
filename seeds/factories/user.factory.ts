/**
 * ユーザーファクトリー
 * Issue #351: テスト用データシード管理システム実装
 */

import { TestUser } from '../test-data'

/**
 * ユーザーデータファクトリー
 */
export class UserFactory {
  /**
   * 基本ユーザー作成
   */
  static create(overrides: Partial<TestUser> = {}): TestUser {
    const now = new Date()
    const randomId = Math.random().toString(36).substr(2, 8)

    return {
      id: crypto.randomUUID(),
      email: `test-${randomId}@example.com`,
      password: 'test1234',
      name: `テストユーザー${randomId}`,
      role: 'user',
      permissions: ['read', 'create'],
      createdAt: now,
      updatedAt: now,
      ...overrides
    }
  }

  /**
   * 管理者ユーザー作成
   */
  static createAdmin(overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      role: 'admin',
      permissions: ['all', 'create', 'read', 'update', 'delete', 'manage_users', 'manage_system'],
      name: '管理者ユーザー',
      ...overrides
    })
  }

  /**
   * プレミアムユーザー作成
   */
  static createPremium(overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      role: 'premium',
      permissions: ['read', 'create', 'update', 'delete', 'export'],
      name: 'プレミアムユーザー',
      ...overrides
    })
  }

  /**
   * 閲覧専用ユーザー作成
   */
  static createViewer(overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      permissions: ['read'],
      name: '閲覧専用ユーザー',
      ...overrides
    })
  }

  /**
   * 複数ユーザー一括作成
   */
  static createMany(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        name: `バッチユーザー${index + 1}`,
        ...overrides
      })
    )
  }

  /**
   * 特定の権限を持つユーザー作成
   */
  static createWithPermissions(permissions: string[], overrides: Partial<TestUser> = {}): TestUser {
    return this.create({
      permissions,
      ...overrides
    })
  }
}

export default UserFactory