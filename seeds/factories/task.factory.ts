/**
 * タスクファクトリー
 * Issue #351: テスト用データシード管理システム実装
 */

import { TestTask } from '../test-data'

/**
 * タスクデータファクトリー
 */
export class TaskFactory {
  /**
   * 基本タスク作成
   */
  static create(overrides: Partial<TestTask> = {}): TestTask {
    const now = new Date()
    const randomId = Math.random().toString(36).substr(2, 6)

    return {
      id: crypto.randomUUID(),
      title: `テストタスク${randomId}`,
      description: `テスト用に生成されたタスクです (${randomId})`,
      status: 'todo',
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
      ...overrides
    }
  }

  /**
   * TODO状態のタスク作成
   */
  static createTodo(overrides: Partial<TestTask> = {}): TestTask {
    return this.create({
      status: 'todo',
      title: 'TODO状態のタスク',
      ...overrides
    })
  }

  /**
   * 進行中タスク作成
   */
  static createInProgress(overrides: Partial<TestTask> = {}): TestTask {
    return this.create({
      status: 'in_progress',
      title: '進行中のタスク',
      priority: 'high',
      ...overrides
    })
  }

  /**
   * 完了済みタスク作成
   */
  static createCompleted(overrides: Partial<TestTask> = {}): TestTask {
    return this.create({
      status: 'completed',
      title: '完了済みタスク',
      ...overrides
    })
  }

  /**
   * 高優先度タスク作成
   */
  static createHighPriority(overrides: Partial<TestTask> = {}): TestTask {
    return this.create({
      priority: 'high',
      title: '高優先度タスク',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明日
      ...overrides
    })
  }

  /**
   * 期限付きタスク作成
   */
  static createWithDueDate(daysFromNow: number, overrides: Partial<TestTask> = {}): TestTask {
    return this.create({
      dueDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
      title: `期限付きタスク (${daysFromNow}日後)`,
      ...overrides
    })
  }

  /**
   * 特定ユーザーに割り当てられたタスク作成
   */
  static createAssigned(assigneeId: string, overrides: Partial<TestTask> = {}): TestTask {
    return this.create({
      assigneeId,
      title: '割り当て済みタスク',
      ...overrides
    })
  }

  /**
   * 複数タスク一括作成
   */
  static createMany(count: number, overrides: Partial<TestTask> = {}): TestTask[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        title: `バッチタスク${index + 1}`,
        ...overrides
      })
    )
  }

  /**
   * 各ステータスのタスクセット作成
   */
  static createStatusSet(overrides: Partial<TestTask> = {}): TestTask[] {
    return [
      this.createTodo(overrides),
      this.createInProgress(overrides),
      this.createCompleted(overrides),
      this.create({ status: 'cancelled', title: 'キャンセル済みタスク', ...overrides })
    ]
  }

  /**
   * 各優先度のタスクセット作成
   */
  static createPrioritySet(overrides: Partial<TestTask> = {}): TestTask[] {
    return [
      this.create({ priority: 'low', title: '低優先度タスク', ...overrides }),
      this.create({ priority: 'medium', title: '中優先度タスク', ...overrides }),
      this.createHighPriority(overrides)
    ]
  }
}

export default TaskFactory