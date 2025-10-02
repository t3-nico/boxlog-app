#!/usr/bin/env node

/**
 * 🔍 Environment Variables Information
 *
 * 現在の環境変数設定の概要を表示し、
 * デバッグやトラブルシューティングを支援します。
 *
 * Usage:
 *   npm run env:info
 */

const fs = require('fs')
const path = require('path')

// カラーコード
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

class EnvInfo {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env')
    this.envLocalPath = path.join(process.cwd(), '.env.local')
    this.envExamplePath = path.join(process.cwd(), '.env.example')
  }

  // 環境変数を安全に表示（機密情報をマスク）
  maskSensitiveValue(key, value) {
    const sensitiveKeys = [
      'PASSWORD',
      'SECRET',
      'KEY',
      'TOKEN',
      'PRIVATE',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_JWT_SECRET',
      'POSTGRES_PASSWORD',
    ]

    const isSensitive = sensitiveKeys.some((sensitiveKey) => key.toUpperCase().includes(sensitiveKey))

    if (isSensitive) {
      if (value.length > 10) {
        return `🔒 ${value.slice(0, 4)}****${value.slice(-4)}`
      } else {
        return '🔒 ****'
      }
    }

    return value
  }

  // ファイルの最終更新日時を取得
  getFileInfo(filePath) {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const stats = fs.statSync(filePath)
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime.toLocaleString('ja-JP'),
    }
  }

  // 環境変数ファイルの内容を解析
  parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { variables: [], comments: [] }
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const variables = []
    const comments = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('#')) {
        if (trimmed.length > 1) {
          comments.push({ line: index + 1, text: trimmed })
        }
      } else if (trimmed.includes('=') && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        variables.push({ key, value, line: index + 1 })
      }
    })

    return { variables, comments }
  }

  // 環境変数の統計を表示
  showFileStatistics() {
    console.log(`${colors.blue}${colors.bold}📊 環境変数ファイルの統計${colors.reset}`)

    const files = [
      { path: this.envExamplePath, name: '.env.example', description: 'テンプレート' },
      { path: this.envPath, name: '.env', description: '開発環境設定' },
      { path: this.envLocalPath, name: '.env.local', description: 'ローカル環境設定' },
    ]

    files.forEach((file) => {
      const info = this.getFileInfo(file.path)
      if (info) {
        const parsed = this.parseEnvFile(file.path)
        console.log(`${colors.cyan}  📄 ${file.name}${colors.reset} (${file.description})`)
        console.log(`     📏 サイズ: ${info.size} bytes`)
        console.log(`     📝 変数数: ${parsed.variables.length}`)
        console.log(`     💬 コメント行: ${parsed.comments.length}`)
        console.log(`     🕒 更新日時: ${info.modified}`)
      } else {
        console.log(`${colors.red}  ❌ ${file.name}${colors.reset} (${file.description}) - 不存在`)
      }
    })
  }

  // 環境変数の詳細情報を表示
  showEnvironmentDetails() {
    console.log(`${colors.blue}${colors.bold}🔍 環境変数の詳細${colors.reset}`)

    // 実際の環境変数（process.env）を表示
    console.log(`${colors.magenta}  🌍 実行時環境変数 (process.env)${colors.reset}`)

    const relevantEnvVars = Object.entries(process.env).filter(
      ([key]) =>
        key.startsWith('NEXT_PUBLIC_') ||
        key.startsWith('POSTGRES_') ||
        key.startsWith('SUPABASE_') ||
        key.includes('APP_URL') ||
        key.includes('NODE_ENV') ||
        key.includes('FEATURE_') ||
        key.includes('VERSION')
    )

    if (relevantEnvVars.length > 0) {
      relevantEnvVars.forEach(([key, value]) => {
        const maskedValue = this.maskSensitiveValue(key, value)
        console.log(`     ${key}: ${colors.yellow}${maskedValue}${colors.reset}`)
      })
    } else {
      console.log(`     ${colors.dim}(関連する環境変数が見つかりません)${colors.reset}`)
    }

    // .env.local の内容を表示
    if (fs.existsSync(this.envLocalPath)) {
      console.log(`${colors.magenta}  📄 .env.local の内容${colors.reset}`)
      const parsed = this.parseEnvFile(this.envLocalPath)
      parsed.variables.forEach((variable) => {
        const maskedValue = this.maskSensitiveValue(variable.key, variable.value)
        console.log(`     ${variable.key}: ${colors.yellow}${maskedValue}${colors.reset}`)
      })
    }
  }


  // トラブルシューティング情報を表示
  showTroubleshooting() {
    console.log(`${colors.blue}${colors.bold}🔧 トラブルシューティング${colors.reset}`)

    const issues = []

    // .envファイルの存在確認
    if (!fs.existsSync(this.envPath) && !fs.existsSync(this.envLocalPath)) {
      issues.push({
        level: 'error',
        message: '.env または .env.local ファイルが見つかりません',
        solution: 'npm run env:setup でテンプレートから作成してください',
      })
    }

    // 必須環境変数のチェック
    const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        issues.push({
          level: 'warning',
          message: `必須環境変数 ${varName} が設定されていません`,
          solution: '.env ファイルで適切な値を設定してください',
        })
      }
    })

    if (issues.length === 0) {
      console.log(`  ${colors.green}✅ 大きな問題は見つかりませんでした${colors.reset}`)
    } else {
      issues.forEach((issue) => {
        const icon = issue.level === 'error' ? '❌' : '⚠️'
        const color = issue.level === 'error' ? colors.red : colors.yellow
        console.log(`  ${color}${icon} ${issue.message}${colors.reset}`)
        console.log(`     💡 ${issue.solution}`)
      })
    }

    console.log(`${colors.blue}  📖 関連コマンド:${colors.reset}`)
    console.log(`     npm run env:setup   - 環境変数ファイルの初期化`)
    console.log(`     npm run env:check   - 環境変数の検証`)
  }

  // メイン実行
  async run() {
    console.log(`${colors.bold}🔍 BoxLog Environment Information${colors.reset}`)
    console.log(`${colors.dim}環境変数の設定状況と統計情報を表示します${colors.reset}`)
    console.log('')

    try {
      this.showFileStatistics()
      console.log('')

      this.showEnvironmentDetails()
      console.log('')

      this.showTroubleshooting()
    } catch (error) {
      console.error(`${colors.red}❌ 情報取得中にエラーが発生しました:${colors.reset}`, error.message)
      process.exit(1)
    }
  }
}

// メイン実行
if (require.main === module) {
  const envInfo = new EnvInfo()
  envInfo.run()
}

module.exports = EnvInfo
