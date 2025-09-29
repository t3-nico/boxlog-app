#!/usr/bin/env node

/**
 * 品質レポート生成スクリプト
 * 包括的な品質分析とレポート生成
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class QualityReporter {
  constructor() {
    this.rootPath = process.cwd()
    this.reportsDir = path.join(this.rootPath, 'reports', 'quality')
    this.ensureDirectories()

    this.metrics = {
      timestamp: new Date().toISOString(),
      week: this.getWeekNumber(),

      // コード品質
      codeQuality: {
        eslint: { errors: 0, warnings: 0, details: [] },
        typescript: { errors: 0, details: [] },
        prettier: { unformatted: 0 }
      },

      // テスト
      testing: {
        coverage: { lines: 0, branches: 0, functions: 0, statements: 0 },
        testCount: 0,
        passRate: 0
      },

      // パフォーマンス
      performance: {
        bundleSize: { main: 0, total: 0, breakdown: [] },
        buildTime: 0,
        coreWebVitals: { lcp: 0, fid: 0, cls: 0 }
      },

      // 技術的負債
      technicalDebt: {
        todoCount: 0,
        deprecatedUsage: 0,
        complexityScore: 0,
        duplicateCode: 0,
        details: []
      },

      // エラー分析
      errors: {
        last7Days: 0,
        topErrors: [],
        errorRate: 0
      },

      // 改善提案
      recommendations: []
    }
  }

  ensureDirectories() {
    const dirs = [
      this.reportsDir,
      path.join(this.reportsDir, 'history'),
      path.join(this.reportsDir, 'charts')
    ]

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * ESLint分析
   */
  analyzeESLint() {
    try {
      console.log('🔍 ESLint分析中...')
      const result = execSync('npx eslint . --format json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      })

      const data = JSON.parse(result)
      let errors = 0
      let warnings = 0
      const details = []

      data.forEach(file => {
        errors += file.errorCount
        warnings += file.warningCount

        if (file.errorCount > 0 || file.warningCount > 0) {
          details.push({
            filePath: file.filePath,
            errorCount: file.errorCount,
            warningCount: file.warningCount,
            messages: file.messages.map(msg => ({
              ruleId: msg.ruleId,
              severity: msg.severity,
              message: msg.message,
              line: msg.line,
              column: msg.column
            }))
          })
        }
      })

      this.metrics.codeQuality.eslint = { errors, warnings, details }

      // 前週との比較
      const lastWeek = this.loadLastWeekMetrics()
      if (lastWeek && errors > lastWeek.codeQuality.eslint.errors) {
        const diff = errors - lastWeek.codeQuality.eslint.errors
        this.metrics.recommendations.push({
          type: 'critical',
          category: 'maintainability',
          message: `ESLintエラーが${diff}件増加しています`,
          action: 'npm run lint:fix を実行してください',
          effort: 'medium',
          impact: 'high'
        })
      }

      console.log(`  ESLint: ${errors}エラー, ${warnings}警告`)
    } catch (error) {
      console.error('ESLint分析エラー:', error.message)
    }
  }

  /**
   * TypeScript分析
   */
  analyzeTypeScript() {
    try {
      console.log('🔍 TypeScript分析中...')
      const result = execSync('npx tsc --noEmit --pretty false 2>&1', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      })

      const errors = this.parseTypeScriptErrors(result)
      this.metrics.codeQuality.typescript = {
        errors: errors.length,
        details: errors
      }

      if (errors.length > 10) {
        this.metrics.recommendations.push({
          type: 'high',
          category: 'maintainability',
          message: `TypeScriptエラーが${errors.length}件あります`,
          action: '型定義の修正が必要です',
          effort: 'high',
          impact: 'high'
        })
      }

      console.log(`  TypeScript: ${errors.length}エラー`)
    } catch (error) {
      // TypeScriptエラーがある場合も処理継続
      const output = error.stdout?.toString() || ''
      const errors = this.parseTypeScriptErrors(output)
      this.metrics.codeQuality.typescript = {
        errors: errors.length,
        details: errors
      }
      console.log(`  TypeScript: ${errors.length}エラー`)
    }
  }

  /**
   * テストカバレッジ分析
   */
  analyzeTestCoverage() {
    try {
      console.log('🔍 テストカバレッジ分析中...')

      // Vitestでカバレッジ生成を試行
      try {
        execSync('npm run test:coverage', {
          stdio: 'ignore'
        })
      } catch {
        // テストが存在しない場合は無視
        console.log('  テスト未設定、カバレッジ分析をスキップ')
        return
      }

      const coveragePath = path.join(this.rootPath, 'coverage/coverage-summary.json')
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
        this.metrics.testing.coverage = {
          lines: coverage.total.lines.pct || 0,
          branches: coverage.total.branches.pct || 0,
          functions: coverage.total.functions.pct || 0,
          statements: coverage.total.statements.pct || 0
        }

        if (coverage.total.lines.pct < 80) {
          this.metrics.recommendations.push({
            type: 'medium',
            category: 'testing',
            message: `テストカバレッジが${coverage.total.lines.pct}%です（目標: 80%）`,
            action: 'テストを追加してください',
            effort: 'medium',
            impact: 'medium'
          })
        }

        console.log(`  カバレッジ: ${coverage.total.lines.pct}%`)
      }
    } catch (error) {
      console.error('カバレッジ分析エラー:', error.message)
    }
  }

  /**
   * バンドルサイズ分析
   */
  analyzeBundleSize() {
    try {
      console.log('🔍 バンドルサイズ分析中...')

      // Next.js ビルド
      const buildStart = Date.now()
      try {
        execSync('npm run build', {
          stdio: 'ignore'
        })
        this.metrics.performance.buildTime = Date.now() - buildStart
      } catch (error) {
        console.log('  ビルドエラー、バンドルサイズ分析をスキップ')
        return
      }

      // .next/static の分析
      const staticPath = path.join(this.rootPath, '.next/static')
      if (fs.existsSync(staticPath)) {
        const bundleInfo = this.analyzeBundleFiles(staticPath)
        this.metrics.performance.bundleSize = bundleInfo

        if (bundleInfo.total > 5 * 1024 * 1024) { // 5MB
          this.metrics.recommendations.push({
            type: 'high',
            category: 'performance',
            message: `バンドルサイズが${(bundleInfo.total / 1024 / 1024).toFixed(1)}MBです`,
            action: 'コード分割や遅延読み込みを検討してください',
            effort: 'high',
            impact: 'high'
          })
        }

        console.log(`  バンドルサイズ: ${(bundleInfo.total / 1024 / 1024).toFixed(2)}MB`)
      }
    } catch (error) {
      console.error('バンドルサイズ分析エラー:', error.message)
    }
  }

  /**
   * 技術的負債分析
   */
  analyzeTechnicalDebt() {
    try {
      console.log('🔍 技術的負債分析中...')

      const details = []

      // TODO/FIXME カウント
      const todoResult = execSync('grep -rn "TODO\\|FIXME" src/ || true', {
        encoding: 'utf8'
      })

      const todoLines = todoResult.split('\n').filter(Boolean)
      todoLines.forEach(line => {
        const match = line.match(/^([^:]+):(\d+):(.*)$/)
        if (match) {
          details.push({
            type: line.includes('FIXME') ? 'fixme' : 'todo',
            file: match[1],
            line: parseInt(match[2]),
            message: match[3].trim(),
            severity: line.includes('FIXME') ? 'high' : 'medium'
          })
        }
      })

      // 複雑度分析（簡易版）
      let complexityScore = 0
      try {
        const complexityResult = execSync('npx eslint . --rule "complexity: [error, 10]" --format json', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        })

        const complexityData = JSON.parse(complexityResult)
        complexityData.forEach(file => {
          complexityScore += file.messages.filter(m => m.ruleId === 'complexity').length
        })
      } catch {
        // 複雑度分析エラーは無視
      }

      this.metrics.technicalDebt = {
        todoCount: todoLines.length,
        deprecatedUsage: 0, // 将来実装
        complexityScore,
        duplicateCode: 0, // 将来実装
        details
      }

      if (todoLines.length > 20) {
        this.metrics.recommendations.push({
          type: 'low',
          category: 'maintainability',
          message: `TODOコメントが${todoLines.length}個あります`,
          action: 'GitHub Issueに移行してください',
          effort: 'low',
          impact: 'low'
        })
      }

      console.log(`  TODO/FIXME: ${todoLines.length}個`)
    } catch (error) {
      console.error('技術的負債分析エラー:', error.message)
    }
  }

  /**
   * レポート生成
   */
  generateReport() {
    const score = this.calculateQualityScore()
    const gradeInfo = this.getQualityGrade(score)

    const report = {
      ...this.metrics,
      score,
      grade: gradeInfo.grade,
      status: gradeInfo.status,
      summary: {
        score,
        grade: gradeInfo.grade,
        status: gradeInfo.status,
        trend: this.calculateTrend()
      }
    }

    // JSON保存
    const timestamp = new Date().toISOString().split('T')[0]
    const jsonPath = path.join(this.reportsDir, `quality-report-${timestamp}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

    // Markdown生成
    const markdown = this.generateMarkdown(report)
    const mdPath = path.join(this.reportsDir, `quality-report-${timestamp}.md`)
    fs.writeFileSync(mdPath, markdown)

    // 履歴保存
    const historyPath = path.join(this.reportsDir, 'history', `${timestamp}.json`)
    fs.writeFileSync(historyPath, JSON.stringify({
      timestamp: report.timestamp,
      score: report.score,
      grade: report.grade,
      codeQuality: report.codeQuality,
      testing: report.testing,
      performance: report.performance,
      technicalDebt: report.technicalDebt
    }, null, 2))

    console.log(`📄 レポート保存完了:`)
    console.log(`  JSON: ${jsonPath}`)
    console.log(`  Markdown: ${mdPath}`)

    return report
  }

  /**
   * 品質スコア計算（100点満点）
   */
  calculateQualityScore() {
    let score = 100

    // ESLintエラー（-1点/エラー）
    score -= Math.min(20, this.metrics.codeQuality.eslint.errors)

    // TypeScriptエラー（-2点/エラー）
    score -= Math.min(20, this.metrics.codeQuality.typescript.errors * 2)

    // カバレッジ（80%未満で減点）
    const coverage = this.metrics.testing.coverage.lines || 0
    if (coverage < 80) {
      score -= Math.min(20, (80 - coverage) / 2)
    }

    // 技術的負債
    score -= Math.min(10, this.metrics.technicalDebt.todoCount / 5)
    score -= Math.min(10, this.metrics.technicalDebt.complexityScore)

    // バンドルサイズ
    const bundleMB = this.metrics.performance.bundleSize.total / (1024 * 1024)
    if (bundleMB > 5) {
      score -= Math.min(10, (bundleMB - 5) * 2)
    }

    return Math.max(0, Math.round(score))
  }

  /**
   * 品質グレード取得
   */
  getQualityGrade(score) {
    if (score >= 90) return { grade: 'A', status: '優秀' }
    if (score >= 80) return { grade: 'B', status: '良好' }
    if (score >= 70) return { grade: 'C', status: '要改善' }
    if (score >= 60) return { grade: 'D', status: '問題あり' }
    return { grade: 'F', status: '危険' }
  }

  /**
   * Markdownレポート生成
   */
  generateMarkdown(report) {
    return `# 📊 BoxLog 品質レポート - ${new Date().toLocaleDateString('ja-JP')}

## 📈 総合評価

- **スコア**: ${report.score}/100点
- **グレード**: ${report.grade}
- **状態**: ${report.status}
- **トレンド**: ${report.summary.trend}

## 🔍 詳細メトリクス

### コード品質
- **ESLintエラー**: ${report.codeQuality.eslint.errors}件
- **ESLint警告**: ${report.codeQuality.eslint.warnings}件
- **TypeScriptエラー**: ${report.codeQuality.typescript.errors}件

### テスト
- **行カバレッジ**: ${report.testing.coverage.lines}%
- **分岐カバレッジ**: ${report.testing.coverage.branches}%
- **関数カバレッジ**: ${report.testing.coverage.functions}%
- **文カバレッジ**: ${report.testing.coverage.statements}%

### パフォーマンス
- **バンドルサイズ**: ${(report.performance.bundleSize.total / 1024 / 1024).toFixed(2)}MB
- **ビルド時間**: ${Math.round(report.performance.buildTime / 1000)}秒

### 技術的負債
- **TODOコメント**: ${report.technicalDebt.todoCount}個
- **高複雑度関数**: ${report.technicalDebt.complexityScore}個

## 💡 改善提案

${report.recommendations.length > 0
  ? report.recommendations.map(r => `### ${r.type.toUpperCase()}: ${r.message}

**カテゴリ**: ${r.category}
**対策**: ${r.action}
**工数**: ${r.effort} | **影響度**: ${r.impact}

`).join('\n')
  : '現在、特に改善が必要な項目はありません。 🎉'
}

## 📅 次回アクション

${this.generateActionItems(report)}

## 📈 過去データとの比較

${this.generateTrendAnalysis()}

---
*このレポートは自動生成されました - ${report.timestamp}*
*Issue #356: 自動品質レポートシステム*`
  }

  /**
   * アクションアイテム生成
   */
  generateActionItems(report) {
    const actions = []

    const critical = report.recommendations.filter(r => r.type === 'critical')
    const high = report.recommendations.filter(r => r.type === 'high')

    if (critical.length > 0) {
      actions.push('1. **最優先**: criticalレベルの問題を解決')
    }

    if (high.length > 0) {
      actions.push('2. **今週中**: highレベルの問題に着手')
    }

    if (report.testing.coverage.lines < 80) {
      actions.push('3. **来週**: カバレッジ向上施策')
    }

    if (actions.length === 0) {
      actions.push('継続的な品質維持に努めてください')
    }

    return actions.join('\n')
  }

  /**
   * トレンド分析生成
   */
  generateTrendAnalysis() {
    const lastWeek = this.loadLastWeekMetrics()
    if (!lastWeek) {
      return '前回データが見つかりません（初回実行）'
    }

    const trends = []

    const eslintDiff = this.metrics.codeQuality.eslint.errors - lastWeek.codeQuality.eslint.errors
    if (eslintDiff !== 0) {
      trends.push(`- ESLintエラー: ${eslintDiff > 0 ? '+' : ''}${eslintDiff}件`)
    }

    const tsDiff = this.metrics.codeQuality.typescript.errors - lastWeek.codeQuality.typescript.errors
    if (tsDiff !== 0) {
      trends.push(`- TypeScriptエラー: ${tsDiff > 0 ? '+' : ''}${tsDiff}件`)
    }

    return trends.length > 0 ? trends.join('\n') : '前回から変化なし'
  }

  /**
   * TypeScriptエラーのパース
   */
  parseTypeScriptErrors(output) {
    const errors = []
    const lines = output.split('\n')

    lines.forEach(line => {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.+)$/)
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: parseInt(match[4]),
          message: match[5]
        })
      }
    })

    return errors
  }

  /**
   * バンドルファイル分析
   */
  analyzeBundleFiles(staticPath) {
    const breakdown = []
    let total = 0
    let main = 0

    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            walkDir(filePath)
          } else if (file.endsWith('.js') || file.endsWith('.css')) {
            const size = stat.size
            total += size

            if (file.includes('main') || file.includes('index')) {
              main += size
            }

            breakdown.push({
              name: file,
              size,
              gzipSize: Math.round(size * 0.3) // 概算
            })
          }
        })
      } catch (error) {
        console.error('バンドルファイル分析エラー:', error)
      }
    }

    walkDir(staticPath)
    return { main, total, breakdown }
  }

  /**
   * 前週データ読み込み
   */
  loadLastWeekMetrics() {
    try {
      const historyDir = path.join(this.reportsDir, 'history')
      if (!fs.existsSync(historyDir)) return null

      const files = fs.readdirSync(historyDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()

      if (files.length > 1) {
        const lastFile = files[1] // 2番目に新しい（前回）
        const data = fs.readFileSync(path.join(historyDir, lastFile), 'utf8')
        return JSON.parse(data)
      }

      return null
    } catch (error) {
      return null
    }
  }

  /**
   * トレンド計算
   */
  calculateTrend() {
    const lastWeek = this.loadLastWeekMetrics()
    if (!lastWeek) return '→ データなし'

    const currentScore = this.calculateQualityScore()
    const lastScore = lastWeek.score || 0

    if (currentScore > lastScore) return '↗ 改善'
    if (currentScore < lastScore) return '↘ 悪化'
    return '→ 横ばい'
  }

  /**
   * 週番号取得
   */
  getWeekNumber() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }

  /**
   * 実行
   */
  async run() {
    console.log('📊 BoxLog 品質レポート生成開始...')

    this.analyzeESLint()
    this.analyzeTypeScript()
    this.analyzeTestCoverage()
    this.analyzeBundleSize()
    this.analyzeTechnicalDebt()

    const report = this.generateReport()

    console.log(`\n📊 品質レポート概要:`)
    console.log(`  スコア: ${report.score}/100 (${report.grade})`)
    console.log(`  状態: ${report.status}`)
    console.log(`  ESLintエラー: ${report.codeQuality.eslint.errors}件`)
    console.log(`  TypeScriptエラー: ${report.codeQuality.typescript.errors}件`)
    console.log(`  改善提案: ${report.recommendations.length}件`)

    return report
  }
}

// 実行
if (require.main === module) {
  const reporter = new QualityReporter()
  reporter.run().catch(console.error)
}

module.exports = QualityReporter