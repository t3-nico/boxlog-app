/**
 * プロジェクトファクトリー
 * Issue #351: テスト用データシード管理システム実装
 */

import { TestProject } from '../test-data'

/**
 * プロジェクトデータファクトリー
 */
export class ProjectFactory {
  /**
   * 基本プロジェクト作成
   */
  static create(overrides: Partial<TestProject> = {}): TestProject {
    const now = new Date()
    const randomId = Math.random().toString(36).substr(2, 6)

    return {
      id: crypto.randomUUID(),
      name: `テストプロジェクト${randomId}`,
      description: `テスト用に生成されたプロジェクトです (${randomId})`,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      ...overrides
    }
  }

  /**
   * アクティブプロジェクト作成
   */
  static createActive(overrides: Partial<TestProject> = {}): TestProject {
    return this.create({
      status: 'active',
      name: 'アクティブプロジェクト',
      ...overrides
    })
  }

  /**
   * 完了済みプロジェクト作成
   */
  static createCompleted(overrides: Partial<TestProject> = {}): TestProject {
    return this.create({
      status: 'completed',
      name: '完了済みプロジェクト',
      ...overrides
    })
  }

  /**
   * アーカイブ済みプロジェクト作成
   */
  static createArchived(overrides: Partial<TestProject> = {}): TestProject {
    return this.create({
      status: 'archived',
      name: 'アーカイブ済みプロジェクト',
      ...overrides
    })
  }

  /**
   * 特定オーナーのプロジェクト作成
   */
  static createOwned(ownerId: string, overrides: Partial<TestProject> = {}): TestProject {
    return this.create({
      ownerId,
      name: 'オーナー指定プロジェクト',
      ...overrides
    })
  }

  /**
   * 複数プロジェクト一括作成
   */
  static createMany(count: number, overrides: Partial<TestProject> = {}): TestProject[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        name: `バッチプロジェクト${index + 1}`,
        ...overrides
      })
    )
  }

  /**
   * 各ステータスのプロジェクトセット作成
   */
  static createStatusSet(overrides: Partial<TestProject> = {}): TestProject[] {
    return [
      this.createActive(overrides),
      this.createCompleted(overrides),
      this.createArchived(overrides)
    ]
  }
}

export default ProjectFactory