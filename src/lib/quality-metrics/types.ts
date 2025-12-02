/**
 * 品質メトリクス型定義
 */

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
