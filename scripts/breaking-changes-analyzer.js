#!/usr/bin/env node
/**
 * 🔬 BoxLog Breaking Changes Advanced Analyzer
 *
 * 高度な破壊的変更分析・影響評価・マイグレーション計画生成
 * - 詳細影響分析・リスク評価・自動マイグレーションガイド生成
 * - チーム通知・Slack/Discord統合・自動Issue作成
 */

const { execSync } = require('child_process')
const fs = require('fs')
const https = require('https')

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
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🔬 ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.white}   ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.dim}   ${msg}${colors.reset}`),
}

/**
 * 🎯 影響分析マトリクス
 */
const IMPACT_MATRIX = {
  api_change: {
    technical: {
      score: 9,
      areas: ['API Clients', 'Frontend', 'Mobile Apps', 'External Integrations'],
      mitigation: ['バージョニング戦略', 'デプリケーション期間', 'バックワード互換性'],
    },
    business: {
      score: 8,
      areas: ['顧客サービス', 'パートナー連携', 'SLA遵守'],
      mitigation: ['段階的移行', '事前通知', 'サポート体制強化'],
    },
    operational: {
      score: 7,
      areas: ['監視設定', 'ログ収集', 'エラーハンドリング'],
      mitigation: ['監視強化', 'アラート設定', 'ロールバック計画'],
    },
  },
  database_change: {
    technical: {
      score: 10,
      areas: ['Data Integrity', 'Query Performance', 'Schema Migration'],
      mitigation: ['バックアップ', 'マイグレーションテスト', 'ロールバック手順'],
    },
    business: {
      score: 9,
      areas: ['データ可用性', 'レポート機能', '履歴データ'],
      mitigation: ['ダウンタイム計画', 'データ変換', '互換性レイヤー'],
    },
    operational: {
      score: 10,
      areas: ['バックアップ', 'レプリケーション', 'メンテナンス'],
      mitigation: ['メンテナンス計画', '影響範囲特定', 'リカバリー手順'],
    },
  },
  auth_change: {
    technical: {
      score: 10,
      areas: ['Session Management', 'Token Validation', 'Security Protocols'],
      mitigation: ['移行期間設定', 'デュアル認証', 'セキュリティ監査'],
    },
    business: {
      score: 10,
      areas: ['ユーザーアクセス', 'セキュリティコンプライアンス', 'アクセス制御'],
      mitigation: ['段階的移行', 'ユーザー通知', 'サポート準備'],
    },
    operational: {
      score: 9,
      areas: ['セキュリティ監視', 'アクセスログ', 'インシデント対応'],
      mitigation: ['監視強化', 'ログ分析', 'インシデント訓練'],
    },
  },
  config_change: {
    technical: {
      score: 6,
      areas: ['Deployment Scripts', 'Environment Variables', 'Configuration Files'],
      mitigation: ['設定検証', '環境別テスト', '設定管理'],
    },
    business: {
      score: 5,
      areas: ['サービス設定', '機能フラグ', 'カスタマイズ'],
      mitigation: ['段階的適用', '影響確認', 'ロールバック'],
    },
    operational: {
      score: 7,
      areas: ['デプロイメント', 'CI/CD', '環境管理'],
      mitigation: ['パイプライン更新', 'テスト追加', '自動検証'],
    },
  },
}

/**
 * 📊 詳細影響分析の実行
 */
async function analyzeImpact(changes) {
  logger.header('Impact Analysis Starting...')

  const impactReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChanges: changes.length,
      criticalCount: 0,
      highRiskCount: 0,
      estimatedEffort: 0,
      affectedSystems: new Set(),
      affectedTeams: new Set(),
    },
    details: [],
    riskMatrix: {},
    recommendations: [],
    migrationPlan: {},
  }

  for (const change of changes) {
    const impact = IMPACT_MATRIX[change.category] || {}
    const analysis = {
      change: change,
      impact: {
        technical: impact.technical || { score: 5 },
        business: impact.business || { score: 5 },
        operational: impact.operational || { score: 5 },
      },
      totalImpactScore: 0,
      riskLevel: 'LOW',
      estimatedHours: 0,
      migrationSteps: [],
    }

    // 影響スコア計算
    analysis.totalImpactScore =
      analysis.impact.technical.score * 0.4 +
      analysis.impact.business.score * 0.3 +
      analysis.impact.operational.score * 0.3

    // リスクレベル判定
    if (analysis.totalImpactScore >= 9) {
      analysis.riskLevel = 'CRITICAL'
      impactReport.summary.criticalCount++
    } else if (analysis.totalImpactScore >= 7) {
      analysis.riskLevel = 'HIGH'
      impactReport.summary.highRiskCount++
    } else if (analysis.totalImpactScore >= 5) {
      analysis.riskLevel = 'MEDIUM'
    }

    // 工数見積もり
    analysis.estimatedHours = Math.ceil(analysis.totalImpactScore * 2)
    impactReport.summary.estimatedEffort += analysis.estimatedHours

    // 影響システム・チーム集計
    if (impact.technical) {
      impact.technical.areas.forEach((area) => impactReport.summary.affectedSystems.add(area))
    }
    change.affectedGroups.forEach((group) => impactReport.summary.affectedTeams.add(group))

    // マイグレーション手順生成
    analysis.migrationSteps = generateMigrationSteps(change, impact)

    impactReport.details.push(analysis)
  }

  // リスクマトリクス生成
  impactReport.riskMatrix = generateRiskMatrix(impactReport.details)

  // 推奨事項生成
  impactReport.recommendations = generateRecommendations(impactReport)

  // マイグレーション計画生成
  impactReport.migrationPlan = generateMigrationPlan(impactReport.details)

  return impactReport
}

/**
 * 🚀 マイグレーション手順生成
 */
function generateMigrationSteps(change, _impact) {
  const steps = []

  // 事前準備
  steps.push({
    phase: 'PREPARATION',
    order: 1,
    title: '事前準備',
    tasks: ['バックアップの取得', '影響範囲の最終確認', 'ロールバック手順の準備', 'チーム通知の送信'],
    estimatedMinutes: 30,
  })

  // カテゴリ別のマイグレーション手順
  if (change.category === 'database_change') {
    steps.push({
      phase: 'DATABASE_MIGRATION',
      order: 2,
      title: 'データベースマイグレーション',
      tasks: [
        'データベース接続の確認',
        'マイグレーションスクリプトの実行',
        'データ整合性チェック',
        'インデックスの再構築',
      ],
      estimatedMinutes: 60,
      commands: ['npm run migration:backup', 'npm run migration:execute', 'npm run migration:verify'],
    })
  }

  if (change.category === 'api_change') {
    steps.push({
      phase: 'API_MIGRATION',
      order: 2,
      title: 'APIバージョニング対応',
      tasks: ['新APIバージョンのデプロイ', '旧バージョンとの互換性確認', 'APIドキュメントの更新', 'クライアント通知'],
      estimatedMinutes: 45,
      commands: ['npm run api:version:deploy', 'npm run api:version:test', 'npm run api:docs:generate'],
    })
  }

  if (change.category === 'auth_change') {
    steps.push({
      phase: 'AUTH_MIGRATION',
      order: 2,
      title: '認証システム移行',
      tasks: ['新認証方式のデプロイ', 'セッション移行処理', 'トークンリフレッシュ', 'セキュリティ監査'],
      estimatedMinutes: 90,
      commands: ['npm run auth:deploy', 'npm run auth:migrate:sessions', 'npm run auth:audit'],
    })
  }

  // 検証フェーズ
  steps.push({
    phase: 'VALIDATION',
    order: 3,
    title: '動作検証',
    tasks: ['ヘルスチェック実行', 'エンドツーエンドテスト', 'パフォーマンステスト', 'ユーザー受け入れテスト'],
    estimatedMinutes: 45,
    commands: ['npm run health:check', 'npm run test:e2e', 'npm run test:performance'],
  })

  // 完了処理
  steps.push({
    phase: 'COMPLETION',
    order: 4,
    title: '完了処理',
    tasks: ['旧バージョンの無効化', 'ドキュメントの公開', 'チーム通知', 'モニタリング開始'],
    estimatedMinutes: 15,
  })

  return steps
}

/**
 * 📊 リスクマトリクス生成
 */
function generateRiskMatrix(details) {
  const matrix = {
    CRITICAL: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  }

  details.forEach((detail) => {
    matrix[detail.riskLevel].push({
      pattern: detail.change.pattern,
      file: detail.change.filePath,
      impactScore: detail.totalImpactScore,
      estimatedHours: detail.estimatedHours,
    })
  })

  return matrix
}

/**
 * 💡 推奨事項生成
 */
function generateRecommendations(report) {
  const recommendations = []

  if (report.summary.criticalCount > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      title: '緊急対応が必要',
      actions: [
        'リリース延期の検討',
        '影響分析の詳細レビュー',
        'ステークホルダーへの通知',
        'ロールバック計画の最終確認',
      ],
    })
  }

  if (report.summary.estimatedEffort > 40) {
    recommendations.push({
      priority: 'HIGH',
      title: '段階的移行の推奨',
      actions: [
        '変更を複数フェーズに分割',
        '各フェーズごとの検証計画',
        'カナリアリリースの実施',
        '影響範囲の段階的拡大',
      ],
    })
  }

  if (report.summary.affectedSystems.has('External Integrations')) {
    recommendations.push({
      priority: 'HIGH',
      title: '外部連携への対応',
      actions: [
        'パートナー企業への事前通知',
        'APIバージョニング戦略の確認',
        'デプリケーション期間の設定',
        'サポート体制の強化',
      ],
    })
  }

  if (report.summary.affectedTeams.has('end_users')) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'ユーザー対応',
      actions: [
        'ユーザー向けアナウンスの準備',
        'ヘルプドキュメントの更新',
        'サポートチームへのブリーフィング',
        'フィードバック収集体制の準備',
      ],
    })
  }

  return recommendations
}

/**
 * 📅 マイグレーション計画生成
 */
function generateMigrationPlan(details) {
  const plan = {
    totalEstimatedHours: 0,
    phases: [],
    timeline: [],
    dependencies: [],
    rollbackPlan: [],
  }

  // フェーズ別の計画
  const phases = {
    preparation: {
      name: '準備フェーズ',
      duration: 4,
      tasks: [],
    },
    execution: {
      name: '実行フェーズ',
      duration: 0,
      tasks: [],
    },
    validation: {
      name: '検証フェーズ',
      duration: 4,
      tasks: [],
    },
    stabilization: {
      name: '安定化フェーズ',
      duration: 8,
      tasks: [],
    },
  }

  details.forEach((detail) => {
    plan.totalEstimatedHours += detail.estimatedHours
    phases.execution.duration += detail.estimatedHours

    detail.migrationSteps.forEach((step) => {
      if (step.phase === 'PREPARATION') {
        phases.preparation.tasks.push(step)
      } else if (step.phase === 'VALIDATION') {
        phases.validation.tasks.push(step)
      } else {
        phases.execution.tasks.push(step)
      }
    })
  })

  plan.phases = Object.values(phases)

  // タイムライン生成
  let currentHour = 0
  plan.phases.forEach((phase) => {
    plan.timeline.push({
      phase: phase.name,
      startHour: currentHour,
      endHour: currentHour + phase.duration,
      criticalPath: phase.name === '実行フェーズ',
    })
    currentHour += phase.duration
  })

  // 依存関係
  plan.dependencies = [
    { from: '準備フェーズ', to: '実行フェーズ', type: 'BLOCKING' },
    { from: '実行フェーズ', to: '検証フェーズ', type: 'BLOCKING' },
    { from: '検証フェーズ', to: '安定化フェーズ', type: 'SOFT' },
  ]

  // ロールバック計画
  plan.rollbackPlan = [
    {
      trigger: '重大なエラー発生',
      actions: ['サービスの即時停止', 'バックアップからのリストア', '旧バージョンへの切り戻し', 'インシデント報告'],
      estimatedTime: 30,
    },
    {
      trigger: 'パフォーマンス劣化',
      actions: ['トラフィックの段階的切り戻し', 'パフォーマンス分析', '最適化または切り戻し判断'],
      estimatedTime: 60,
    },
  ]

  return plan
}

/**
 * 📧 チーム通知機能
 */
async function sendNotifications(report, config = {}) {
  logger.header('Sending Team Notifications...')

  const notifications = []

  // Slack通知
  if (config.slackWebhook) {
    const slackMessage = formatSlackMessage(report)
    try {
      await sendSlackNotification(config.slackWebhook, slackMessage)
      notifications.push({ platform: 'Slack', status: 'sent' })
      logger.success('Slack notification sent')
    } catch (error) {
      notifications.push({ platform: 'Slack', status: 'failed', error: error.message })
      logger.error(`Slack notification failed: ${error.message}`)
    }
  }

  // GitHub Issue作成
  if (config.createIssue) {
    const issueContent = formatGitHubIssue(report)
    try {
      const issueNumber = await createGitHubIssue(issueContent)
      notifications.push({ platform: 'GitHub', status: 'created', issueNumber })
      logger.success(`GitHub Issue #${issueNumber} created`)
    } catch (error) {
      notifications.push({ platform: 'GitHub', status: 'failed', error: error.message })
      logger.error(`GitHub Issue creation failed: ${error.message}`)
    }
  }

  // Email通知（実装例）
  if (config.emailRecipients) {
    logger.info(`Email would be sent to: ${config.emailRecipients.join(', ')}`)
    notifications.push({ platform: 'Email', status: 'simulated' })
  }

  return notifications
}

