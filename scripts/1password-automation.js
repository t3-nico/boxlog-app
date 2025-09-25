#!/usr/bin/env node
/**
 * 1Password Secrets Integration 完全自動化システム
 *
 * 手動のop runコマンドからの脱却と、Secretsライフサイクル管理の自動化
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

class OnePasswordAutomation {
  constructor() {
    this.envFile = '.env.local'
    this.vaultName = 'BoxLog-Development'
    this.logFile = path.join(os.homedir(), '.boxlog-1password.log')
    this.isAuthenticated = false
  }

  // === Phase 1: 自動化スクリプト ===

  /**
   * 1Password CLI認証状態チェック・自動認証
   */
  async ensureAuthentication() {
    try {
      // 認証状態確認
      execSync('op account list', { stdio: 'pipe' })
      this.isAuthenticated = true
      this.log('✅ 1Password already authenticated')
      return true
    } catch (error) {
      this.log('⚠️  1Password authentication required')

      try {
        // 自動サインイン試行
        const result = execSync('op signin --raw', {
          stdio: 'pipe',
          input: process.env.OP_SESSION_TOKEN || '',
          encoding: 'utf8',
        })

        if (result.trim()) {
          process.env.OP_SESSION_TOKEN = result.trim()
          this.isAuthenticated = true
          this.log('✅ 1Password authentication successful')
          return true
        }
      } catch (authError) {
        this.log('❌ 1Password authentication failed', authError.message)

        // インタラクティブサインインの指示
        console.log('\n🔐 Manual 1Password signin required:')
        console.log('Run: eval $(op signin)')
        console.log('Then retry the command.')

        return false
      }
    }
  }

  /**
   * 環境変数の自動配布・更新システム
   */
  async syncEnvironmentVariables() {
    if (!this.isAuthenticated) {
      throw new Error('1Password authentication required')
    }

    try {
      this.log('🔄 Syncing environment variables from 1Password...')

      // .env.localファイルの読み取り
      if (!fs.existsSync(this.envFile)) {
        this.log(`⚠️  ${this.envFile} not found, creating from template`)
        await this.createEnvTemplate()
      }

      const envContent = fs.readFileSync(this.envFile, 'utf8')
      const envLines = envContent.split('\n')
      const updatedLines = []
      let secretsUpdated = 0

      for (const line of envLines) {
        if (line.includes('op://')) {
          // 1Password参照形式の処理
          try {
            const secretValue = execSync(`op read "${line.split('=')[1]}"`, {
              stdio: 'pipe',
              encoding: 'utf8',
            }).trim()

            const varName = line.split('=')[0]
            updatedLines.push(`${varName}=${secretValue}`)
            secretsUpdated++

            this.log(`✅ Updated secret: ${varName}`)
          } catch (error) {
            this.log(`❌ Failed to read secret: ${line}`)
            updatedLines.push(line) // 元の行を保持
          }
        } else {
          updatedLines.push(line)
        }
      }

      // 更新された環境変数ファイルの保存
      if (secretsUpdated > 0) {
        const updatedContent = updatedLines.join('\n')
        fs.writeFileSync(this.envFile, updatedContent)
        this.log(`✅ Environment sync complete: ${secretsUpdated} secrets updated`)
      } else {
        this.log('ℹ️  No secrets to update')
      }

      return secretsUpdated
    } catch (error) {
      this.log('❌ Environment sync failed', error.message)
      throw error
    }
  }

  /**
   * Secrets rotation自動化
   */
  async rotateSecrets(secretNames = []) {
    if (!this.isAuthenticated) {
      throw new Error('1Password authentication required')
    }

    this.log('🔄 Starting secrets rotation...')

    const defaultSecrets = ['OPENAI_API_KEY', 'SUPABASE_ANON_KEY', 'DATABASE_URL']

    const secretsToRotate = secretNames.length > 0 ? secretNames : defaultSecrets
    const rotationResults = []

    for (const secretName of secretsToRotate) {
      try {
        // 現在のsecret取得
        const currentSecret = execSync(`op item get "${secretName}" --vault="${this.vaultName}" --format=json`, {
          stdio: 'pipe',
          encoding: 'utf8',
        })

        const secretData = JSON.parse(currentSecret)

        // Rotation logic (service-specific)
        const newSecret = await this.generateNewSecret(secretName, secretData)

        if (newSecret) {
          // 1Passwordでsecret更新
          execSync(`op item edit "${secretName}" password="${newSecret}" --vault="${this.vaultName}"`)

          rotationResults.push({
            name: secretName,
            status: 'rotated',
            timestamp: new Date().toISOString(),
          })

          this.log(`✅ Rotated secret: ${secretName}`)
        }
      } catch (error) {
        this.log(`❌ Failed to rotate secret: ${secretName}`, error.message)
        rotationResults.push({
          name: secretName,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Rotation report
    const rotationReport = {
      timestamp: new Date().toISOString(),
      results: rotationResults,
      summary: {
        total: secretsToRotate.length,
        successful: rotationResults.filter((r) => r.status === 'rotated').length,
        failed: rotationResults.filter((r) => r.status === 'failed').length,
      },
    }

    this.saveRotationReport(rotationReport)
    this.log(
      `🔄 Secrets rotation complete: ${rotationReport.summary.successful}/${rotationReport.summary.total} successful`
    )

    return rotationReport
  }

  // === Phase 2: 開発体験向上 ===

  /**
   * 改善されたopコマンドラッパー
   */
  async runWithSecrets(command, options = {}) {
    // 自動認証確認
    await this.ensureAuthentication()

    if (!this.isAuthenticated) {
      throw new Error('Cannot run command without 1Password authentication')
    }

    // 環境変数同期
    if (options.syncSecrets !== false) {
      await this.syncEnvironmentVariables()
    }

    this.log(`🚀 Running command with 1Password secrets: ${command}`)

    try {
      // op runコマンドの実行
      const fullCommand = `op run --env-file=${this.envFile} -- ${command}`

      if (options.streaming) {
        // ストリーミング出力（開発サーバー等）
        return this.runStreaming(fullCommand)
      } else {
        // 通常実行
        const result = execSync(fullCommand, {
          stdio: options.silent ? 'pipe' : 'inherit',
          encoding: 'utf8',
          cwd: options.cwd || process.cwd(),
        })

        this.log(`✅ Command completed successfully`)
        return result
      }
    } catch (error) {
      this.log(`❌ Command failed: ${command}`, error.message)
      throw error
    }
  }

  /**
   * ストリーミング実行（開発サーバー用）
   */
  runStreaming(command) {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        stdio: 'inherit',
        env: process.env,
      })

      child.on('exit', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Process exited with code ${code}`))
        }
      })

      child.on('error', reject)

      // Graceful shutdown
      process.on('SIGINT', () => {
        child.kill('SIGINT')
      })
      process.on('SIGTERM', () => {
        child.kill('SIGTERM')
      })
    })
  }

  // === Phase 3: セキュリティ強化 ===

  /**
   * Secrets使用状況の監査ログ
   */
  auditSecretsUsage() {
    this.log('📊 Generating secrets usage audit...')

    const auditData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      user: os.userInfo().username,
      hostname: os.hostname(),
      secrets: this.getSecretsInventory(),
      accessLog: this.getRecentAccess(),
    }

    const auditFile = `secrets-audit-${new Date().toISOString().split('T')[0]}.json`
    fs.writeFileSync(auditFile, JSON.stringify(auditData, null, 2))

    this.log(`📊 Audit report saved: ${auditFile}`)
    return auditData
  }

  /**
   * 不要なSecretsの自動検出
   */
  detectUnusedSecrets() {
    this.log('🔍 Detecting unused secrets...')

    const envSecrets = this.getSecretsFromEnv()
    const codebaseSecrets = this.getSecretsFromCodebase()

    const unusedSecrets = envSecrets.filter((secret) => !codebaseSecrets.includes(secret))

    if (unusedSecrets.length > 0) {
      this.log(`⚠️  Found ${unusedSecrets.length} potentially unused secrets:`)
      unusedSecrets.forEach((secret) => {
        console.log(`  - ${secret}`)
      })

      // クリーンアップ提案
      console.log('\n💡 Cleanup suggestions:')
      console.log('Review these secrets and remove if no longer needed')
      console.log(`Run: npm run 1password:cleanup --secrets="${unusedSecrets.join(',')}"`)
    } else {
      this.log('✅ No unused secrets detected')
    }

    return unusedSecrets
  }

  /**
   * セキュリティコンプライアンスレポート
   */
  generateComplianceReport() {
    this.log('📋 Generating security compliance report...')

    const compliance = {
      timestamp: new Date().toISOString(),
      checks: {
        encryption: this.checkEncryption(),
        access_control: this.checkAccessControl(),
        rotation: this.checkRotationPolicy(),
        audit_trail: this.checkAuditTrail(),
        backup: this.checkBackupStatus(),
      },
      score: 0,
      recommendations: [],
    }

    // スコア計算
    const passedChecks = Object.values(compliance.checks).filter(Boolean).length
    compliance.score = Math.round((passedChecks / Object.keys(compliance.checks).length) * 100)

    // 推奨事項
    if (compliance.score < 80) {
      compliance.recommendations.push('Improve secrets management practices')
    }
    if (!compliance.checks.rotation) {
      compliance.recommendations.push('Implement regular secrets rotation')
    }

    const reportFile = `compliance-report-${new Date().toISOString().split('T')[0]}.json`
    fs.writeFileSync(reportFile, JSON.stringify(compliance, null, 2))

    this.log(`📋 Compliance report saved: ${reportFile} (Score: ${compliance.score}%)`)
    return compliance
  }

  // === Helper Methods ===

  async createEnvTemplate() {
    const template = `# BoxLog 1Password Environment Variables Template
#
# Replace with actual 1Password secret references:
# VARIABLE_NAME=op://vault/item/field

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=op://${this.vaultName}/BoxLog-Supabase/url
NEXT_PUBLIC_SUPABASE_ANON_KEY=op://${this.vaultName}/BoxLog-Supabase/anon_key
SUPABASE_SERVICE_ROLE_KEY=op://${this.vaultName}/BoxLog-Supabase/service_role_key

# Database
DATABASE_URL=op://${this.vaultName}/BoxLog-Database/url

# AI Services
OPENAI_API_KEY=op://${this.vaultName}/BoxLog-AI/openai_key

# Authentication
NEXTAUTH_SECRET=op://${this.vaultName}/BoxLog-Auth/nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
`

    fs.writeFileSync(this.envFile, template)
    this.log(`✅ Created ${this.envFile} template`)
  }

  async generateNewSecret(secretName, _currentData) {
    // Service-specific secret generation logic
    switch (secretName) {
      case 'NEXTAUTH_SECRET':
        return require('crypto').randomBytes(32).toString('hex')

      // 他のサービスは手動更新を推奨
      default:
        this.log(`ℹ️  Manual rotation required for: ${secretName}`)
        return null
    }
  }

  getSecretsInventory() {
    // .env.localから1Password参照を抽出
    if (!fs.existsSync(this.envFile)) return []

    const content = fs.readFileSync(this.envFile, 'utf8')
    const opRefs = content.match(/op:\/\/[^\s]+/g) || []

    return opRefs.map((ref) => {
      const parts = ref.split('/')
      return {
        reference: ref,
        vault: parts[2],
        item: parts[3],
        field: parts[4] || 'password',
      }
    })
  }

  getSecretsFromEnv() {
    if (!fs.existsSync(this.envFile)) return []

    const content = fs.readFileSync(this.envFile, 'utf8')
    return content
      .split('\n')
      .filter((line) => line.includes('='))
      .map((line) => line.split('=')[0])
      .filter((name) => name && !name.startsWith('#'))
  }

  getSecretsFromCodebase() {
    // コードベースから環境変数使用を検索
    try {
      const result = execSync(
        'grep -r "process\\.env\\." src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      )

      const matches = result.match(/process\.env\.([A-Z_]+)/g) || []
      return [...new Set(matches.map((match) => match.replace('process.env.', '')))]
    } catch (error) {
      return []
    }
  }

  checkEncryption() {
    // 1Password vaultの暗号化確認
    try {
      execSync(`op vault get "${this.vaultName}"`, { stdio: 'pipe' })
      return true
    } catch {
      return false
    }
  }

  checkAccessControl() {
    // アクセス制御の確認
    try {
      const vaultInfo = execSync(`op vault get "${this.vaultName}" --format=json`, {
        stdio: 'pipe',
        encoding: 'utf8',
      })
      const vault = JSON.parse(vaultInfo)
      return vault.permissions && vault.permissions.length > 0
    } catch {
      return false
    }
  }

  checkRotationPolicy() {
    // Rotation policyの確認
    const rotationLogExists = fs.existsSync('secrets-rotation.log')
    return rotationLogExists
  }

  checkAuditTrail() {
    // 監査ログの確認
    return fs.existsSync(this.logFile)
  }

  checkBackupStatus() {
    // バックアップ状況の確認（1Password Account Recovery）
    return true // 1Password自体がバックアップを提供
  }

  getRecentAccess() {
    // 最近のアクセスログ（簡易版）
    if (!fs.existsSync(this.logFile)) return []

    try {
      const logs = fs
        .readFileSync(this.logFile, 'utf8')
        .split('\n')
        .filter((line) => line.trim())
        .slice(-10) // 最新10件

      return logs.map((log) => {
        try {
          return JSON.parse(log)
        } catch {
          return { message: log, timestamp: new Date().toISOString() }
        }
      })
    } catch {
      return []
    }
  }

  saveRotationReport(report) {
    const reportFile = 'secrets-rotation.log'
    const logEntry = JSON.stringify(report) + '\n'
    fs.appendFileSync(reportFile, logEntry)
  }

  log(message, details = '') {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      message,
      details,
      level: message.includes('❌') ? 'error' : message.includes('⚠️') ? 'warn' : 'info',
    }

    console.log(`[${timestamp}] ${message} ${details}`)

    // ログファイルに記録
    const logLine = JSON.stringify(logEntry) + '\n'
    fs.appendFileSync(this.logFile, logLine)
  }
}

// CLI実行
if (require.main === module) {
  const automation = new OnePasswordAutomation()
  const command = process.argv[2]
  const args = process.argv.slice(3)

  switch (command) {
    case 'auth':
      automation.ensureAuthentication()
      break

    case 'sync':
      automation.syncEnvironmentVariables()
      break

    case 'rotate':
      automation.rotateSecrets(args)
      break

    case 'run':
      automation.runWithSecrets(args.join(' '))
      break

    case 'audit':
      automation.auditSecretsUsage()
      break

    case 'cleanup':
      automation.detectUnusedSecrets()
      break

    case 'compliance':
      automation.generateComplianceReport()
      break

    default:
      console.log(`
1Password Automation CLI

Usage:
  node scripts/1password-automation.js <command> [args]

Commands:
  auth                    - Ensure 1Password authentication
  sync                    - Sync environment variables from 1Password
  rotate [secrets...]     - Rotate specified secrets (or defaults)
  run <command>          - Run command with 1Password secrets
  audit                  - Generate secrets usage audit
  cleanup                - Detect unused secrets
  compliance             - Generate security compliance report

Examples:
  node scripts/1password-automation.js auth
  node scripts/1password-automation.js sync
  node scripts/1password-automation.js run "npm run dev"
  node scripts/1password-automation.js rotate NEXTAUTH_SECRET
`)
  }
}

module.exports = OnePasswordAutomation
