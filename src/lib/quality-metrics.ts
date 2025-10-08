// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * 品質メトリクス収集ライブラリ
 * ESLint、TypeScript、テストカバレッジ、バンドルサイズ、Core Web Vitalsの測定
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export interface QualityMetrics {
  timestamp: string
  week: number

  // コード品質
  codeQuality: {
    eslint: { errors: number; warnings: number; details: ESLintResult[] }
    typescript: { errors: number; details: TypeScriptError[] }
    prettier: { unformatted: number }
  }

  // テスト
  testing: {
    coverage: { lines: number; branches: number; functions: number; statements: number }
    testCount: number
    passRate: number
  }

  // パフォーマンス
  performance: {
    bundleSize: { main: number; total: number; breakdown: BundleBreakdown[] }
    buildTime: number
    coreWebVitals: { lcp: number; fid: number; cls: number }
  }

  // 技術的負債
  technicalDebt: {
    todoCount: number
    deprecatedUsage: number
    complexityScore: number
    duplicateCode: number
    details: TechnicalDebtDetail[]
  }

  // エラー分析
  errors: {
    last7Days: number
    topErrors: ErrorSummary[]
    errorRate: number
  }

  // 改善提案
  recommendations: Recommendation[]
}

export interface ESLintResult {
  filePath: string
  errorCount: number
  warningCount: number
  messages: {
    ruleId: string
    severity: number
    message: string
    line: number
    column: number
  }[]
}

export interface TypeScriptError {
  file: string
  line: number
  column: number
  code: number
  message: string
}

export interface BundleBreakdown {
  name: string
  size: number
  gzipSize: number
}

export interface TechnicalDebtDetail {
  type: 'todo' | 'fixme' | 'deprecated' | 'complexity' | 'duplicate'
  file: string
  line: number
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ErrorSummary {
  message: string
  count: number
  lastOccurred: string
  affectedUsers: number
}

export interface Recommendation {
  type: 'critical' | 'high' | 'medium' | 'low'
  category: 'security' | 'performance' | 'maintainability' | 'testing' | 'accessibility'
  message: string
  action: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
}

export class QualityMetricsCollector {
  private metrics: QualityMetrics
  private rootPath: string

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath
    this.metrics = {
      timestamp: new Date().toISOString(),
      week: this.getWeekNumber(),
      codeQuality: {
        eslint: { errors: 0, warnings: 0, details: [] },
        typescript: { errors: 0, details: [] },
        prettier: { unformatted: 0 },
      },
      testing: {
        coverage: { lines: 0, branches: 0, functions: 0, statements: 0 },
        testCount: 0,
        passRate: 0,
      },
      performance: {
        bundleSize: { main: 0, total: 0, breakdown: [] },
        buildTime: 0,
        coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      },
      technicalDebt: {
        todoCount: 0,
        deprecatedUsage: 0,
        complexityScore: 0,
        duplicateCode: 0,
        details: [],
      },
      errors: {
        last7Days: 0,
        topErrors: [],
        errorRate: 0,
      },
      recommendations: [],
    }
  }

  /**
   * すべてのメトリクスを収集
   */
  async collectAll(): Promise<QualityMetrics> {
    console.log('📊 品質メトリクス収集開始...')

    try {
      await this.analyzeESLint()
      await this.analyzeTypeScript()
      await this.analyzeTestCoverage()
      await this.analyzeBundleSize()
      await this.analyzeTechnicalDebt()
      await this.generateRecommendations()

      console.log('✅ メトリクス収集完了')
      return this.metrics
    } catch (error) {
      console.error('❌ メトリクス収集エラー:', error)
      throw error
    }
  }

