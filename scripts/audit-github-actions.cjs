#!/usr/bin/env node
/**
 * GitHub Actions Security Audit Script
 *
 * GitHub Actionsワークフローのセキュリティ検証
 *
 * 検証項目:
 * 1. permissions設定の有無
 * 2. ActionsのSHA固定
 * 3. Secrets直接参照
 * 4. 脆弱な権限設定
 *
 * 実行方法:
 * ```bash
 * npm run security:audit:actions
 * ```
 *
 * @see Issue #500 - GitHub Actionsセキュリティ強化
 */

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

/**
 * 重要度レベル
 */
const SEVERITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
}

/**
 * 検出された問題
 */
const issues = []

/**
 * ワークフローディレクトリ
 */
const WORKFLOW_DIR = path.join(process.cwd(), '.github/workflows')

/**
 * メイン処理
 */
function auditWorkflows() {
  console.log('🔒 GitHub Actions Security Audit')
  console.log('='.repeat(50))
  console.log('')

  // ワークフローファイルの取得
  const files = fs
    .readdirSync(WORKFLOW_DIR)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .filter((file) => !file.startsWith('.')) // 隠しファイル除外

  console.log(`📁 Scanning ${files.length} workflow files...\n`)

  // 各ファイルを検査
  files.forEach((file) => {
    auditWorkflowFile(file)
  })

  // レポート生成
  generateReport(files.length)
}

/**
 * 個別ワークフローファイルの検査
 */
function auditWorkflowFile(filename) {
  const filepath = path.join(WORKFLOW_DIR, filename)
  const content = fs.readFileSync(filepath, 'utf8')

  try {
    const workflow = yaml.parse(content)

    // Check 1: permissions設定確認
    checkPermissions(filename, workflow)

    // Check 2: SHA pinning確認
    checkSHAPinning(filename, content)

    // Check 3: Secrets直接参照確認
    checkSecretsUsage(filename, content, workflow)

    // Check 4: 脆弱な権限設定
    checkDangerousPermissions(filename, workflow)
  } catch (error) {
    issues.push({
      file: filename,
      issue: `YAML parse error: ${error.message}`,
      severity: SEVERITY.HIGH,
      fix: 'Fix YAML syntax errors',
    })
  }
}

/**
 * Check 1: permissions設定の確認
 */
function checkPermissions(filename, workflow) {
  if (!workflow.permissions) {
    issues.push({
      file: filename,
      issue: 'No permissions defined at workflow level',
      severity: SEVERITY.HIGH,
      fix: 'Add explicit permissions block (start with contents: read)',
      example: `permissions:\n  contents: read`,
    })
  }
}

/**
 * Check 2: ActionsのSHA固定確認
 */
function checkSHAPinning(filename, content) {
  // タグ参照のパターン（v1, v2, main, master等）
  const unpinnedPattern = /uses:\s*([^@\s]+)@(v\d+|main|master|latest)/g
  const unpinnedActions = []

  let match
  while ((match = unpinnedPattern.exec(content)) !== null) {
    unpinnedActions.push({
      action: match[1],
      ref: match[2],
      line: content.substring(0, match.index).split('\n').length,
    })
  }

  if (unpinnedActions.length > 0) {
    const actionList = unpinnedActions
      .map((a) => `  - ${a.action}@${a.ref} (line ${a.line})`)
      .join('\n')

    issues.push({
      file: filename,
      issue: `${unpinnedActions.length} action(s) not pinned to SHA`,
      severity: SEVERITY.MEDIUM,
      fix: 'Pin actions to full-length commit SHA',
      example: `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1\n${actionList}`,
    })
  }
}

/**
 * Check 3: Secrets直接参照の確認
 */
function checkSecretsUsage(filename, content, workflow) {
  const hasSecrets = content.includes('${{ secrets.')
  const hasEnvironment = workflow.jobs
    ? Object.values(workflow.jobs).some((job) => job.environment)
    : false

  if (hasSecrets && !hasEnvironment) {
    issues.push({
      file: filename,
      issue: 'Direct secret access without environment protection',
      severity: SEVERITY.LOW,
      fix: 'Consider using environment protection for sensitive secrets',
      example: `jobs:\n  deploy:\n    environment: production  # Add this`,
    })
  }
}

