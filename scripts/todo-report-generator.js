#!/usr/bin/env node

/**
 * BoxLog TODO Report Generator
 *
 * 自動的にTODO/FIXMEレポートを生成し、GitHubとの統合を行う
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// レポート生成設定
const REPORT_CONFIG = {
  outputDir: 'docs',
  reportFile: 'TODO_REPORT.md',
  issueLabels: ['todo', 'technical-debt'],
  assignees: [], // GitHubユーザー名のリスト
  milestones: {
    P0: 'Critical Issues',
    P1: 'High Priority',
    P2: 'Medium Priority',
    P3: 'Low Priority',
  },
}

// カラー出力
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

/**
 * TODO統計の生成
 */
function generateTodoStats() {
  try {
    console.log(`${colors.cyan}📊 TODO統計を生成中...${colors.reset}`)

    const output = execSync('node scripts/todo-manager.js --format json 2>/dev/null', { encoding: 'utf8' })
    const data = JSON.parse(output)

    return {
      todos: data.todos || [],
      stats: data.stats || {},
    }
  } catch (error) {
    console.error(`${colors.red}❌ TODO統計の生成に失敗:${colors.reset}`, error.message)
    return { todos: [], stats: {} }
  }
}

// レポートヘッダーの生成
function generateReportHeader() {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().split(' ')[0]
  
  return `# 📋 BoxLog TODO/FIXME Report
  
*Generated on ${dateStr} at ${timeStr}*

## 📊 Executive Summary

`
}

// エグゼクティブサマリーの生成
function generateExecutiveSummary(stats) {
  let summary = ''
  
  summary += `- **Total Items:** ${stats.total || 0}\n`
  summary += `- **Structured:** ${stats.structured || 0} (${((stats.structured / stats.total) * 100).toFixed(1)}%)\n`
  summary += `- **Legacy:** ${stats.legacy || 0} (${((stats.legacy / stats.total) * 100).toFixed(1)}%)\n`

  if (stats.overdue > 0) {
    summary += `- **⚠️ Overdue:** ${stats.overdue}\n`
  }
  if (stats.expiringSoon > 0) {
    summary += `- **🕐 Expiring Soon:** ${stats.expiringSoon}\n`
  }

  // 健康スコア
  const healthScore = calculateHealthScore(stats)
  const healthEmoji = healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : '🔴'
  summary += `- **Health Score:** ${healthEmoji} ${healthScore}/100\n\n`
  
  return summary
}

// 詳細統計の生成
function generateDetailedStatistics(stats) {
  let section = `## 📈 Detailed Statistics

### By Type
`

  Object.entries(stats.byType || {}).forEach(([type, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1)
    section += `- **${type}:** ${count} (${percentage}%)\n`
  })

  if (Object.keys(stats.byPriority || {}).length > 0) {
    section += `\n### By Priority\n`
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1)
      const urgency = ['P0', 'CRITICAL'].includes(priority) ? '🔴' : ['P1', 'HIGH'].includes(priority) ? '🟡' : '🟢'
      section += `- ${urgency} **${priority}:** ${count} (${percentage}%)\n`
    })
  }

  // ファイル別TOP10
  const topFiles = Object.entries(stats.byFile || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  if (topFiles.length > 0) {
    section += `\n### Top 10 Files by TODO Count\n`
    topFiles.forEach(([file, count], index) => {
      section += `${index + 1}. **${file}:** ${count}\n`
    })
  }
  
  return section
}

// 緊急度分析の生成
function generateUrgencyAnalysis(todos) {
  let section = `\n## 🚨 Urgency Analysis

`

  const urgentTodos = todos.filter(
    (todo) =>
      ['P0', 'CRITICAL'].includes(todo.priority) || (todo.daysUntilDeadline !== null && todo.daysUntilDeadline <= 7)
  )

  if (urgentTodos.length > 0) {
    section += `### 🔴 Critical/Urgent Items (${urgentTodos.length})

`
    urgentTodos.forEach((todo) => {
      const file = path.relative(process.cwd(), todo.filePath)
      const urgencyReason = ['P0', 'CRITICAL'].includes(todo.priority) ? 'High Priority' : 'Near Deadline'

      section += `#### ${todo.type}: ${todo.description}
- **File:** \`${file}:${todo.lineNumber}\`
- **Reason:** ${urgencyReason}
- **Issue:** ${todo.issueId || 'Not linked'}
- **Assignee:** ${todo.assignee || 'Unassigned'}
- **Deadline:** ${todo.date || 'No deadline'}

`
    })
  } else {
    section += `✅ No critical or urgent items found.

`
  }
  
  return section
}

