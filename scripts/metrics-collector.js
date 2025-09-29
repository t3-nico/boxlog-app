#!/usr/bin/env node

/**
 * メトリクス収集スクリプト
 * 品質メトリクスを収集し、JSONファイルとして保存
 */

const fs = require('fs')
const path = require('path')

// TypeScript版のメトリクス収集ライブラリを使用するため、
// Node.js用のラッパースクリプトとして実装

class SimpleMetricsCollector {
  constructor() {
    this.rootPath = process.cwd()
    this.reportsDir = path.join(this.rootPath, 'reports', 'quality')
    this.ensureReportsDir()
  }

  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
    }
  }

  /**
   * メトリクス収集の実行
   */
  async collect() {
    console.log('📊 品質メトリクス収集開始...')

    try {
      // TypeScript版を実行
      const { execSync } = require('child_process')

      // TypeScriptファイルを直接実行
      const result = execSync('npx tsx src/lib/quality-metrics.ts', {
        encoding: 'utf8',
        cwd: this.rootPath
      })

      console.log('✅ メトリクス収集完了')
      return JSON.parse(result)
    } catch (error) {
      console.error('❌ メトリクス収集エラー:', error.message)

      // エラー時は基本的なメトリクスのみ収集
      return await this.collectBasicMetrics()
    }
  }

  /**
   * 基本的なメトリクスのみ収集（フォールバック）
   */
  async collectBasicMetrics() {
    const { execSync } = require('child_process')

    const metrics = {
      timestamp: new Date().toISOString(),
      week: this.getWeekNumber(),
      codeQuality: {
        eslint: { errors: 0, warnings: 0 },
        typescript: { errors: 0 },
        prettier: { unformatted: 0 }
      },
      testing: {
        coverage: { lines: 0, branches: 0, functions: 0, statements: 0 },
        testCount: 0,
        passRate: 0
      },
      performance: {
        bundleSize: { main: 0, total: 0 },
        buildTime: 0,
        coreWebVitals: { lcp: 0, fid: 0, cls: 0 }
      },
      technicalDebt: {
        todoCount: 0,
        deprecatedUsage: 0,
        complexityScore: 0,
        duplicateCode: 0
      },
      errors: {
        last7Days: 0,
        topErrors: [],
        errorRate: 0
      },
      recommendations: []
    }

    try {
      // ESLint分析
      console.log('🔍 ESLint分析中...')
      const eslintResult = execSync('npx eslint . --format json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      })

      const eslintData = JSON.parse(eslintResult)
      let errors = 0, warnings = 0
      eslintData.forEach(file => {
        errors += file.errorCount
        warnings += file.warningCount
      })

      metrics.codeQuality.eslint = { errors, warnings }
      console.log(`  ESLint: ${errors}エラー, ${warnings}警告`)
    } catch (error) {
      console.log('  ESLint: スキップ（エラー）')
    }

    try {
      // TypeScript分析
      console.log('🔍 TypeScript分析中...')
      const tsResult = execSync('npx tsc --noEmit --pretty false 2>&1', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      })

      const errorCount = (tsResult.match(/error TS/g) || []).length
      metrics.codeQuality.typescript.errors = errorCount
      console.log(`  TypeScript: ${errorCount}エラー`)
    } catch (error) {
      const output = error.stdout?.toString() || ''
      const errorCount = (output.match(/error TS/g) || []).length
      metrics.codeQuality.typescript.errors = errorCount
      console.log(`  TypeScript: ${errorCount}エラー`)
    }

    try {
      // TODO/FIXME カウント
      console.log('🔍 技術的負債分析中...')
      const todoResult = execSync('grep -r "TODO\\|FIXME" src/ || true', {
        encoding: 'utf8'
      })

      const todoCount = todoResult.split('\n').filter(Boolean).length
      metrics.technicalDebt.todoCount = todoCount
      console.log(`  TODO/FIXME: ${todoCount}個`)
    } catch (error) {
      console.log('  技術的負債: スキップ（エラー）')
    }

    // 改善提案生成
    this.generateBasicRecommendations(metrics)

    return metrics
  }

  /**
   * 基本的な改善提案生成
   */
  generateBasicRecommendations(metrics) {
    const recommendations = []

    if (metrics.codeQuality.eslint.errors > 0) {
      recommendations.push({
        type: metrics.codeQuality.eslint.errors > 10 ? 'critical' : 'high',
        category: 'maintainability',
        message: `ESLintエラーが${metrics.codeQuality.eslint.errors}件あります`,
        action: 'npm run lint:fix を実行してください',
        effort: 'medium',
        impact: 'high'
      })
    }

    if (metrics.codeQuality.typescript.errors > 0) {
      recommendations.push({
        type: metrics.codeQuality.typescript.errors > 5 ? 'critical' : 'high',
        category: 'maintainability',
        message: `TypeScriptエラーが${metrics.codeQuality.typescript.errors}件あります`,
        action: '型定義を修正してください',
        effort: 'high',
        impact: 'high'
      })
    }

    if (metrics.technicalDebt.todoCount > 20) {
      recommendations.push({
        type: 'low',
        category: 'maintainability',
        message: `TODOコメントが${metrics.technicalDebt.todoCount}個あります`,
        action: 'GitHub Issueに移行してください',
        effort: 'low',
        impact: 'low'
      })
    }

    metrics.recommendations = recommendations
  }

  /**
   * 品質スコア計算
   */
  calculateQualityScore(metrics) {
    let score = 100

    // ESLintエラー（-1点/エラー、最大-20点）
    score -= Math.min(20, metrics.codeQuality.eslint.errors)

    // TypeScriptエラー（-2点/エラー、最大-20点）
    score -= Math.min(20, metrics.codeQuality.typescript.errors * 2)

    // カバレッジ（80%未満で減点）
    const coverage = metrics.testing.coverage.lines
    if (coverage < 80) {
      score -= Math.min(20, (80 - coverage) / 2)
    }

    // 技術的負債
    score -= Math.min(10, metrics.technicalDebt.todoCount / 5)

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
   * レポート保存
   */
  saveReport(metrics) {
    const score = this.calculateQualityScore(metrics)
    const gradeInfo = this.getQualityGrade(score)

    const report = {
      ...metrics,
      score,
      grade: gradeInfo.grade,
      status: gradeInfo.status,
      summary: {
        score,
        grade: gradeInfo.grade,
        status: gradeInfo.status,
        trend: '→ 横ばい' // 将来的には前回比較を実装
      }
    }

    // JSONファイル保存
    const timestamp = new Date().toISOString().split('T')[0]
    const jsonPath = path.join(this.reportsDir, `quality-report-${timestamp}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

    // Markdownレポート生成
    const markdown = this.generateMarkdownReport(report)
    const mdPath = path.join(this.reportsDir, `quality-report-${timestamp}.md`)
    fs.writeFileSync(mdPath, markdown)

    console.log(`📄 レポート保存完了:`)
    console.log(`  JSON: ${jsonPath}`)
    console.log(`  Markdown: ${mdPath}`)

    return { jsonPath, mdPath, report }
  }

  /**
   * Markdownレポート生成
   */
  generateMarkdownReport(report) {
    return `# 📊 品質レポート - ${new Date().toLocaleDateString('ja-JP')}

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
- **ビルド時間**: ${report.performance.buildTime}ms

### 技術的負債
- **TODOコメント**: ${report.technicalDebt.todoCount}個
- **非推奨使用**: ${report.technicalDebt.deprecatedUsage}個
- **複雑度スコア**: ${report.technicalDebt.complexityScore}

## 💡 改善提案

${report.recommendations.length > 0
  ? report.recommendations.map(r => `- **[${r.type.toUpperCase()}]** ${r.message}
  - **対策**: ${r.action}
  - **工数**: ${r.effort} | **影響度**: ${r.impact}`).join('\n\n')
  : '現在、特に改善が必要な項目はありません。 🎉'
}

## 📅 次回アクション

${report.recommendations.filter(r => r.type === 'critical').length > 0
  ? '1. **最優先**: criticalレベルの問題を解決'
  : ''
}
${report.recommendations.filter(r => r.type === 'high').length > 0
  ? '2. **今週中**: highレベルの問題に着手'
  : ''
}
${report.testing.coverage.lines < 80
  ? '3. **来週**: カバレッジ向上施策'
  : ''
}

---
*このレポートは自動生成されました - ${report.timestamp}*`
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
    try {
      const metrics = await this.collectBasicMetrics()
      const result = this.saveReport(metrics)

      console.log(`\n📊 品質レポート概要:`)
      console.log(`  スコア: ${result.report.score}/100 (${result.report.grade})`)
      console.log(`  状態: ${result.report.status}`)
      console.log(`  推奨アクション: ${result.report.recommendations.length}件`)

      return result
    } catch (error) {
      console.error('❌ レポート生成エラー:', error)
      process.exit(1)
    }
  }
}

// コマンドライン実行
if (require.main === module) {
  const collector = new SimpleMetricsCollector()
  collector.run().catch(console.error)
}

module.exports = SimpleMetricsCollector