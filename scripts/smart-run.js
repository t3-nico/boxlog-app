#!/usr/bin/env node
/**
 * スマートnpmスクリプトランナー
 *
 * 1Password認証を自動化し、透明な開発体験を提供
 */

const { execSync } = require('child_process')
const fs = require('fs')

const OnePasswordAutomation = require('./1password-automation')

class SmartRunner {
  constructor() {
    this.onePassword = new OnePasswordAutomation()
    this.fallbackMode = false
  }

  /**
   * インテリジェントな実行決定
   */
  async smartRun(scriptName, args = []) {
    console.log(`🚀 Smart running: ${scriptName}`)

    // 1Password利用可能性チェック
    const can1Password = await this.check1PasswordAvailability()

    if (can1Password) {
      console.log('🔐 Using 1Password for secure execution')
      return await this.runWith1Password(scriptName, args)
    } else {
      console.log('⚠️  1Password unavailable, falling back to standard mode')
      return await this.runFallback(scriptName, args)
    }
  }

  /**
   * 1Password利用可能性の確認
   */
  async check1PasswordAvailability() {
    try {
      // 1Password CLI存在確認
      execSync('which op', { stdio: 'pipe' })

      // 認証状態確認
      const authResult = await this.onePassword.ensureAuthentication()

      return authResult
    } catch (error) {
      console.log('ℹ️  1Password CLI not available or not authenticated')
      return false
    }
  }

  /**
   * 1Password付きで実行
   */
  async runWith1Password(scriptName, args) {
    try {
      // 環境変数同期
      await this.onePassword.syncEnvironmentVariables()

      // スクリプト実行
      const command = this.buildCommand(scriptName, args)
      const result = await this.onePassword.runWithSecrets(command, {
        streaming: this.isStreamingCommand(scriptName)
      })

      return result
    } catch (error) {
      console.log('❌ 1Password execution failed, trying fallback...')
      this.fallbackMode = true
      return await this.runFallback(scriptName, args)
    }
  }

  /**
   * フォールバック実行
   */
  async runFallback(scriptName, args) {
    console.log('🔄 Running in fallback mode')

    // .env.localの存在確認
    if (!fs.existsSync('.env.local')) {
      console.log('⚠️  .env.local not found. Creating template...')
      this.createFallbackEnv()
    }

    // フォールバックスクリプト実行
    const fallbackScript = this.getFallbackScript(scriptName)
    const command = this.buildCommand(fallbackScript, args)

    try {
      const result = execSync(command, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
      })

      return result
    } catch (error) {
      console.error(`❌ Fallback execution failed: ${error.message}`)
      throw error
    }
  }

  /**
   * コマンド構築
   */
  buildCommand(scriptName, args) {
    const argString = args.length > 0 ? ` ${args.join(' ')}` : ''
    return `npm run ${scriptName}${argString}`
  }

  /**
   * ストリーミングコマンド判定
   */
  isStreamingCommand(scriptName) {
    const streamingCommands = ['dev', 'start', 'test:watch', 'test:ui']
    return streamingCommands.includes(scriptName)
  }

  /**
   * フォールバックスクリプト名取得
   */
  getFallbackScript(scriptName) {
    const fallbackMap = {
      'dev': 'dev:fallback',
      'build': 'build:fallback',
      'start': 'start:fallback'
    }

    return fallbackMap[scriptName] || scriptName
  }

  /**
   * フォールバック用環境ファイル作成
   */
  createFallbackEnv() {
    const fallbackEnv = `# BoxLog Fallback Environment Variables
# For development without 1Password CLI

# Supabase (use development values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (local development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/boxlog

# AI Services (optional for basic development)
OPENAI_API_KEY=sk-...your-openai-key

# Authentication
NEXTAUTH_SECRET=your-development-secret
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
`

    fs.writeFileSync('.env.local', fallbackEnv)
    console.log('✅ Created .env.local fallback template')
    console.log('📝 Please update with your development values')
  }

  /**
   * 統計情報の収集
   */
  collectStats() {
    const stats = {
      timestamp: new Date().toISOString(),
      mode: this.fallbackMode ? 'fallback' : '1password',
      environment: process.env.NODE_ENV || 'development',
      user: require('os').userInfo().username
    }

    // 統計ログ保存
    const statsLog = JSON.stringify(stats) + '\n'
    fs.appendFileSync('.boxlog-stats.log', statsLog)

    return stats
  }
}

// 使用状況分析
class UsageAnalytics {
  static generateReport() {
    if (!fs.existsSync('.boxlog-stats.log')) {
      console.log('ℹ️  No usage data available')
      return
    }

    const logs = fs.readFileSync('.boxlog-stats.log', 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(Boolean)

    const report = {
      totalRuns: logs.length,
      onePasswordRuns: logs.filter(log => log.mode === '1password').length,
      fallbackRuns: logs.filter(log => log.mode === 'fallback').length,
      environments: {},
      users: {},
      recentActivity: logs.slice(-10)
    }

    // 環境別集計
    logs.forEach(log => {
      report.environments[log.environment] = (report.environments[log.environment] || 0) + 1
      report.users[log.user] = (report.users[log.user] || 0) + 1
    })

    // 成功率計算
    report.onePasswordSuccessRate = Math.round((report.onePasswordRuns / report.totalRuns) * 100)

    console.log('\n📊 BoxLog Smart Runner Usage Report')
    console.log('=====================================')
    console.log(`Total Runs: ${report.totalRuns}`)
    console.log(`1Password Mode: ${report.onePasswordRuns} (${report.onePasswordSuccessRate}%)`)
    console.log(`Fallback Mode: ${report.fallbackRuns} (${100 - report.onePasswordSuccessRate}%)`)
    console.log('\nEnvironments:')
    Object.entries(report.environments).forEach(([env, count]) => {
      console.log(`  ${env}: ${count} runs`)
    })

    // レポートファイル保存
    const reportFile = `smart-runner-report-${new Date().toISOString().split('T')[0]}.json`
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    console.log(`\n📁 Detailed report saved: ${reportFile}`)

    return report
  }
}

// CLI実行
if (require.main === module) {
  const runner = new SmartRunner()
  const command = process.argv[2]
  const args = process.argv.slice(3)

  switch (command) {
    case 'report':
      UsageAnalytics.generateReport()
      break

    case undefined:
      console.log(`
BoxLog Smart Runner

Usage:
  node scripts/smart-run.js <npm-script> [args]
  node scripts/smart-run.js report

Examples:
  node scripts/smart-run.js dev
  node scripts/smart-run.js build
  node scripts/smart-run.js test
  node scripts/smart-run.js report

Features:
  - Automatic 1Password authentication
  - Transparent fallback to standard mode
  - Environment variable synchronization
  - Usage analytics and reporting
`)
      break

    default:
      runner.smartRun(command, args)
        .then(() => {
          runner.collectStats()
          process.exit(0)
        })
        .catch((error) => {
          console.error(`❌ Smart run failed: ${error.message}`)
          runner.collectStats()
          process.exit(1)
        })
  }
}

module.exports = SmartRunner