// 技術的負債分析の生成
function generateTechnicalDebtAnalysis(todos) {
  const technicalDebtTodos = todos.filter((todo) => ['FIXME', 'HACK', 'BUG'].includes(todo.type))
  
  if (technicalDebtTodos.length === 0) {
    return ''
  }

  let section = `## 🔧 Technical Debt Analysis

**Technical Debt Items:** ${technicalDebtTodos.length}

### By Category
`

  const debtByType = {}
  technicalDebtTodos.forEach((todo) => {
    debtByType[todo.type] = (debtByType[todo.type] || 0) + 1
  })

  Object.entries(debtByType).forEach(([type, count]) => {
    section += `- **${type}:** ${count}\n`
  })

  section += `\n### Recommendations
`

  if (debtByType.BUG > 0) {
    section += `- 🐛 **${debtByType.BUG} bugs** should be prioritized for fixing\n`
  }
  if (debtByType.HACK > 0) {
    section += `- ⚡ **${debtByType.HACK} hacks** need proper implementation\n`
  }
  if (debtByType.FIXME > 0) {
    section += `- 🔨 **${debtByType.FIXME} fixes** are pending\n`
  }
  
  return section
}

// 改善提案セクションの生成
function generateRecommendationsSection(stats, todos) {
  let section = `\n## 💡 Recommendations

`

  const recommendations = generateRecommendations(stats, todos)
  recommendations.forEach((rec) => {
    section += `### ${rec.title}
${rec.description}

**Action Items:**
${rec.actions.map((action) => `- ${action}`).join('\n')}

`
  })
  
  return section
}

// 詳細TODO一覧の生成
function generateCompleteList(todos) {
  let section = `## 📝 Complete TODO List

`

  // ファイル別にグループ化
  const todosByFile = {}
  todos.forEach((todo) => {
    const file = path.relative(process.cwd(), todo.filePath)
    if (!todosByFile[file]) todosByFile[file] = []
    todosByFile[file].push(todo)
  })

  Object.entries(todosByFile).forEach(([file, fileTodos]) => {
    section += `### 📄 ${file}

`

    fileTodos
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .forEach((todo) => {
        const priorityBadge = todo.priority
          ? `![${todo.priority}](https://img.shields.io/badge/${todo.priority}-${getPriorityColor(todo.priority)})`
          : ''
        const issueBadge = todo.issueId
          ? `[${todo.issueId}](https://github.com/your-org/your-repo/issues/${todo.issueId.replace(/\D/g, '')})`
          : ''
        const statusBadge = getStatusBadge(todo)

        section += `#### Line ${todo.lineNumber}: ${todo.type} ${priorityBadge} ${statusBadge}

${todo.description}

`

        if (todo.issueId || todo.assignee || todo.date) {
          section += `**Details:**\n`
          if (todo.issueId) section += `- Issue: ${issueBadge}\n`
          if (todo.assignee) section += `- Assignee: @${todo.assignee}\n`
          if (todo.date) section += `- Deadline: ${todo.date}\n`
          section += `\n`
        }
      })
  })
  
  return section
}

// レポートフッターの生成
function generateReportFooter() {
  return `---

*This report was automatically generated by BoxLog TODO Management System.*
*For questions or issues, please contact the development team.*

**Legend:**
- 🔴 Critical/Urgent
- 🟡 High Priority  
- 🟢 Normal Priority
- ⚠️ Overdue
- 🕐 Expiring Soon
`
}

/**
 * 詳細なMarkdownレポートの生成
 */
function generateDetailedReport(todos, stats) {
  const sections = [
    generateReportHeader(),
    generateExecutiveSummary(stats),
    generateDetailedStatistics(stats),
    generateUrgencyAnalysis(todos),
    generateTechnicalDebtAnalysis(todos),
    generateRecommendationsSection(stats, todos),
    generateCompleteList(todos),
    generateReportFooter()
  ]
  
  return sections.join('')
}

/**
 * 健康スコアの計算
 */
function calculateHealthScore(stats) {
  if (stats.total === 0) return 100

  let score = 100

  // 構造化率（30点満点）
  const structuredRate = stats.structured / stats.total
  score -= (1 - structuredRate) * 30

  // 期限切れペナルティ（30点満点）
  if (stats.overdue > 0) {
    const overdueRate = stats.overdue / stats.total
    score -= overdueRate * 30
  }

  // TODOの量（20点満点）
  if (stats.total > 50) {
    score -= Math.min(((stats.total - 50) / 50) * 20, 20)
  }

  // 技術的負債（20点満点）
  const technicalDebtCount = (stats.byType?.FIXME || 0) + (stats.byType?.HACK || 0) + (stats.byType?.BUG || 0)
  if (technicalDebtCount > 0) {
    const debtRate = technicalDebtCount / stats.total
    score -= debtRate * 20
  }

  return Math.max(Math.round(score), 0)
}

/**
 * 改善提案の生成
 */