/**
 * 💬 Slack メッセージフォーマット
 */
function formatSlackMessage(report) {
  const criticalEmoji = report.summary.criticalCount > 0 ? '🚨' : '✅'

  return {
    text: `${criticalEmoji} Breaking Changes Detected`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔬 Breaking Changes Analysis Report',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Changes:*\n${report.summary.totalChanges}`,
          },
          {
            type: 'mrkdwn',
            text: `*Critical:*\n${report.summary.criticalCount}`,
          },
          {
            type: 'mrkdwn',
            text: `*Estimated Effort:*\n${report.summary.estimatedEffort} hours`,
          },
          {
            type: 'mrkdwn',
            text: `*Risk Level:*\n${report.summary.criticalCount > 0 ? 'HIGH' : 'MEDIUM'}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Affected Systems:*\n${Array.from(report.summary.affectedSystems).join(', ')}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Full Report',
            },
            url: 'https://example.com/reports/latest',
          },
        ],
      },
    ],
  }
}

/**
 * 📝 GitHub Issue フォーマット
 */
function formatGitHubIssue(report) {
  const labels = ['breaking-change', 'needs-review']
  if (report.summary.criticalCount > 0) {
    labels.push('critical', 'priority-high')
  }

  const body = `
## 🔬 Breaking Changes Detected

### 📊 Summary
- **Total Changes:** ${report.summary.totalChanges}
- **Critical Issues:** ${report.summary.criticalCount}
- **High Risk Issues:** ${report.summary.highRiskCount}
- **Estimated Effort:** ${report.summary.estimatedEffort} hours

### 🎯 Risk Matrix
\`\`\`
Critical: ${report.riskMatrix.CRITICAL.length} changes
High:     ${report.riskMatrix.HIGH.length} changes
Medium:   ${report.riskMatrix.MEDIUM.length} changes
Low:      ${report.riskMatrix.LOW.length} changes
\`\`\`

### 💡 Recommendations
${report.recommendations
  .map((rec) => `#### ${rec.title}\n${rec.actions.map((action) => `- ${action}`).join('\n')}`)
  .join('\n\n')}

### 📅 Migration Plan
- **Total Duration:** ${report.migrationPlan.totalEstimatedHours} hours
- **Phases:** ${report.migrationPlan.phases.length}

### 🔄 Next Steps
1. Review the detailed impact analysis
2. Validate the migration plan
3. Schedule the migration window
4. Notify affected teams

---
*Generated by Breaking Changes Analyzer*
`

  return {
    title: `🚨 Breaking Changes Detected - ${new Date().toISOString().split('T')[0]}`,
    body,
    labels,
  }
}

/**
 * 🌐 Slack 通知送信
 */
async function sendSlackNotification(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(message)
    const url = new URL(webhookUrl)

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve()
      } else {
        reject(new Error(`Slack API returned ${res.statusCode}`))
      }
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

/**
 * 🐙 GitHub Issue 作成
 */
async function createGitHubIssue(content) {
  try {
    // GitHub CLI を使用してIssue作成
    const result = execSync(
      `gh issue create --title "${content.title}" --body "${content.body.replace(/"/g, '\\"')}" --label "${content.labels.join(',')}"`,
      { encoding: 'utf8' }
    )

    // Issue番号を抽出
    const match = result.match(/#(\d+)/)
    return match ? match[1] : 'unknown'
  } catch (error) {
    throw new Error(`GitHub Issue creation failed: ${error.message}`)
  }
}

