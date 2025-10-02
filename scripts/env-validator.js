#!/usr/bin/env node

/**
 * 🔧 Environment Variables Validator
 *
 * BoxLogアプリケーションの環境変数設定を検証し、
 * 新メンバーのオンボーディングをサポートします。
 *
 * Usage:
 *   npm run env:check
 *   npm run env:validate
 */

const fs = require('fs')
const path = require('path')

// カラーコード
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

// 必須環境変数の定義
const REQUIRED_VARS = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'SupabaseプロジェクトURL',
    example: 'https://your-project-id.supabase.co',
    category: 'Supabase',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase匿名キー',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    category: 'Supabase',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'アプリケーションのベースURL',
    example: 'http://localhost:3000',
    category: 'Application',
  },
]

// オプション環境変数の定義
const OPTIONAL_VARS = [
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabaseサービスロールキー（管理機能用）',
    category: 'Supabase',
  },
  {
    name: 'POSTGRES_URL',
    description: 'PostgreSQL接続URL',
    category: 'Database',
  },
  {
    name: 'FEATURE_DASHBOARD',
    description: 'ダッシュボード機能のフラグ',
    category: 'Features',
  },
  {
    name: 'NODE_ENV',
    description: 'Node.js環境設定',
    category: 'Environment',
  },
]

class EnvValidator {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env')
    this.envLocalPath = path.join(process.cwd(), '.env.local')
    this.envExamplePath = path.join(process.cwd(), '.env.example')
  }

  // 環境変数ファイルの存在確認
  checkEnvFiles() {
    const files = [
      { path: this.envPath, name: '.env', required: false },
      { path: this.envLocalPath, name: '.env.local', required: false },
      { path: this.envExamplePath, name: '.env.example', required: true },
    ]

    console.log(`${colors.blue}${colors.bold}📁 環境変数ファイルの確認${colors.reset}`)

    let hasAnyEnv = false

    files.forEach((file) => {
      const exists = fs.existsSync(file.path)
      const status = exists ? `${colors.green}✅ 存在` : `${colors.red}❌ 不存在`
      console.log(`  ${file.name}: ${status}${colors.reset}`)

      if (exists && (file.name === '.env' || file.name === '.env.local')) {
        hasAnyEnv = true
      }

      if (file.required && !exists) {
        console.log(`${colors.red}❌ 必須ファイル ${file.name} が見つかりません${colors.reset}`)
        process.exit(1)
      }
    })

    if (!hasAnyEnv) {
      console.log(`${colors.yellow}⚠️  .env または .env.local ファイルが見つかりません${colors.reset}`)
      console.log(`${colors.blue}💡 セットアップ: npm run env:setup${colors.reset}`)
    }

    return hasAnyEnv
  }

  // 環境変数の読み込み
  loadEnvVars() {
    const envVars = {}

    // .envを読み込み
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf-8')
      this.parseEnvContent(envContent, envVars)
    }

    // .env.localを読み込み（優先）
    if (fs.existsSync(this.envLocalPath)) {
      const envLocalContent = fs.readFileSync(this.envLocalPath, 'utf-8')
      this.parseEnvContent(envLocalContent, envVars)
    }

    return envVars
  }

  // 環境変数ファイルの内容をパース
  parseEnvContent(content, envVars) {
    const lines = content.split('\n')
    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '') // 引用符を除去
        envVars[key] = value
      }
    })
  }

  // 必須環境変数の検証
  validateRequired(envVars) {
    console.log(`${colors.blue}${colors.bold}🔍 必須環境変数の検証${colors.reset}`)

    let allValid = true
    const categories = {}

    REQUIRED_VARS.forEach((varDef) => {
      if (!categories[varDef.category]) {
        categories[varDef.category] = []
      }
      categories[varDef.category].push(varDef)
    })

    Object.entries(categories).forEach(([category, vars]) => {
      console.log(`${colors.blue}  📋 ${category}${colors.reset}`)

      vars.forEach((varDef) => {
        const value = envVars[varDef.name]
        const isSet = value && value !== '' && !value.includes('your_') && !value.includes('_here')

        if (isSet) {
          console.log(`    ${colors.green}✅ ${varDef.name}${colors.reset}`)
        } else {
          console.log(`    ${colors.red}❌ ${varDef.name}${colors.reset}`)
          console.log(`       📖 ${varDef.description}`)
          console.log(`       💡 例: ${colors.yellow}${varDef.example}${colors.reset}`)
          allValid = false
        }
      })
    })

    return allValid
  }

  // オプション環境変数の表示
  showOptional(envVars) {
    console.log(`${colors.blue}${colors.bold}⚙️ オプション環境変数の状態${colors.reset}`)

    const categories = {}
    OPTIONAL_VARS.forEach((varDef) => {
      if (!categories[varDef.category]) {
        categories[varDef.category] = []
      }
      categories[varDef.category].push(varDef)
    })

    Object.entries(categories).forEach(([category, vars]) => {
      console.log(`${colors.blue}  📋 ${category}${colors.reset}`)

      vars.forEach((varDef) => {
        const value = envVars[varDef.name]
        const isSet = value && value !== ''

        if (isSet) {
          console.log(`    ${colors.green}✅ ${varDef.name}${colors.reset}`)
        } else {
          console.log(`    ${colors.yellow}➖ ${varDef.name} (未設定)${colors.reset}`)
          console.log(`       📖 ${varDef.description}`)
        }
      })
    })
  }

  // セットアップガイダンス
  showGuidance(allValid) {
    console.log(`${colors.blue}${colors.bold}📚 セットアップガイダンス${colors.reset}`)

    if (!allValid) {
      console.log(`${colors.red}❌ 必須環境変数が不足しています${colors.reset}`)
      console.log('')
      console.log('🚀 セットアップ手順:')
      console.log(`1. ${colors.blue}npm run env:setup${colors.reset} - .env.exampleから.envを作成`)
      console.log(`2. .env ファイルを編集して適切な値を設定`)
      console.log(`3. ${colors.blue}npm run env:check${colors.reset} - 再度検証`)
      console.log('')
      console.log('📖 詳細ドキュメント:')
      console.log('  - .env.example - 設定例と説明')
    } else {
      console.log(`${colors.green}✅ すべての必須環境変数が設定されています！${colors.reset}`)
      console.log('')
      console.log('🚀 次のステップ:')
      console.log(`  ${colors.blue}npm install${colors.reset} - 依存関係のインストール`)
      console.log(`  ${colors.blue}npm run dev${colors.reset} - 開発サーバーの起動`)
    }
  }

  // メイン実行
  async run() {
    console.log(`${colors.bold}🔧 BoxLog Environment Validator${colors.reset}`)
    console.log('')

    try {
      const hasEnvFiles = this.checkEnvFiles()
      console.log('')

      if (hasEnvFiles) {
        const envVars = this.loadEnvVars()
        const allValid = this.validateRequired(envVars)
        console.log('')

        this.showOptional(envVars)
        console.log('')

        this.showGuidance(allValid)

        process.exit(allValid ? 0 : 1)
      } else {
        console.log(`${colors.yellow}⚠️  環境変数ファイルが見つからないため、検証をスキップします${colors.reset}`)
        this.showGuidance(false)
        process.exit(1)
      }
    } catch (error) {
      console.error(`${colors.red}❌ 検証中にエラーが発生しました:${colors.reset}`, error.message)
      process.exit(1)
    }
  }
}

// メイン実行
if (require.main === module) {
  const validator = new EnvValidator()
  validator.run()
}

module.exports = EnvValidator