function generateRecommendations(stats, _todos) {
  const recommendations = []

  // 構造化率が低い場合
  if (stats.total > 0 && stats.structured / stats.total < 0.7) {
    recommendations.push({
      title: '📋 TODO構造化の改善',
      description: `${stats.legacy}個の非構造化TODOがあります。構造化率を向上させることで、管理とトラッキングが改善されます。`,
      actions: [
        'ESLint TODO構造化ルールを有効化',
        '既存の非構造化TODOを構造化形式に変換',
        'チーム向けのTODO記述ガイドラインを作成',
      ],
    })
  }

  // 期限切れがある場合
  if (stats.overdue > 0) {
    recommendations.push({
      title: '⚠️ 期限切れTODOの対処',
      description: `${stats.overdue}個のTODOが期限切れです。即座の対応が必要です。`,
      actions: ['期限切れTODOの優先度を再評価', '実現可能な新しい期限を設定', '必要に応じて担当者の再割り当て'],
    })
  }

  // TODOが多すぎる場合
  if (stats.total > 100) {
    recommendations.push({
      title: '📊 TODO数の最適化',
      description: `総TODO数が${stats.total}個と多すぎます。管理可能な数に減らすことを推奨します。`,
      actions: ['不要なTODOの削除', '重複TODOの統合', 'TODOをIssueに移行してコードベースから分離'],
    })
  }

  // 技術的負債が多い場合
  const technicalDebtCount = (stats.byType?.FIXME || 0) + (stats.byType?.HACK || 0) + (stats.byType?.BUG || 0)
  if (technicalDebtCount > stats.total * 0.3) {
    recommendations.push({
      title: '🔧 技術的負債の削減',
      description: `技術的負債関連のTODOが${technicalDebtCount}個あります（全体の${((technicalDebtCount / stats.total) * 100).toFixed(1)}%）。`,
      actions: ['リファクタリングスプリントの計画', 'バグ修正の優先度付け', 'ハックの正式実装への置き換え'],
    })
  }

  return recommendations
}

/**
 * 優先度の色を取得
 */
function getPriorityColor(priority) {
  switch (priority) {
    case 'P0':
    case 'CRITICAL':
      return 'red'
    case 'P1':
    case 'HIGH':
      return 'orange'
    case 'P2':
      return 'yellow'
    case 'P3':
    case 'LOW':
      return 'green'
    default:
      return 'lightgray'
  }
}

/**
 * ステータスバッジを取得
 */
function getStatusBadge(todo) {
  if (todo.daysUntilDeadline !== null) {
    if (todo.daysUntilDeadline < 0) {
      return '![Overdue](https://img.shields.io/badge/Status-Overdue-red)'
    } else if (todo.daysUntilDeadline <= 7) {
      return '![Expiring Soon](https://img.shields.io/badge/Status-Expiring%20Soon-orange)'
    }
  }
  return ''
}

/**
 * メイン実行関数
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}📋 BoxLog TODO Report Generator${colors.reset}\n`)

  try {
    // TODO統計の生成
    const { todos, stats } = generateTodoStats()

    if (stats.total === 0) {
      console.log(`${colors.green}🎉 TODOが見つかりませんでした！${colors.reset}`)

      // 空のレポートを生成
      const emptyReport = `# 📋 BoxLog TODO/FIXME Report

*Generated on ${new Date().toISOString().split('T')[0]}*

## 🎉 Great News!

No TODO/FIXME items found in the codebase!

Your code is clean and well-maintained. Keep up the excellent work! 🚀
`

      const outputPath = path.join(REPORT_CONFIG.outputDir, REPORT_CONFIG.reportFile)
      fs.writeFileSync(outputPath, emptyReport)
      console.log(`${colors.green}✅ 空のレポートを生成しました: ${outputPath}${colors.reset}`)
      return
    }

    // 詳細レポートの生成
    console.log(`${colors.cyan}📄 詳細レポートを生成中...${colors.reset}`)
    const report = generateDetailedReport(todos, stats)

    // レポートファイルの保存
    const outputPath = path.join(REPORT_CONFIG.outputDir, REPORT_CONFIG.reportFile)
    fs.writeFileSync(outputPath, report)

    console.log(`${colors.green}✅ TODOレポートを生成しました: ${outputPath}${colors.reset}`)
    console.log(
      `${colors.blue}📊 統計: ${stats.total}個のTODO/FIXME（構造化: ${stats.structured}, 非構造化: ${stats.legacy}）${colors.reset}`
    )

    // 健康スコアの表示
    const healthScore = calculateHealthScore(stats)
    const healthColor = healthScore >= 80 ? colors.green : healthScore >= 60 ? colors.yellow : colors.red
    console.log(`${colors.bold}🏥 健康スコア: ${healthColor}${healthScore}/100${colors.reset}`)

    // 警告の表示
    if (stats.overdue > 0) {
      console.log(`${colors.red}⚠️ ${stats.overdue}個の期限切れTODOがあります！${colors.reset}`)
    }

    if (stats.expiringSoon > 0) {
      console.log(`${colors.yellow}🕐 ${stats.expiringSoon}個のTODOが期限間近です${colors.reset}`)
    }
  } catch (error) {
    console.error(`${colors.red}❌ レポート生成中にエラーが発生しました:${colors.reset}`, error.message)
    process.exit(1)
  }
}

// CLI実行
if (require.main === module) {
  main()
}

module.exports = {
  generateDetailedReport,
  calculateHealthScore,
  generateRecommendations,
}