/**
 * 📊 詳細レポート生成
 */
function generateDetailedReport(report, outputPath) {
  const detailedReport = {
    ...report,
    metadata: {
      generated: new Date().toISOString(),
      analyzer_version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    visualizations: {
      riskChart: generateRiskChart(report),
      timelineGantt: generateTimelineGantt(report),
      impactHeatmap: generateImpactHeatmap(report),
    },
    exportFormats: {
      markdown: `${outputPath}.md`,
      json: `${outputPath}.json`,
      html: `${outputPath}.html`,
    },
  }

  // JSON形式で保存
  fs.writeFileSync(`${outputPath}.json`, JSON.stringify(detailedReport, null, 2))

  // Markdown形式で保存
  const markdown = generateMarkdownReport(detailedReport)
  fs.writeFileSync(`${outputPath}.md`, markdown)

  // HTML形式で保存（オプション）
  const html = generateHTMLReport(detailedReport)
  fs.writeFileSync(`${outputPath}.html`, html)

  logger.success(`Detailed reports generated: ${outputPath}.*`)
  return detailedReport
}

/**
 * 📈 リスクチャート生成
 */
function generateRiskChart(report) {
  return {
    type: 'bar',
    data: {
      labels: Object.keys(report.riskMatrix),
      values: Object.values(report.riskMatrix).map((items) => items.length),
    },
    config: {
      title: 'Risk Distribution',
      colors: ['#dc2626', '#f59e0b', '#eab308', '#22c55e'],
    },
  }
}

/**
 * 📅 タイムラインガント生成
 */
function generateTimelineGantt(report) {
  return {
    type: 'gantt',
    data: report.migrationPlan.timeline.map((phase, index) => ({
      id: index + 1,
      name: phase.phase,
      start: phase.startHour,
      duration: phase.endHour - phase.startHour,
      critical: phase.criticalPath,
    })),
  }
}

/**
 * 🗺️ 影響ヒートマップ生成
 */
function generateImpactHeatmap(report) {
  const heatmap = {}

  report.details.forEach((detail) => {
    const category = detail.change.category
    if (!heatmap[category]) {
      heatmap[category] = {
        technical: 0,
        business: 0,
        operational: 0,
      }
    }
    heatmap[category].technical += detail.impact.technical.score
    heatmap[category].business += detail.impact.business.score
    heatmap[category].operational += detail.impact.operational.score
  })

  return heatmap
}

/**
 * 📝 Markdown レポート生成
 */
function generateMarkdownReport(report) {
  return `
# 🔬 Breaking Changes Analysis Report

Generated: ${report.metadata.generated}

## 📊 Executive Summary

- **Total Breaking Changes:** ${report.summary.totalChanges}
- **Critical Issues:** ${report.summary.criticalCount}
- **High Risk Issues:** ${report.summary.highRiskCount}
- **Total Estimated Effort:** ${report.summary.estimatedEffort} hours
- **Affected Systems:** ${Array.from(report.summary.affectedSystems).join(', ')}
- **Affected Teams:** ${Array.from(report.summary.affectedTeams).join(', ')}

## 🎯 Risk Assessment

### Risk Distribution
${Object.entries(report.riskMatrix)
  .map(([level, items]) => `- **${level}:** ${items.length} changes`)
  .join('\n')}

## 📅 Migration Plan

### Timeline
${report.migrationPlan.timeline
  .map(
    (phase) =>
      `- **${phase.phase}:** Hours ${phase.startHour}-${phase.endHour}${phase.criticalPath ? ' ⚠️ Critical Path' : ''}`
  )
  .join('\n')}

### Total Duration
**${report.migrationPlan.totalEstimatedHours} hours**

## 💡 Recommendations

${report.recommendations
  .map(
    (rec) => `
### ${rec.priority}: ${rec.title}
${rec.actions.map((action) => `- ${action}`).join('\n')}
`
  )
  .join('\n')}

## 📋 Detailed Changes

${report.details
  .map(
    (detail) => `
### ${detail.change.pattern}
- **File:** \`${detail.change.filePath}\`
- **Risk Level:** ${detail.riskLevel}
- **Impact Score:** ${detail.totalImpactScore.toFixed(1)}
- **Estimated Hours:** ${detail.estimatedHours}
`
  )
  .join('\n')}

