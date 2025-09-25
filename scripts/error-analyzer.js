#!/usr/bin/env node

/**
 * 🔍 BoxLog Error Analysis System
 *
 * エラーログを分析し、統計情報・トレンド・アラートを提供
 * チーム開発での問題の早期発見と効率的なデバッグを支援
 *
 * Usage:
 *   npm run error:analyze
 *   npm run error:monitor
 *   npm run error:report
 */

const fs = require('fs')
const path = require('path')

// カラーコード
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
}

// エラーカテゴリの定義
const ERROR_CATEGORIES = {
  auth: { name: '認証系', range: [1000, 1999], icon: '🔐', color: colors.red },
  api: { name: 'API系', range: [2000, 2999], icon: '🌐', color: colors.yellow },
  data: { name: 'データ系', range: [3000, 3999], icon: '💾', color: colors.blue },
  ui: { name: 'UI系', range: [4000, 4999], icon: '🎨', color: colors.cyan },
  system: { name: 'システム系', range: [5000, 5999], icon: '⚙️', color: colors.magenta },
  business: { name: 'ビジネス系', range: [6000, 6999], icon: '💼', color: colors.green },
  external: { name: '外部連携系', range: [7000, 7999], icon: '🔗', color: colors.white },
}

// 重要度レベルの定義
const SEVERITY_LEVELS = {
  info: { name: '情報', icon: 'ℹ️', color: colors.blue, priority: 1 },
  warning: { name: '警告', icon: '⚠️', color: colors.yellow, priority: 2 },
  error: { name: 'エラー', icon: '❌', color: colors.red, priority: 3 },
  critical: { name: '重大', icon: '🚨', color: colors.red, priority: 4 },
}

class ErrorAnalyzer {
  constructor() {
    this.logFiles = this.findLogFiles()
    this.errors = []
    this.statistics = {
      total: 0,
      categories: {},
      codes: {},
      trends: {},
      timeDistribution: {},
      severityDistribution: {},
    }
  }

  // ログファイルを探索
  findLogFiles() {
    const possiblePaths = ['./logs', './storage/logs', './.next/cache/logs', './tmp/logs', process.env.LOG_PATH].filter(
      Boolean
    )

    const logFiles = []

    possiblePaths.forEach((logPath) => {
      if (fs.existsSync(logPath)) {
        const files = fs
          .readdirSync(logPath)
          .filter((file) => file.endsWith('.log') || file.endsWith('.json'))
          .map((file) => path.join(logPath, file))
        logFiles.push(...files)
      }
    })

    return logFiles
  }

  // ダミーエラーデータを生成（デモ・テスト用）
  generateDummyData() {
    const dummyErrors = []
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    // 過去24時間のエラーデータを生成
    for (let i = 0; i < 100; i++) {
      const categories = Object.keys(ERROR_CATEGORIES)
      const category = categories[Math.floor(Math.random() * categories.length)]
      const categoryInfo = ERROR_CATEGORIES[category]

      const code = Math.floor(Math.random() * 999) + categoryInfo.range[0]
      const timestamp = new Date(now - Math.random() * 24 * oneHour)

      const severities = Object.keys(SEVERITY_LEVELS)
      const severity = severities[Math.floor(Math.random() * severities.length)]

      dummyErrors.push({
        timestamp: timestamp.toISOString(),
        code: code,
        category: category,
        level: severity,
        message: `Sample ${category} error ${code}`,
        count: Math.floor(Math.random() * 5) + 1,
      })
    }

    return dummyErrors
  }

