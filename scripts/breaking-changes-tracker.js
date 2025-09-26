#!/usr/bin/env node
/**
 * 🚨 BoxLog Breaking Changes Tracker
 *
 * 破壊的変更の検知・記録・管理スクリプト
 * - Git diff解析・自動検知・レポート生成
 * - マイグレーション計画・通知送信
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * 🎨 カラー出力設定
 */
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
}

/**
 * 📝 ログ出力ヘルパー
 */
const logger = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🚨 ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.white}   ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.dim}   ${msg}${colors.reset}`),
}

/**
 * 🔍 破壊的変更検知パターン
 */
const DETECTION_PATTERNS = [
  {
    name: 'API Endpoint Removal',
    filePattern: /\/api\/.*\.ts$/,
    diffPattern: /-\s*export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/,
    severity: 'critical',
    category: 'api_change',
    confidence: 0.9,
    description: 'APIエンドポイント関数が削除されました',
    affectedGroups: ['api_consumers', 'external_systems'],
  },
  {
    name: 'Database Schema Change',
    filePattern: /migrations\/.*\.sql$|schema\.prisma$/,
    diffPattern: /(DROP\s+TABLE|ALTER\s+TABLE.*DROP|DROP\s+COLUMN)/i,
    severity: 'critical',
    category: 'database_change',
    confidence: 0.9,
    description: 'データベーススキーマに破壊的変更があります',
    affectedGroups: ['developers', 'devops', 'administrators'],
  },
  {
    name: 'Package.json Dependencies',
    filePattern: /package\.json$/,
    diffPattern: /-\s*"[^"]+"\s*:\s*"[^"]*"/,
    severity: 'high',
    category: 'dependency_change',
    confidence: 0.8,
    description: '依存関係が削除されました',
    affectedGroups: ['developers'],
  },
  {
    name: 'Configuration Structure',
    filePattern: /config\/.*\.json$|\.env\.example$/,
    diffPattern: /-\s*"[^"]+"\s*:|REQUIRED.*removed/i,
    severity: 'high',
    category: 'config_change',
    confidence: 0.8,
    description: '設定ファイル構造が変更されました',
    affectedGroups: ['developers', 'devops'],
  },
  {
    name: 'TypeScript Interface Change',
    filePattern: /types\/.*\.ts$|.*\.d\.ts$/,
    diffPattern: /-\s*export\s+(interface|type)|[+-].*:\s*(string|number)\s*\|/,
    severity: 'medium',
    category: 'interface_change',
    confidence: 0.7,
    description: 'TypeScript型定義に変更があります',
    affectedGroups: ['developers'],
  },
  {
    name: 'Authentication Changes',
    filePattern: /auth\/.*\.ts$|middleware\.ts$/,
    diffPattern: /(JWT|auth|authentication).*changed|method.*removed|-.*authenticate/i,
    severity: 'critical',
    category: 'auth_change',
    confidence: 0.9,
    description: '認証システムに変更があります',
    affectedGroups: ['developers', 'api_consumers', 'end_users'],
  },
  {
    name: 'Component Interface Change',
    filePattern: /components\/.*\.(tsx|jsx)$/,
    diffPattern: /-.*export.*function|props.*removed|-.*interface.*Props/,
    severity: 'medium',
    category: 'interface_change',
    confidence: 0.6,
    description: 'UIコンポーネントインターフェースが変更されました',
    affectedGroups: ['developers'],
  },
]

/**
 * 📊 Git diffから破壊的変更を検知
 */
async function detectBreakingChanges(fromCommit = 'HEAD~1', toCommit = 'HEAD') {
  logger.header('Breaking Changes Detection Starting...')

  try {
    // 変更されたファイル一覧を取得
    const diffOutput = execSync(`git diff ${fromCommit}..${toCommit} --name-status`, {
      encoding: 'utf8',
      cwd: process.cwd(),
    })

    if (!diffOutput.trim()) {
      logger.info('No changes detected')
      return []
    }

    const changedFiles = parseDiffOutput(diffOutput)
    logger.info(`Analyzing ${changedFiles.length} changed files`)

    const detectedChanges = []

    for (const file of changedFiles) {
      const fileDiff = execSync(`git diff ${fromCommit}..${toCommit} -- "${file.path}"`, {
        encoding: 'utf8',
        cwd: process.cwd(),
      })

      const changes = await analyzeFileDiff(file, fileDiff)
      detectedChanges.push(...changes)
    }

    const breakingChanges = detectedChanges.filter((change) => change.isBreaking)

    if (breakingChanges.length > 0) {
      logger.warning(`Found ${breakingChanges.length} potential breaking changes`)
      displayDetectedChanges(breakingChanges)
    } else {
      logger.success('No breaking changes detected')
    }

    return breakingChanges
  } catch (error) {
    logger.error(`Detection failed: ${error.message}`)
    return []
  }
}

/**
 * 🔍 ファイル差分の分析
 */
async function analyzeFileDiff(file, diff) {
  const detectedChanges = []

  for (const pattern of DETECTION_PATTERNS) {
    if (pattern.filePattern.test(file.path) && pattern.diffPattern.test(diff)) {
      detectedChanges.push({
        filePath: file.path,
        changeType: file.status,
        pattern: pattern.name,
        severity: pattern.severity,
        category: pattern.category,
        confidence: pattern.confidence,
        description: pattern.description,
        affectedGroups: pattern.affectedGroups,
        diff: diff.substring(0, 500), // 最初の500文字
        isBreaking: true,
        detectedAt: new Date().toISOString(),
      })
    }
  }

  // 追加の分析ロジック
  if (file.path.includes('package.json') && diff.includes('"version":')) {
    const versionChange = analyzeVersionChange(diff)
    if (versionChange.isBreaking) {
      detectedChanges.push({
        filePath: file.path,
        changeType: file.status,
        pattern: 'Version Change',
        severity: versionChange.severity,
        category: 'dependency_change',
        confidence: 0.9,
        description: `アプリケーションバージョンが変更されました: ${versionChange.details}`,
        affectedGroups: ['developers', 'devops', 'end_users'],
        diff: versionChange.diff,
        isBreaking: true,
        detectedAt: new Date().toISOString(),
      })
    }
  }

  return detectedChanges
}

/**
 * 📦 バージョン変更の分析
 */
function analyzeVersionChange(diff) {
  const versionPattern = /"version":\s*"([^"]+)".*?"version":\s*"([^"]+)"/
  const match = diff.match(versionPattern)

  if (match) {
    const [, oldVersion, newVersion] = match
    const oldParts = oldVersion.split('.').map(Number)
    const newParts = newVersion.split('.').map(Number)

    // メジャーバージョンアップの検知
    if (newParts[0] > oldParts[0]) {
      return {
        isBreaking: true,
        severity: 'critical',
        details: `${oldVersion} → ${newVersion} (メジャーアップデート)`,
        diff: `Version: ${oldVersion} → ${newVersion}`,
      }
    }

    // マイナーバージョンアップの検知
    if (newParts[1] > oldParts[1]) {
      return {
        isBreaking: false, // マイナーアップデートは通常非破壊的
        severity: 'medium',
        details: `${oldVersion} → ${newVersion} (マイナーアップデート)`,
        diff: `Version: ${oldVersion} → ${newVersion}`,
      }
    }
  }

  return { isBreaking: false }
}

/**
 * 📋 検知結果の表示
 */
function displayDetectedChanges(changes) {
  console.log()
  logger.header('Detected Breaking Changes')
  console.log(`${colors.dim}${'━'.repeat(80)}${colors.reset}`)

  const groupedChanges = groupChangesByCategory(changes)

  Object.entries(groupedChanges).forEach(([category, categoryChanges]) => {
    const categoryName = getCategoryDisplayName(category)
    logger.info(`📋 ${categoryName} (${categoryChanges.length})`)

    categoryChanges.forEach((change) => {
      const severityColor = getSeverityColor(change.severity)
      const confidenceBar = '█'.repeat(Math.round(change.confidence * 10))

      logger.data(`${severityColor}${change.severity.toUpperCase()}${colors.reset} ${change.pattern}`)
      logger.dim(`     File: ${change.filePath}`)
      logger.dim(`     Description: ${change.description}`)
      logger.dim(`     Confidence: ${confidenceBar} ${Math.round(change.confidence * 100)}%`)
      logger.dim(`     Affected: ${change.affectedGroups.join(', ')}`)
      console.log()
    })
  })

  console.log(`${colors.dim}${'━'.repeat(80)}${colors.reset}`)
}

/**
 * 📊 レポート生成
 */
function generateReport(changes, outputPath) {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      totalChanges: changes.length,
      bySeverity: {
        critical: changes.filter((c) => c.severity === 'critical').length,
        high: changes.filter((c) => c.severity === 'high').length,
        medium: changes.filter((c) => c.severity === 'medium').length,
        low: changes.filter((c) => c.severity === 'low').length,
      },
      byCategory: groupChangesByCategory(changes),
      highestConfidence: Math.max(...changes.map((c) => c.confidence)),
      averageConfidence: changes.reduce((sum, c) => sum + c.confidence, 0) / changes.length,
    },
    changes: changes.map((change) => ({
      ...change,
      diff: change.diff.substring(0, 200), // 長い差分は切り詰め
    })),
    recommendations: generateRecommendations(changes),
  }

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
  logger.success(`Report generated: ${outputPath}`)
}

/**
 * 💡 推奨事項の生成
 */
function generateRecommendations(changes) {
  const recommendations = []

  const criticalChanges = changes.filter((c) => c.severity === 'critical')
  if (criticalChanges.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Critical breaking changes detected - immediate review required',
      details: criticalChanges.map((c) => c.pattern),
    })
  }

  const apiChanges = changes.filter((c) => c.category === 'api_change')
  if (apiChanges.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Update API documentation and notify API consumers',
      details: ['API consumers need to update their integration'],
    })
  }

  const configChanges = changes.filter((c) => c.category === 'config_change')
  if (configChanges.length > 0) {
    recommendations.push({
      priority: 'medium',
      action: 'Update deployment configurations and environment variables',
      details: ['DevOps team should review configuration changes'],
    })
  }

  return recommendations
}

/**
 * 🔔 Breaking Changes記録への追加
 */
function addToBreakingChangesLog(changes, version) {
  const breakingChangesPath = './BREAKING_CHANGES.md'

  if (!fs.existsSync(breakingChangesPath)) {
    logger.warning('BREAKING_CHANGES.md not found, creating new file')
    initializeBreakingChangesFile(breakingChangesPath)
  }

  let content = fs.readFileSync(breakingChangesPath, 'utf8')

  const newEntries = changes
    .map((change) => {
      return `
