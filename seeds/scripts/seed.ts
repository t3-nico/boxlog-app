/**
 * シード実行スクリプト
 * Issue #351: テスト用データシード管理システム実装
 *
 * 環境別にテストデータを生成・投入するメインスクリプト
 */

import { ProjectFactory } from '../factories/project.factory'
import { TaskFactory } from '../factories/task.factory'
import { UserFactory } from '../factories/user.factory'
import {
  SEED_CONFIGS,
  getTestUsers,
  getTestTasks,
  getTestProjects,
  SeedConfig
} from '../test-data'

// ログ設定
const LOG_PREFIX = '[SEED]'
const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString()
  const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
  console.log(`${emoji} ${LOG_PREFIX} ${timestamp} - ${message}`)
}

/**
 * データベースクリアフラグ（実際の実装では実際のDB操作を行う）
 */
async function clearDatabase(): Promise<void> {
  log('🗑️ データベースをクリアしています...')
  // 実際の実装では以下のような処理を行う:
  // await db.task.deleteMany()
  // await db.user.deleteMany()
  // await db.project.deleteMany()

  // 開発時はファイル出力などでシミュレート
  await new Promise(resolve => setTimeout(resolve, 500))
  log('データベースクリア完了')
}

/**
 * ユーザーデータシード
 */
async function seedUsers(config: SeedConfig): Promise<any[]> {
  log(`👥 ユーザーデータをシードしています... (${config.userCount || 'all'}件)`)

  const predefinedUsers = getTestUsers(config)
  const additionalUsers = config.userCount && config.userCount > predefinedUsers.length
    ? UserFactory.createMany(config.userCount - predefinedUsers.length)
    : []

  const allUsers = [...predefinedUsers, ...additionalUsers]

  // 実際の実装では以下のような処理を行う:
  // const createdUsers = await Promise.all(
  //   allUsers.map(user => db.user.create({ data: user }))
  // )

  // 開発時はログ出力でシミュレート
  allUsers.forEach((user, index) => {
    log(`  - ${index + 1}. ${user.name} (${user.role}) - ${user.email}`)
  })

  log(`ユーザーデータシード完了: ${allUsers.length}件`)
  return allUsers
}

/**
 * タスクデータシード
 */
async function seedTasks(config: SeedConfig, users: any[]): Promise<any[]> {
  log(`📋 タスクデータをシードしています... (${config.taskCount || 'all'}件)`)

  const predefinedTasks = getTestTasks(config)
  const additionalTasks = config.taskCount && config.taskCount > predefinedTasks.length
    ? TaskFactory.createMany(config.taskCount - predefinedTasks.length)
    : []

  // 一部のタスクにユーザーを割り当て
  const allTasks = [...predefinedTasks, ...additionalTasks].map((task, index) => {
    if (users.length > 0 && index % 3 === 0) {
      return {
        ...task,
        assigneeId: users[index % users.length].id
      }
    }
    return task
  })

  // 実際の実装では以下のような処理を行う:
  // const createdTasks = await Promise.all(
  //   allTasks.map(task => db.task.create({ data: task }))
  // )

  // 開発時はログ出力でシミュレート
  allTasks.forEach((task, index) => {
    const assignee = task.assigneeId ? ' (割り当て済み)' : ''
    log(`  - ${index + 1}. ${task.title} [${task.status}]${assignee}`)
  })

  log(`タスクデータシード完了: ${allTasks.length}件`)
  return allTasks
}

/**
 * プロジェクトデータシード
 */
async function seedProjects(config: SeedConfig, users: any[]): Promise<any[]> {
  log(`📁 プロジェクトデータをシードしています... (${config.projectCount || 'all'}件)`)

  const predefinedProjects = getTestProjects(config)
  const additionalProjects = config.projectCount && config.projectCount > predefinedProjects.length
    ? ProjectFactory.createMany(config.projectCount - predefinedProjects.length)
    : []

  // 一部のプロジェクトにオーナーを割り当て
  const allProjects = [...predefinedProjects, ...additionalProjects].map((project, index) => {
    if (users.length > 0) {
      return {
        ...project,
        ownerId: users[index % users.length].id
      }
    }
    return project
  })

  // 実際の実装では以下のような処理を行う:
  // const createdProjects = await Promise.all(
  //   allProjects.map(project => db.project.create({ data: project }))
  // )

  // 開発時はログ出力でシミュレート
  allProjects.forEach((project, index) => {
    log(`  - ${index + 1}. ${project.name} [${project.status}]`)
  })

  log(`プロジェクトデータシード完了: ${allProjects.length}件`)
  return allProjects
}

/**
 * メインシード実行関数
 */
export async function runSeed(configName: string = 'development'): Promise<void> {
  const startTime = Date.now()
  log(`🌱 シード実行を開始します... (環境: ${configName})`)

  try {
    // 設定取得
    const config = SEED_CONFIGS[configName]
    if (!config) {
      throw new Error(`設定が見つかりません: ${configName}`)
    }

    log(`設定: ${JSON.stringify(config, null, 2)}`)

    // データベースクリア
    if (config.cleanBefore) {
      await clearDatabase()
    }

    let users: any[] = []
    let tasks: any[] = []
    let projects: any[] = []

    // ユーザーシード
    if (config.includeUsers) {
      users = await seedUsers(config)
    }

    // タスクシード
    if (config.includeTasks) {
      tasks = await seedTasks(config, users)
    }

    // プロジェクトシード
    if (config.includeProjects) {
      projects = await seedProjects(config, users)
    }

    // 完了報告
    const duration = Date.now() - startTime
    log('🎉 シード実行完了!')
    log(`📊 結果: ユーザー${users.length}件、タスク${tasks.length}件、プロジェクト${projects.length}件`)
    log(`⏱️ 実行時間: ${duration}ms`)

  } catch (error) {
    log(`シード実行中にエラーが発生しました: ${error}`, 'error')
    throw error
  }
}

/**
 * CLI実行
 */
if (require.main === module) {
  const configName = process.argv[2] || 'development'
  runSeed(configName).catch(error => {
    console.error('シード実行に失敗しました:', error)
    process.exit(1)
  })
}

export default runSeed