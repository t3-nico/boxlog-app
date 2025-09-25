#!/usr/bin/env node

/**
 * 🚀 BoxLog Deploy History Tracker
 *
 * デプロイ履歴の自動記録・管理システム
 * - 本番・ステージング環境のデプロイログ管理
 * - ロールバック履歴の追跡
 * - デプロイ統計とパフォーマンス分析
 * - GitHub Actions / Vercel 統合対応
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 設定
const CONFIG = {
  historyFile: path.join(process.cwd(), 'deploy-history.json'),
  backupDir: path.join(process.cwd(), '.deploy-backups'),
  maxHistoryEntries: 1000, // 最大保存件数
  environments: ['production', 'staging', 'preview', 'development'],
}

/**
 * 🎨 カラー出力ヘルパー
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

/**
 * 📁 ディレクトリ作成
 */
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * 📂 デプロイ履歴ファイルの初期化
 */
function initializeHistoryFile() {
  if (!fs.existsSync(CONFIG.historyFile)) {
    const initialData = {
      version: '1.0.0',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalDeploys: 0,
      environments: {},
      deploys: [],
    }

    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(initialData, null, 2))
    console.log(colorize('✅ デプロイ履歴ファイルを初期化しました', 'green'))
  }
}

/**
 * 📋 デプロイ履歴データの読み込み
 */
function loadDeployHistory() {
  try {
    const data = fs.readFileSync(CONFIG.historyFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(colorize(`❌ 履歴ファイル読み込みエラー: ${error.message}`, 'red'))
    return null
  }
}

/**
 * 💾 デプロイ履歴データの保存
 */
function saveDeployHistory(data) {
  try {
    // バックアップ作成
    ensureDirectory(CONFIG.backupDir)
    const backupFile = path.join(CONFIG.backupDir, `deploy-history-${Date.now()}.json`)
    if (fs.existsSync(CONFIG.historyFile)) {
      fs.copyFileSync(CONFIG.historyFile, backupFile)
    }

    // データ更新
    data.lastUpdated = new Date().toISOString()
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(data, null, 2))

    console.log(colorize('✅ デプロイ履歴を保存しました', 'green'))
    return true
  } catch (error) {
    console.error(colorize(`❌ 履歴ファイル保存エラー: ${error.message}`, 'red'))
    return false
  }
}

/**
 * 🔍 Git情報の取得
 */
function getGitInfo() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    const author = execSync('git log -1 --pretty=format:"%an"', { encoding: 'utf8' }).trim()
    const message = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim()
    const timestamp = execSync('git log -1 --pretty=format:"%ci"', { encoding: 'utf8' }).trim()

    return {
      commit: commit.substring(0, 8),
      fullCommit: commit,
      branch,
      author,
      message,
      timestamp: new Date(timestamp).toISOString(),
    }
  } catch (error) {
    console.warn(colorize(`⚠️ Git情報取得エラー: ${error.message}`, 'yellow'))
    return {
      commit: 'unknown',
      fullCommit: 'unknown',
      branch: 'unknown',
      author: 'unknown',
      message: 'unknown',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * 🏷️ バージョン情報の取得
 */
function getVersionInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return {
      version: packageJson.version || '0.0.0',
      name: packageJson.name || 'unknown',
    }
  } catch (error) {
    return {
      version: '0.0.0',
      name: 'unknown',
    }
  }
}

/**
 * 🌍 環境情報の取得
 */
function getEnvironmentInfo() {
  const env = process.env

  // Vercel環境の検出
  if (env.VERCEL) {
    return {
      platform: 'vercel',
      url: env.VERCEL_URL || 'unknown',
      region: env.VERCEL_REGION || 'unknown',
      buildId: env.VERCEL_GITHUB_COMMIT_SHA || env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    }
  }

  // GitHub Actions環境の検出
  if (env.GITHUB_ACTIONS) {
    return {
      platform: 'github-actions',
      workflow: env.GITHUB_WORKFLOW || 'unknown',
      runId: env.GITHUB_RUN_ID || 'unknown',
      actor: env.GITHUB_ACTOR || 'unknown',
    }
  }

  // ローカル環境
  return {
    platform: 'local',
    user: env.USER || env.USERNAME || 'unknown',
    host: env.HOSTNAME || 'localhost',
  }
}