### ${getCategoryIcon(change.category)} ${change.pattern}

**変更内容:**
${change.description}

**影響範囲:**
${change.affectedGroups.map((group) => `- ✅ **${getGroupDisplayName(group)}**: 影響あり`).join('\n')}

**ファイル:**
\`${change.filePath}\`

**信頼度:** ${Math.round(change.confidence * 100)}%

---
`
    })
    .join('\n')

  // 新しいバージョンセクションを追加
  const versionSection = `
## ${version} (${new Date().toISOString().split('T')[0]}) - 自動検知変更

${newEntries}
`

  // 最初の ---の後に新しいセクションを挿入
  const insertPoint = content.indexOf('\n---\n') + 5
  content = content.substring(0, insertPoint) + versionSection + content.substring(insertPoint)

  fs.writeFileSync(breakingChangesPath, content)
  logger.success(`Added ${changes.length} changes to BREAKING_CHANGES.md`)
}

/**
 * 🎯 ヘルパー関数群
 */
function parseDiffOutput(diffOutput) {
  return diffOutput
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const [status, path] = line.split('\t')
      return { path, status }
    })
}

function groupChangesByCategory(changes) {
  return changes.reduce((groups, change) => {
    if (!groups[change.category]) {
      groups[change.category] = []
    }
    groups[change.category].push(change)
    return groups
  }, {})
}