---
*Report generated by BoxLog Breaking Changes Analyzer v1.0.0*
`
}

/**
 * 🌐 HTML レポート生成
 */
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Breaking Changes Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; }
    .critical { color: #dc2626; font-weight: bold; }
    .warning { color: #f59e0b; }
    .success { color: #22c55e; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔬 Breaking Changes Analysis Report</h1>
    <div class="summary">
      <h2>Summary</h2>
      <p>Generated: ${report.metadata.generated}</p>
      <ul>
        <li>Total Changes: <strong>${report.summary.totalChanges}</strong></li>
        <li class="critical">Critical Issues: ${report.summary.criticalCount}</li>
        <li>Estimated Effort: <strong>${report.summary.estimatedEffort} hours</strong></li>
      </ul>
    </div>

    <h2>Risk Matrix</h2>
    <table>
      <tr>
        <th>Risk Level</th>
        <th>Count</th>
        <th>Files</th>
      </tr>
      ${Object.entries(report.riskMatrix)
        .map(
          ([level, items]) => `
        <tr>
          <td class="${level === 'CRITICAL' ? 'critical' : level === 'HIGH' ? 'warning' : ''}">${level}</td>
          <td>${items.length}</td>
          <td>${items.map((i) => i.file).join(', ')}</td>
        </tr>
      `
        )
        .join('')}
    </table>

    <h2>Migration Timeline</h2>
    <div style="background: linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(report.migrationPlan.totalEstimatedHours / 100) * 100}%, #e5e7eb ${(report.migrationPlan.totalEstimatedHours / 100) * 100}%); height: 40px; border-radius: 4px; position: relative;">
      <span style="position: absolute; left: 50%; transform: translateX(-50%); line-height: 40px; color: white; font-weight: bold;">
        ${report.migrationPlan.totalEstimatedHours} hours
      </span>
    </div>
  </div>
</body>
</html>
`
}