/**
 * 📝 デプロイ記録の追加
 */
function recordDeploy(options = {}) {
  console.log(colorize('🚀 BoxLog Deploy History Tracker', 'bright'))
  console.log(colorize('デプロイ履歴を記録中...', 'dim'))

  initializeHistoryFile()
  const history = loadDeployHistory()
  if (!history) return false

  const gitInfo = getGitInfo()
  const versionInfo = getVersionInfo()
  const environmentInfo = getEnvironmentInfo()
  const environment = options.environment || 'production'

  // デプロイエントリの作成
  const deployEntry = {
    id: `deploy-${Date.now()}`,
    version: versionInfo.version,
    environment,
    timestamp: new Date().toISOString(),
    git: gitInfo,
    platform: environmentInfo,
    deployer: environmentInfo.platform === 'local' ? gitInfo.author : environmentInfo.platform,
    rollbackFrom: options.rollbackFrom || null,
    status: options.status || 'success',
    buildTime: options.buildTime || null,
    notes: options.notes || '',
    tags: options.tags || [],
  }

  // 履歴データの更新
  history.deploys.unshift(deployEntry) // 最新を先頭に
  history.totalDeploys++

  // 環境別統計の更新
  if (!history.environments[environment]) {
    history.environments[environment] = {
      totalDeploys: 0,
      lastDeploy: null,
      successRate: 0,
    }
  }

  history.environments[environment].totalDeploys++
  history.environments[environment].lastDeploy = deployEntry.timestamp

  // 成功率の計算
  const envDeploys = history.deploys.filter((d) => d.environment === environment)
  const successCount = envDeploys.filter((d) => d.status === 'success').length
  history.environments[environment].successRate = ((successCount / envDeploys.length) * 100).toFixed(1)

  // 履歴の制限
  if (history.deploys.length > CONFIG.maxHistoryEntries) {
    history.deploys = history.deploys.slice(0, CONFIG.maxHistoryEntries)
  }

  // 保存
  if (saveDeployHistory(history)) {
    console.log('')
    console.log(colorize('📋 デプロイ記録完了', 'bright'))
    console.log(colorize(`  🏷️  バージョン: ${deployEntry.version}`, 'cyan'))
    console.log(colorize(`  🌍 環境: ${deployEntry.environment}`, 'cyan'))
    console.log(colorize(`  📝 コミット: ${gitInfo.commit}`, 'cyan'))
    console.log(colorize(`  👤 実行者: ${deployEntry.deployer}`, 'cyan'))
    console.log(colorize(`  ⏰ 時刻: ${deployEntry.timestamp}`, 'cyan'))
    if (deployEntry.rollbackFrom) {
      console.log(colorize(`  🔄 ロールバック元: ${deployEntry.rollbackFrom}`, 'yellow'))
    }

    return true
  }

  return false
}

/**
 * 📊 デプロイ統計の表示
 */