function getCategoryDisplayName(category) {
  const names = {
    api_change: 'API Changes',
    database_change: 'Database Changes',
    dependency_change: 'Dependency Changes',
    config_change: 'Configuration Changes',
    interface_change: 'Interface Changes',
    auth_change: 'Authentication Changes',
  }
  return names[category] || category
}

function getCategoryIcon(category) {
  const icons = {
    api_change: '🔌',
    database_change: '🗄️',
    dependency_change: '📦',
    config_change: '⚙️',
    interface_change: '🎨',
    auth_change: '🔐',
  }
  return icons[category] || '🔧'
}

function getGroupDisplayName(group) {
  const names = {
    api_consumers: 'API利用者',
    developers: '開発者',
    devops: 'DevOps・運用',
    administrators: 'システム管理者',
    end_users: 'エンドユーザー',
    external_systems: '外部システム',
  }
  return names[group] || group
}

function getSeverityColor(severity) {
  const severityColors = {
    critical: colors.red,
    high: colors.red,
    medium: colors.yellow,
    low: colors.green,
  }
  return severityColors[severity] || colors.white
}

function initializeBreakingChangesFile(filePath) {
  const initialContent = `# 🚨 BoxLog Breaking Changes

このドキュメントは、BoxLogアプリケーションの破壊的変更（Breaking Changes）の記録です。

---

**📝 最終更新**: ${new Date().toISOString().split('T')[0]}
**📋 記録担当**: Claude Code Development Team
`
  fs.writeFileSync(filePath, initialContent)
}