/**
 * 🎯 メイン実行関数
 */
async function main() {
  const command = process.argv[2] || 'analyze'
  const reportPath = process.argv[3] || './reports/breaking-changes-latest.json'

  logger.header('BoxLog Breaking Changes Advanced Analyzer')
  console.log()

  try {
    switch (command) {
      case 'analyze':
        // 基本のトラッカーから変更を取得
        const tracker = require('./breaking-changes-tracker')
        const changes = await tracker.detectBreakingChanges()

        if (changes.length > 0) {
          // 詳細分析実行
          const impactReport = await analyzeImpact(changes)

          // レポート生成
          const outputBase = `./reports/impact-analysis-${Date.now()}`
          generateDetailedReport(impactReport, outputBase)

          // 表示
          displayImpactSummary(impactReport)

          // 通知設定を読み込み
          const notificationConfig = loadNotificationConfig()
          if (notificationConfig) {
            await sendNotifications(impactReport, notificationConfig)
          }
        } else {
          logger.info('No breaking changes to analyze')
        }
        break

      case 'report':
        // 既存レポートから詳細レポート生成
        if (fs.existsSync(reportPath)) {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
          const outputBase = `./reports/detailed-${Date.now()}`
          generateDetailedReport(report, outputBase)
        } else {
          logger.error(`Report not found: ${reportPath}`)
        }
        break

      case 'notify':
        // 通知のみ実行
        if (fs.existsSync(reportPath)) {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
          const notificationConfig = loadNotificationConfig()
          await sendNotifications(report, notificationConfig)
        }
        break

      default:
        logger.info('Usage: breaking-changes-analyzer [analyze|report|notify] [report-path]')
    }
  } catch (error) {
    logger.error(`Execution failed: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

/**
 * 📊 影響サマリー表示
 */
function displayImpactSummary(report) {
  console.log()
  logger.header('Impact Analysis Summary')
  console.log(`${colors.dim}${'━'.repeat(80)}${colors.reset}`)

  logger.data(`Total Changes: ${report.summary.totalChanges}`)
  logger.data(`Critical Issues: ${colors.red}${report.summary.criticalCount}${colors.reset}`)
  logger.data(`High Risk Issues: ${colors.yellow}${report.summary.highRiskCount}${colors.reset}`)
  logger.data(`Estimated Effort: ${colors.cyan}${report.summary.estimatedEffort} hours${colors.reset}`)

  console.log()
  logger.info('Risk Distribution:')
  Object.entries(report.riskMatrix).forEach(([level, items]) => {
    const color =
      level === 'CRITICAL'
        ? colors.red
        : level === 'HIGH'
          ? colors.yellow
          : level === 'MEDIUM'
            ? colors.blue
            : colors.green
    logger.data(`  ${color}${level}${colors.reset}: ${items.length} changes`)
  })

  console.log()
  logger.info('Top Recommendations:')
  report.recommendations.slice(0, 3).forEach((rec) => {
    logger.data(`  ${rec.priority}: ${rec.title}`)
  })

  console.log(`${colors.dim}${'━'.repeat(80)}${colors.reset}`)
}

/**
 * ⚙️ 通知設定読み込み
 */
function loadNotificationConfig() {
  const configPath = './.breaking-changes-notify.json'

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }

  // 環境変数から取得
  return {
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
    createIssue: process.env.CREATE_GITHUB_ISSUE === 'true',
    emailRecipients: process.env.EMAIL_RECIPIENTS ? process.env.EMAIL_RECIPIENTS.split(',') : null,
  }
}

// スクリプト実行
if (require.main === module) {
  main()
}

module.exports = {
  analyzeImpact,
  generateMigrationPlan,
  sendNotifications,
  generateDetailedReport,
}