function showDeployStats() {
  console.log(colorize('📊 BoxLog Deploy Statistics', 'bright'))
  console.log(colorize('デプロイ統計情報', 'dim'))

  const history = loadDeployHistory()
  if (!history) return

  console.log('')
  console.log(colorize('📈 全体統計', 'blue', true))
  console.log(colorize(`  📦 総デプロイ数: ${history.totalDeploys}`, 'cyan'))
  console.log(colorize(`  📅 最終更新: ${new Date(history.lastUpdated).toLocaleString('ja-JP')}`, 'cyan'))

  // 環境別統計
  console.log('')
  console.log(colorize('🌍 環境別統計', 'blue', true))
  for (const [env, stats] of Object.entries(history.environments)) {
    console.log(colorize(`  ${env.toUpperCase()}`, 'magenta'))
    console.log(colorize(`    📊 デプロイ数: ${stats.totalDeploys}`, 'white'))
    console.log(colorize(`    ✅ 成功率: ${stats.successRate}%`, 'green'))
    if (stats.lastDeploy) {
      console.log(colorize(`    ⏰ 最終デプロイ: ${new Date(stats.lastDeploy).toLocaleString('ja-JP')}`, 'white'))
    }
  }

  // 最近のデプロイ
  console.log('')
  console.log(colorize('🕒 最近のデプロイ (上位10件)', 'blue', true))
  const recentDeploys = history.deploys.slice(0, 10)
  recentDeploys.forEach((deploy, index) => {
    const status = deploy.status === 'success' ? colorize('✅', 'green') : colorize('❌', 'red')
    const rollback = deploy.rollbackFrom ? colorize(' (ロールバック)', 'yellow') : ''
    console.log(`  ${index + 1}. ${status} ${deploy.version} → ${deploy.environment}${rollback}`)
    console.log(colorize(`      🕐 ${new Date(deploy.timestamp).toLocaleString('ja-JP')} by ${deploy.deployer}`, 'dim'))
  })
}

/**
 * 🔄 ロールバック記録
 */
function recordRollback(fromVersion, toVersion, environment = 'production') {
  console.log(colorize('🔄 ロールバック記録中...', 'yellow'))

  return recordDeploy({
    environment,
    rollbackFrom: fromVersion,
    status: 'rollback',
    notes: `Rolled back from ${fromVersion} to ${toVersion}`,
  })
}

/**
 * 📋 デプロイリストの表示
 */
function listDeploys(environment = null, limit = 50) {
  const history = loadDeployHistory()
  if (!history) return

  let deploys = history.deploys
  if (environment) {
    deploys = deploys.filter((d) => d.environment === environment)
  }

  console.log(colorize(`📋 デプロイ履歴${environment ? ` (${environment})` : ''}`, 'bright'))
  console.log(colorize(`上位 ${Math.min(limit, deploys.length)} 件`, 'dim'))
  console.log('')

  deploys.slice(0, limit).forEach((deploy, index) => {
    const status =
      deploy.status === 'success'
        ? colorize('✅', 'green')
        : deploy.status === 'rollback'
          ? colorize('🔄', 'yellow')
          : colorize('❌', 'red')

    console.log(`${index + 1}. ${status} ${deploy.version} (${deploy.git.commit})`)
    console.log(colorize(`   🌍 環境: ${deploy.environment}`, 'cyan'))
    console.log(colorize(`   👤 実行者: ${deploy.deployer}`, 'cyan'))
    console.log(colorize(`   ⏰ 時刻: ${new Date(deploy.timestamp).toLocaleString('ja-JP')}`, 'cyan'))
    console.log(colorize(`   💬 メッセージ: ${deploy.git.message}`, 'dim'))

    if (deploy.rollbackFrom) {
      console.log(colorize(`   🔄 ロールバック元: ${deploy.rollbackFrom}`, 'yellow'))
    }

    if (deploy.notes) {
      console.log(colorize(`   📝 ノート: ${deploy.notes}`, 'dim'))
    }

    console.log('')
  })
}

/**
 * 🧹 古い履歴のクリーンアップ
 */
function cleanupHistory(daysToKeep = 180) {
  const history = loadDeployHistory()
  if (!history) return false

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const originalCount = history.deploys.length
  history.deploys = history.deploys.filter((deploy) => new Date(deploy.timestamp) > cutoffDate)

  const removedCount = originalCount - history.deploys.length

  if (removedCount > 0) {
    console.log(colorize(`🧹 ${removedCount}件の古い履歴を削除しました`, 'green'))
    return saveDeployHistory(history)
  } else {
    console.log(colorize('🧹 削除対象の古い履歴はありませんでした', 'green'))
    return true
  }
}

