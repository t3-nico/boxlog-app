/**
 * クイックシードスクリプト
 * Issue #351: テスト用データシード管理システム実装
 *
 * 最小限のテストデータを素早く生成するスクリプト
 */

import { ProjectFactory } from '../factories/project.factory'
import { TaskFactory } from '../factories/task.factory'
import { UserFactory } from '../factories/user.factory'

/**
 * クイックシード実行（最小限のデータ）
 */
export async function runQuickSeed(): Promise<void> {
  console.log('🚀 クイックシード実行中...')

  try {
    // 基本ユーザー作成
    const admin = UserFactory.createAdmin({ email: 'admin@test.local' })
    const user = UserFactory.create({ email: 'user@test.local' })

    console.log('👥 ユーザー作成完了:')
    console.log(`  - ${admin.name} (${admin.email})`)
    console.log(`  - ${user.name} (${user.email})`)

    // 基本タスク作成
    const tasks = [
      TaskFactory.createTodo({ assigneeId: user.id } as Parameters<typeof TaskFactory.createTodo>[0]),
      TaskFactory.createInProgress({ assigneeId: admin.id } as Parameters<typeof TaskFactory.createInProgress>[0]),
      TaskFactory.createCompleted()
    ]

    console.log('📋 タスク作成完了:')
    tasks.forEach((task, index) => {
      console.log(`  - ${index + 1}. ${task.title} [${task.status}]`)
    })

    // 基本プロジェクト作成
    const project = ProjectFactory.createActive({ ownerId: admin.id } as Parameters<typeof ProjectFactory.createActive>[0])

    console.log('📁 プロジェクト作成完了:')
    console.log(`  - ${project.name} [${project.status}]`)

    console.log('✅ クイックシード完了!')

  } catch (error) {
    console.error('❌ クイックシード実行に失敗しました:', error)
    throw error
  }
}

/**
 * CLI実行
 */
if (require.main === module) {
  runQuickSeed().catch(error => {
    console.error('クイックシード実行に失敗しました:', error)
    process.exit(1)
  })
}

export default runQuickSeed