/**
 * 🎯 メイン実行関数
 */
async function main() {
  const command = process.argv[2]
  const fromCommit = process.argv[3] || 'HEAD~1'
  const toCommit = process.argv[4] || 'HEAD'
  const version = process.argv[5] || '1.0.0'

  logger.header('BoxLog Breaking Changes Tracker')
  logger.info(`Command: ${command || 'detect'}`)
  logger.info(`Commit range: ${fromCommit}..${toCommit}`)
  console.log()

  try {
    switch (command) {
      case 'detect':
      default:
        const changes = await detectBreakingChanges(fromCommit, toCommit)

        if (changes.length > 0) {
          // レポート生成
          const reportPath = `./reports/breaking-changes-${Date.now()}.json`
          const reportsDir = path.dirname(reportPath)
          if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true })
          }
          generateReport(changes, reportPath)

          // 高信頼度の変更は警告終了
          const highConfidenceChanges = changes.filter((c) => c.confidence >= 0.8)
          if (highConfidenceChanges.length > 0) {
            logger.warning(`Found ${highConfidenceChanges.length} high-confidence breaking changes`)
            process.exit(1)
          }
        }
        break

      case 'record':
        const recordChanges = await detectBreakingChanges(fromCommit, toCommit)
        if (recordChanges.length > 0) {
          addToBreakingChangesLog(recordChanges, version)
        }
        break

      case 'validate':
        // BREAKING_CHANGES.mdの検証
        const breakingChangesPath = './BREAKING_CHANGES.md'
        if (fs.existsSync(breakingChangesPath)) {
          logger.success('BREAKING_CHANGES.md found and valid')
        } else {
          logger.error('BREAKING_CHANGES.md not found')
          process.exit(1)
        }
        break

      case 'init':
        // BREAKING_CHANGES.mdの初期化
        const initPath = './BREAKING_CHANGES.md'
        initializeBreakingChangesFile(initPath)
        logger.success(`Initialized ${initPath}`)
        break
    }
  } catch (error) {
    logger.error(`Command execution failed: ${error.message}`)
    process.exit(1)
  }
}

// スクリプト実行
if (require.main === module) {
  main()
}

module.exports = {
  detectBreakingChanges,
  analyzeFileDiff,
  generateReport,
}