  /**
   * ESLint分析
   */
  private async analyzeESLint(): Promise<void> {
    try {
      console.log('🔍 ESLint分析中...')
      const result = execSync('npx eslint . --format json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        cwd: this.rootPath,
      })

      const data: ESLintResult[] = JSON.parse(result)
      let totalErrors = 0
      let totalWarnings = 0

      data.forEach((file) => {
        totalErrors += file.errorCount
        totalWarnings += file.warningCount
      })

      this.metrics.codeQuality.eslint = {
        errors: totalErrors,
        warnings: totalWarnings,
        details: data.filter((f) => f.errorCount > 0 || f.warningCount > 0),
      }

      console.log(`  ESLint: ${totalErrors}エラー, ${totalWarnings}警告`)
    } catch (error) {
      console.error('ESLint分析エラー:', error)
      // エラーがあっても処理を続行
    }
  }

  /**
   * TypeScript分析
   */
  private async analyzeTypeScript(): Promise<void> {
    try {
      console.log('🔍 TypeScript分析中...')
      const result = execSync('npx tsc --noEmit --pretty false 2>&1', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.rootPath,
      })

      const errors = this.parseTypeScriptErrors(result)
      this.metrics.codeQuality.typescript = {
        errors: errors.length,
        details: errors,
      }

      console.log(`  TypeScript: ${errors.length}エラー`)
    } catch (error) {
      // TypeScriptエラーがある場合
      const output = error.stdout?.toString() || error.message
      const errors = this.parseTypeScriptErrors(output)
      this.metrics.codeQuality.typescript = {
        errors: errors.length,
        details: errors,
      }
      console.log(`  TypeScript: ${errors.length}エラー`)
    }
  }

  /**
   * テストカバレッジ分析
   */
  private async analyzeTestCoverage(): Promise<void> {
    try {
      console.log('🔍 テストカバレッジ分析中...')

      // カバレッジレポートの生成
      execSync('npm run test:coverage', {
        stdio: 'ignore',
        cwd: this.rootPath,
      })

      const coveragePath = path.resolve(this.rootPath, 'coverage/coverage-summary.json')
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
        this.metrics.testing.coverage = {
          lines: coverage.total.lines.pct || 0,
          branches: coverage.total.branches.pct || 0,
          functions: coverage.total.functions.pct || 0,
          statements: coverage.total.statements.pct || 0,
        }
        console.log(`  カバレッジ: ${coverage.total.lines.pct}%`)
      }
    } catch (error) {
      console.error('カバレッジ分析エラー:', error)
    }
  }

  /**
   * バンドルサイズ分析
   */
  private async analyzeBundleSize(): Promise<void> {
    try {
      console.log('🔍 バンドルサイズ分析中...')

      // Next.js ビルド
      const buildStart = Date.now()
      execSync('npm run build', {
        stdio: 'ignore',
        cwd: this.rootPath,
      })
      this.metrics.performance.buildTime = Date.now() - buildStart

      // .next/static の分析
      const staticPath = path.resolve(this.rootPath, '.next/static')
      if (fs.existsSync(staticPath)) {
        const bundleInfo = this.analyzeBundleFiles(staticPath)
        this.metrics.performance.bundleSize = bundleInfo
        console.log(`  バンドルサイズ: ${(bundleInfo.total / 1024 / 1024).toFixed(2)}MB`)
      }
    } catch (error) {
      console.error('バンドルサイズ分析エラー:', error)
    }
  }

  /**
   * 技術的負債分析
   */
  private async analyzeTechnicalDebt(): Promise<void> {
    try {
      console.log('🔍 技術的負債分析中...')

      const details: TechnicalDebtDetail[] = []

      // TODO/FIXME カウント
      const todoResult = execSync('grep -rn "TODO\\|FIXME" src/ || true', {
        encoding: 'utf8',
        cwd: this.rootPath,
      })

      const todoLines = todoResult.split('\n').filter(Boolean)
      todoLines.forEach((line) => {
        const match = line.match(/^([^:]+):(\d+):(.*)$/)
        if (match) {
          details.push({
            type: line.includes('FIXME') ? 'fixme' : 'todo',
            file: match[1],
            line: parseInt(match[2]),
            message: match[3].trim(),
            severity: line.includes('FIXME') ? 'high' : 'medium',
          })
        }
      })

      this.metrics.technicalDebt = {
        todoCount: todoLines.length,
        deprecatedUsage: 0, // 実装予定
        complexityScore: 0, // 実装予定
        duplicateCode: 0, // 実装予定
        details,
      }

      console.log(`  TODO/FIXME: ${todoLines.length}個`)
    } catch (error) {
      console.error('技術的負債分析エラー:', error)
    }
  }

  /**
   * 改善提案生成
   */
  private async generateRecommendations(): Promise<void> {
    const recommendations: Recommendation[] = []

    // ESLintエラーベースの提案
    if (this.metrics.codeQuality.eslint.errors > 0) {
      recommendations.push({
        type: this.metrics.codeQuality.eslint.errors > 10 ? 'critical' : 'high',
        category: 'maintainability',
        message: `ESLintエラーが${this.metrics.codeQuality.eslint.errors}件あります`,
        action: 'npm run lint:fix を実行してエラーを修正してください',
        effort: 'medium',
        impact: 'high',
      })
    }

    // TypeScriptエラーベースの提案
    if (this.metrics.codeQuality.typescript.errors > 0) {
      recommendations.push({
        type: this.metrics.codeQuality.typescript.errors > 5 ? 'critical' : 'high',
        category: 'maintainability',
        message: `TypeScriptエラーが${this.metrics.codeQuality.typescript.errors}件あります`,
        action: '型定義を修正してください',
        effort: 'high',
        impact: 'high',
      })
    }

    // カバレッジベースの提案
    if (this.metrics.testing.coverage.lines < 80) {
      recommendations.push({
        type: 'medium',
        category: 'testing',
        message: `テストカバレッジが${this.metrics.testing.coverage.lines}%です（目標: 80%）`,
        action: 'テストケースを追加してください',
        effort: 'medium',
        impact: 'medium',
      })
    }

    // バンドルサイズベースの提案
    if (this.metrics.performance.bundleSize.total > 5 * 1024 * 1024) {
      recommendations.push({
        type: 'high',
        category: 'performance',
        message: `バンドルサイズが${(this.metrics.performance.bundleSize.total / 1024 / 1024).toFixed(1)}MBです`,
        action: 'コード分割や遅延読み込みを検討してください',
        effort: 'high',
        impact: 'high',
      })
    }

    // 技術的負債ベースの提案
    if (this.metrics.technicalDebt.todoCount > 20) {
      recommendations.push({
        type: 'low',
        category: 'maintainability',
        message: `TODOコメントが${this.metrics.technicalDebt.todoCount}個あります`,
        action: 'GitHub Issueに移行してタスク管理を改善してください',
        effort: 'low',
        impact: 'low',
      })
    }

    this.metrics.recommendations = recommendations
  }

  /**
   * TypeScriptエラーのパース
   */
  private parseTypeScriptErrors(output: string): TypeScriptError[] {
    const errors: TypeScriptError[] = []
    const lines = output.split('\n')

    lines.forEach((line) => {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.+)$/)
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: parseInt(match[4]),
          message: match[5],
        })
      }
    })

    return errors
  }

  /**
   * バンドルファイル分析
   */
  private analyzeBundleFiles(staticPath: string): { main: number; total: number; breakdown: BundleBreakdown[] } {
    const breakdown: BundleBreakdown[] = []
    let total = 0
    let main = 0

    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir)
      files.forEach((file) => {
        const filePath = path.resolve(dir, file)
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
            gzipSize: size * 0.3, // 概算
          })
        }
      })
    }

    try {
      walkDir(staticPath)
    } catch (error) {
      console.error('バンドルファイル分析エラー:', error)
    }

    return { main, total, breakdown }
  }

  /**
   * 週番号取得
   */
  private getWeekNumber(): number {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }
}

/**
 * 品質スコア計算（100点満点）
 */
export function calculateQualityScore(metrics: QualityMetrics): number {
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

  // 技術的負債（TODO数、最大-10点）
  score -= Math.min(10, metrics.technicalDebt.todoCount / 5)

  // バンドルサイズ（5MB超で減点）
  const bundleMB = metrics.performance.bundleSize.total / (1024 * 1024)
  if (bundleMB > 5) {
    score -= Math.min(10, (bundleMB - 5) * 2)
  }

  return Math.max(0, Math.round(score))
}

/**
 * 品質グレード取得
 */
export function getQualityGrade(score: number): { grade: string; status: string } {
  if (score >= 90) return { grade: 'A', status: '優秀' }
  if (score >= 80) return { grade: 'B', status: '良好' }
  if (score >= 70) return { grade: 'C', status: '要改善' }
  if (score >= 60) return { grade: 'D', status: '問題あり' }
  return { grade: 'F', status: '危険' }
}