/**
 * 📤 履歴データのエクスポート
 */
function exportHistory(format = 'json', outputPath = null) {
  const history = loadDeployHistory()
  if (!history) return false

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const defaultPath = `deploy-history-export-${timestamp}.${format}`
  const filePath = outputPath || defaultPath

  try {
    if (format === 'json') {
      fs.writeFileSync(filePath, JSON.stringify(history, null, 2))
    } else if (format === 'csv') {
      const csvHeader = 'Date,Version,Environment,Commit,Author,Status,Notes\n'
      const csvRows = history.deploys
        .map(
          (deploy) =>
            `"${deploy.timestamp}","${deploy.version}","${deploy.environment}","${deploy.git.commit}","${deploy.git.author}","${deploy.status}","${deploy.notes || ''}"`
        )
        .join('\n')

      fs.writeFileSync(filePath, csvHeader + csvRows)
    }

    console.log(colorize(`📤 履歴データをエクスポートしました: ${filePath}`, 'green'))
    return true
  } catch (error) {
    console.error(colorize(`❌ エクスポートエラー: ${error.message}`, 'red'))
    return false
  }
}

/**
 * 🚀 メイン処理
 */
function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'record':
    case 'deploy':
      const environment = args[1] || process.env.DEPLOY_ENV || 'production'
      const buildTime = args.find((arg) => arg.startsWith('--build-time='))?.split('=')[1]
      const notes = args.find((arg) => arg.startsWith('--notes='))?.split('=')[1]
      recordDeploy({
        environment,
        buildTime: buildTime ? parseInt(buildTime) : null,
        notes,
      })
      break

    case 'stats':
    case 'statistics':
      showDeployStats()
      break

    case 'list':
      const env = args[1]
      const limit = parseInt(args[2]) || 50
      listDeploys(env, limit)
      break

    case 'rollback':
      const fromVer = args[1]
      const toVer = args[2]
      const rollbackEnv = args[3] || 'production'
      if (!fromVer || !toVer) {
        console.error(colorize('❌ 使用方法: rollback <from-version> <to-version> [environment]', 'red'))
        process.exit(1)
      }
      recordRollback(fromVer, toVer, rollbackEnv)
      break

    case 'cleanup':
      const days = parseInt(args[1]) || 180
      cleanupHistory(days)
      break

    case 'export':
      const exportFormat = args[1] || 'json'
      const outputPath = args[2]
      exportHistory(exportFormat, outputPath)
      break

    case 'init':
      initializeHistoryFile()
      break

    default:
      console.log(colorize('🚀 BoxLog Deploy History Tracker', 'bright'))
      console.log('')
      console.log('使用方法:')
      console.log(colorize('  init', 'cyan') + '                     - 履歴ファイルの初期化')
      console.log(colorize('  record [env]', 'cyan') + '            - デプロイの記録 (デフォルト: production)')
      console.log(colorize('  stats', 'cyan') + '                   - 統計情報の表示')
      console.log(colorize('  list [env] [limit]', 'cyan') + '      - デプロイ履歴の一覧 (デフォルト: 50件)')
      console.log(colorize('  rollback <from> <to> [env]', 'cyan') + ' - ロールバックの記録')
      console.log(colorize('  cleanup [days]', 'cyan') + '          - 古い履歴の削除 (デフォルト: 180日)')
      console.log(colorize('  export [format] [path]', 'cyan') + '  - 履歴データのエクスポート (json/csv)')
      console.log('')
      console.log('環境変数:')
      console.log('  DEPLOY_ENV - デプロイ環境 (production/staging/preview)')
      break
  }
}

// 実行
if (require.main === module) {
  main()
}

module.exports = {
  recordDeploy,
  showDeployStats,
  listDeploys,
  recordRollback,
  cleanupHistory,
  exportHistory,
  loadDeployHistory,
}