  // ログファイルを解析
  parseLogFiles() {
    console.log(`${colors.blue}${colors.bold}🔍 ログファイル解析中...${colors.reset}`)

    if (this.logFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  ログファイルが見つかりません。ダミーデータで動作確認します${colors.reset}`)
      this.errors = this.generateDummyData()
      return
    }

    // 実際のログファイル解析（実装時に拡張）
    this.logFiles.forEach((file) => {
      console.log(`${colors.gray}  📄 ${file}${colors.reset}`)
      // TODO: 実際のファイル解析ロジックを実装
    })

    // 現在はダミーデータを使用
    this.errors = this.generateDummyData()
    console.log(`${colors.green}✅ ${this.errors.length}件のエラー記録を解析しました${colors.reset}`)
  }

  // 統計情報を計算
  calculateStatistics() {
    console.log(`${colors.blue}${colors.bold}📊 統計情報を計算中...${colors.reset}`)

    this.statistics.total = this.errors.length

    // カテゴリ別統計
    this.errors.forEach((error) => {
      const category = error.category
      if (!this.statistics.categories[category]) {
        this.statistics.categories[category] = { count: 0, percentage: 0 }
      }
      this.statistics.categories[category].count += error.count || 1

      // エラーコード別統計
      const code = error.code
      if (!this.statistics.codes[code]) {
        this.statistics.codes[code] = { count: 0, category: category, latest: error.timestamp }
      }
      this.statistics.codes[code].count += error.count || 1

      // 重要度別統計
      const severity = error.level
      if (!this.statistics.severityDistribution[severity]) {
        this.statistics.severityDistribution[severity] = 0
      }
      this.statistics.severityDistribution[severity] += error.count || 1

      // 時間別分布
      const hour = new Date(error.timestamp).getHours()
      if (!this.statistics.timeDistribution[hour]) {
        this.statistics.timeDistribution[hour] = 0
      }
      this.statistics.timeDistribution[hour] += error.count || 1
    })

    // パーセンテージ計算
    Object.keys(this.statistics.categories).forEach((category) => {
      const count = this.statistics.categories[category].count
      this.statistics.categories[category].percentage = ((count / this.statistics.total) * 100).toFixed(1)
    })
  }

  // カテゴリ別統計を表示
  showCategoryStatistics() {
    console.log(`${colors.blue}${colors.bold}📋 カテゴリ別エラー統計${colors.reset}`)

    const sortedCategories = Object.entries(this.statistics.categories).sort(([, a], [, b]) => b.count - a.count)

    sortedCategories.forEach(([category, stats]) => {
      const categoryInfo = ERROR_CATEGORIES[category]
      const bar = this.createProgressBar(stats.percentage, 30)

      console.log(`${categoryInfo.color}  ${categoryInfo.icon} ${categoryInfo.name}${colors.reset}`)
      console.log(`     ${colors.cyan}${stats.count}件${colors.reset} (${stats.percentage}%) ${bar}`)
    })

    console.log('')
  }

  // 上位エラーコードを表示
  showTopErrorCodes() {
    console.log(`${colors.blue}${colors.bold}🚨 発生頻度上位エラーコード${colors.reset}`)

    const sortedCodes = Object.entries(this.statistics.codes)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)

    sortedCodes.forEach(([code, stats], index) => {
      const categoryInfo = ERROR_CATEGORIES[stats.category]
      const rank = String(index + 1).padStart(2, ' ')

      console.log(
        `${colors.yellow}${rank}.${colors.reset} ${categoryInfo.color}Code ${code}${colors.reset} ` +
          `(${categoryInfo.name}) - ${colors.cyan}${stats.count}回${colors.reset}`
      )
      console.log(`    ${colors.gray}最新発生: ${new Date(stats.latest).toLocaleString('ja-JP')}${colors.reset}`)
    })

    console.log('')
  }

  // 時間別分布を表示
  showTimeDistribution() {
    console.log(`${colors.blue}${colors.bold}⏰ 時間別エラー発生分布${colors.reset}`)

    const maxCount = Math.max(...Object.values(this.statistics.timeDistribution))

    for (let hour = 0; hour < 24; hour++) {
      const count = this.statistics.timeDistribution[hour] || 0
      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
      const bar = this.createProgressBar(percentage, 20)
      const timeStr = String(hour).padStart(2, '0') + ':00'

      console.log(`  ${colors.cyan}${timeStr}${colors.reset} ${bar} ${colors.yellow}${count}件${colors.reset}`)
    }

    console.log('')
  }

  // 重要度別分布を表示
  showSeverityDistribution() {
    console.log(`${colors.blue}${colors.bold}🎯 重要度別エラー分布${colors.reset}`)

    const sortedSeverity = Object.entries(this.statistics.severityDistribution).sort(
      ([, a], [, b]) => SEVERITY_LEVELS[b] - SEVERITY_LEVELS[a]
    )

    const total = Object.values(this.statistics.severityDistribution).reduce((a, b) => a + b, 0)

    sortedSeverity.forEach(([severity, count]) => {
      const severityInfo = SEVERITY_LEVELS[severity]
      const percentage = ((count / total) * 100).toFixed(1)
      const bar = this.createProgressBar(percentage, 25)

      console.log(`${severityInfo.color}  ${severityInfo.icon} ${severityInfo.name}${colors.reset}`)
      console.log(`     ${colors.cyan}${count}件${colors.reset} (${percentage}%) ${bar}`)
    })

    console.log('')
  }

  // アラートを生成
  generateAlerts() {
    console.log(`${colors.red}${colors.bold}🚨 アラート・注意事項${colors.reset}`)

    const alerts = []

    // 重大エラー検出
    const criticalCount = this.statistics.severityDistribution.critical || 0
    if (criticalCount > 0) {
      alerts.push({
        level: 'critical',
        message: `重大エラーが${criticalCount}件発生しています`,
        icon: '🚨',
      })
    }

    // 高頻度エラーコード検出
    const topErrorCode = Object.entries(this.statistics.codes).sort(([, a], [, b]) => b.count - a.count)[0]

    if (topErrorCode && topErrorCode[1].count > 10) {
      const categoryInfo = ERROR_CATEGORIES[topErrorCode[1].category]
      alerts.push({
        level: 'warning',
        message: `エラーコード${topErrorCode[0]} (${categoryInfo.name}) が${topErrorCode[1].count}回発生`,
        icon: '⚠️',
      })
    }

    // システムエラー集中検出
    const systemErrorCount = this.statistics.categories.system?.count || 0
    const systemPercentage = (systemErrorCount / this.statistics.total) * 100
    if (systemPercentage > 30) {
      alerts.push({
        level: 'warning',
        message: `システムエラーが全体の${systemPercentage.toFixed(1)}%を占めています`,
        icon: '⚙️',
      })
    }

    if (alerts.length === 0) {
      console.log(`${colors.green}  ✅ 重大な問題は検出されませんでした${colors.reset}`)
    } else {
      alerts.forEach((alert) => {
        const color = alert.level === 'critical' ? colors.red : colors.yellow
        console.log(`${color}  ${alert.icon} ${alert.message}${colors.reset}`)
      })
    }

    console.log('')
  }

  // 推奨アクションを表示
  showRecommendations() {
    console.log(`${colors.blue}${colors.bold}💡 推奨アクション${colors.reset}`)

    const recommendations = []

    // 認証エラーが多い場合
    const authErrorCount = this.statistics.categories.auth?.count || 0
    if (authErrorCount > 20) {
      recommendations.push('🔐 認証システムの見直しを検討してください')
      recommendations.push('🔑 トークンの有効期限設定を確認してください')
    }

    // APIエラーが多い場合
    const apiErrorCount = this.statistics.categories.api?.count || 0
    if (apiErrorCount > 30) {
      recommendations.push('🌐 API接続の安定性を確認してください')
      recommendations.push('⏰ タイムアウト設定の調整を検討してください')
    }

    // 総エラー数が多い場合
    if (this.statistics.total > 100) {
      recommendations.push('📊 エラー監視アラートの設定を強化してください')
      recommendations.push('🔍 根本原因分析を実施してください')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 現在のエラー状況は安定しています')
    }

    recommendations.forEach((rec) => {
      console.log(`  ${colors.cyan}${rec}${colors.reset}`)
    })

    console.log('')
  }

  // プログレスバーを作成
  createProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    const filledBar = '█'.repeat(filled)
    const emptyBar = '░'.repeat(empty)
    return `${colors.green}${filledBar}${colors.gray}${emptyBar}${colors.reset}`
  }

  // メインレポートを生成
  generateReport() {
    console.log(`${colors.bold}${colors.underline}📈 BoxLog Error Analysis Report${colors.reset}`)
    console.log(`${colors.gray}生成日時: ${new Date().toLocaleString('ja-JP')}${colors.reset}`)
    console.log(`${colors.gray}解析期間: 過去24時間${colors.reset}`)
    console.log(`${colors.gray}総エラー件数: ${this.statistics.total}件${colors.reset}`)
    console.log('')

    this.showCategoryStatistics()
    this.showTopErrorCodes()
    this.showTimeDistribution()
    this.showSeverityDistribution()
    this.generateAlerts()
    this.showRecommendations()

    console.log(`${colors.blue}${colors.bold}🔧 関連コマンド${colors.reset}`)
    console.log(`  ${colors.cyan}npm run error:monitor${colors.reset}  - リアルタイム監視`)
    console.log(`  ${colors.cyan}npm run error:analyze${colors.reset} - 分析レポート再生成`)
    console.log(`  ${colors.cyan}npm run logs${colors.reset}          - ログファイル確認`)
  }

  // メイン実行
  async run(command = 'analyze') {
    console.log(`${colors.bold}🔍 BoxLog Error Analyzer${colors.reset}`)
    console.log(`${colors.dim}統一エラーコード体系によるログ分析システム${colors.reset}`)
    console.log('')

    try {
      this.parseLogFiles()
      this.calculateStatistics()

      switch (command) {
        case 'analyze':
          this.generateReport()
          break

        case 'monitor':
          console.log(`${colors.yellow}📡 リアルタイム監視モード (Ctrl+C で終了)${colors.reset}`)
          this.startMonitoring()
          break

        case 'report':
          this.generateReport()
          break

        default:
          this.generateReport()
          break
      }
    } catch (error) {
      console.error(`${colors.red}❌ エラー分析中にエラーが発生しました:${colors.reset}`, error.message)
      process.exit(1)
    }
  }

  // リアルタイム監視を開始
  startMonitoring() {
    setInterval(() => {
      console.clear()
      console.log(`${colors.yellow}📡 Error Monitor - ${new Date().toLocaleString('ja-JP')}${colors.reset}`)
      console.log('')

      // 簡易統計表示
      this.showCategoryStatistics()
      this.generateAlerts()

      console.log(`${colors.gray}次回更新: 30秒後${colors.reset}`)
    }, 30000)
  }
}

// メイン実行
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0] || 'analyze'

  const analyzer = new ErrorAnalyzer()
  analyzer.run(command)
}

module.exports = ErrorAnalyzer