/**
 * Check 4: 脆弱な権限設定の確認
 */
function checkDangerousPermissions(filename, workflow) {
  if (!workflow.permissions) return

  const dangerousPerms = []

  // contents: writeは危険
  if (workflow.permissions.contents === 'write') {
    dangerousPerms.push('contents: write (allows code modification)')
  }

  // packages: writeも注意が必要
  if (workflow.permissions.packages === 'write') {
    dangerousPerms.push('packages: write (allows package publishing)')
  }

  // 全権限付与は禁止
  if (workflow.permissions === 'write-all') {
    dangerousPerms.push('write-all (grants all permissions)')
  }

  if (dangerousPerms.length > 0) {
    issues.push({
      file: filename,
      issue: `Dangerous permissions detected: ${dangerousPerms.join(', ')}`,
      severity: SEVERITY.MEDIUM,
      fix: 'Use minimum required permissions (prefer read-only)',
      example: `permissions:\n  contents: read  # Default to read-only`,
    })
  }
}

/**
 * レポート生成
 */
function generateReport(totalFiles) {
  console.log('📊 Audit Results')
  console.log('='.repeat(50))
  console.log('')

  if (issues.length === 0) {
    console.log('✅ No security issues found!')
    console.log(`   ${totalFiles} workflow files audited`)
    console.log('')
    console.log('🎉 Your GitHub Actions setup follows security best practices!')
    process.exit(0)
  }

  // 重要度別に集計
  const bySeverity = {
    HIGH: issues.filter((i) => i.severity === SEVERITY.HIGH),
    MEDIUM: issues.filter((i) => i.severity === SEVERITY.MEDIUM),
    LOW: issues.filter((i) => i.severity === SEVERITY.LOW),
    INFO: issues.filter((i) => i.severity === SEVERITY.INFO),
  }

  console.log(`Total issues found: ${issues.length}`)
  console.log(`Files audited: ${totalFiles}`)
  console.log('')
  console.log(`🔴 High: ${bySeverity.HIGH.length}`)
  console.log(`🟡 Medium: ${bySeverity.MEDIUM.length}`)
  console.log(`🟢 Low: ${bySeverity.LOW.length}`)
  console.log(`ℹ️  Info: ${bySeverity.INFO.length}`)
  console.log('')

  // 詳細出力
  console.log('Issues found:')
  console.log('')

  ;['HIGH', 'MEDIUM', 'LOW', 'INFO'].forEach((severity) => {
    if (bySeverity[severity].length === 0) return

    bySeverity[severity].forEach(({ file, issue, fix, example }) => {
      const emoji =
        severity === 'HIGH'
          ? '🔴'
          : severity === 'MEDIUM'
            ? '🟡'
            : severity === 'LOW'
              ? '🟢'
              : 'ℹ️ '

      console.log(`${emoji} [${severity}] ${file}`)
      console.log(`   Issue: ${issue}`)
      console.log(`   Fix: ${fix}`)
      if (example) {
        console.log(`   Example:`)
        example.split('\n').forEach((line) => {
          console.log(`     ${line}`)
        })
      }
      console.log('')
    })
  })

  // 終了コード
  if (bySeverity.HIGH.length > 0) {
    console.log('❌ High severity issues found. Please fix them immediately.')
    process.exit(1)
  } else if (bySeverity.MEDIUM.length > 0) {
    console.log('⚠️  Medium severity issues found. Please address them soon.')
    process.exit(1)
  } else {
    console.log('✅ Only low severity issues found. Consider addressing them.')
    process.exit(0)
  }
}

// 実行
try {
  auditWorkflows()
} catch (error) {
  console.error('❌ Audit failed:', error.message)
  process.exit(1)
}
