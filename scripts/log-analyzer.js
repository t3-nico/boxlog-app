#!/usr/bin/env node
/**
 * 📊 BoxLog Log Analyzer
 *
 * ログファイルの分析・統計・レポート生成スクリプト
 * - エラー分析・パフォーマンス監視・使用統計
 * - 異常検知・アラート・レポート出力
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

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
  header: (msg) => console.log(`${colors.cyan}${colors.bright}📊 ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.white}   ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.dim}   ${msg}${colors.reset}`),
}

/**
 * 📊 ログ分析結果型定義
 */
/*
interface LogAnalysisResult {
  summary: {
    totalLogs: number
    timeRange: { start: Date; end: Date }
    logFiles: string[]
  }
  levels: {
    [level: string]: {
      count: number
      percentage: number
      recent: any[]
    }
  }
  errors: {
    total: number
    byType: { [type: string]: number }
    topErrors: any[]
    errorRate: number
  }
  performance: {
    averageResponseTime: number
    slowestRequests: any[]
    memoryUsage: {
      average: number
      peak: number
      samples: number
    }
  }
  components: {
    [component: string]: {
      logCount: number
      errorCount: number
      errorRate: number
    }
  }
  timeline: {
    [hour: string]: {
      total: number
      errors: number
      warnings: number
    }
  }
  alerts: Array<{
    type: 'high_error_rate' | 'slow_response' | 'memory_spike' | 'repeated_error'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    data: any
  }>
}
*/

/**
 * 📁 ログファイル検索
 */
async function findLogFiles(logDir = './logs') {
  const logFiles = []

  if (!fs.existsSync(logDir)) {
    logger.warning(`Log directory not found: ${logDir}`)
    return logFiles
  }

  const files = fs.readdirSync(logDir)

  for (const file of files) {
    const filePath = path.join(logDir, file)
    const stat = fs.statSync(filePath)

    if (stat.isFile() && (file.endsWith('.log') || file.endsWith('.json'))) {
      logFiles.push({
        path: filePath,
        name: file,
        size: stat.size,
        modified: stat.mtime,
      })
    }
  }

  return logFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime())
}

/**
 * 📊 ログファイル分析
 */
async function analyzeLogFile(filePath) {
  logger.info(`Analyzing log file: ${path.basename(filePath)}`)

  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  const analysis = {
    totalLines: 0,
    validLogs: 0,
    invalidLogs: 0,
    levels: {},
    errors: [],
    performance: [],
    components: {},
    timeline: {},
    timestamps: [],
  }

  for await (const line of rl) {
    analysis.totalLines++

    try {
      const logEntry = JSON.parse(line)
      analysis.validLogs++

      // タイムスタンプ処理
      if (logEntry.timestamp) {
        analysis.timestamps.push(new Date(logEntry.timestamp))
      }

      // レベル統計
      const level = logEntry.level || 'unknown'
      analysis.levels[level] = (analysis.levels[level] || 0) + 1

      // エラー収集
      if (level === 'error') {
        analysis.errors.push({
          message: logEntry.message,
          error: logEntry.error,
          timestamp: logEntry.timestamp,
          component: logEntry.component,
          context: logEntry.context,
        })
      }

      // パフォーマンス収集
      if (logEntry.performance) {
        analysis.performance.push({
          duration: logEntry.performance.duration,
          memory: logEntry.performance.memory,
          timestamp: logEntry.timestamp,
          message: logEntry.message,
        })
      }

      // コンポーネント統計
      if (logEntry.component) {
        if (!analysis.components[logEntry.component]) {
          analysis.components[logEntry.component] = { total: 0, errors: 0 }
        }
        analysis.components[logEntry.component].total++

        if (level === 'error') {
          analysis.components[logEntry.component].errors++
        }
      }

      // 時間帯別統計
      if (logEntry.timestamp) {
        const hour = new Date(logEntry.timestamp).getHours()
        if (!analysis.timeline[hour]) {
          analysis.timeline[hour] = { total: 0, errors: 0, warnings: 0 }
        }
        analysis.timeline[hour].total++

        if (level === 'error') {
          analysis.timeline[hour].errors++
        } else if (level === 'warn') {
          analysis.timeline[hour].warnings++
        }
      }
    } catch (error) {
      analysis.invalidLogs++
    }
  }

  return analysis
}

/**
 * 📊 複数ログファイルの統合分析
 */
async function analyzeAllLogs(logFiles) {
  logger.header('Log Analysis Starting...')

  const result = {
    summary: {
      totalLogs: 0,
      timeRange: { start: null, end: null },
      logFiles: logFiles.map((f) => f.name),
    },
    levels: {},
    errors: {
      total: 0,
      byType: {},
      topErrors: [],
      errorRate: 0,
    },
    performance: {
      averageResponseTime: 0,
      slowestRequests: [],
      memoryUsage: {
        average: 0,
        peak: 0,
        samples: 0,
      },
    },
    components: {},
    timeline: {},
    alerts: [],
  }

  const allErrors = []
  const allPerformance = []
  const allTimestamps = []

  // 各ログファイルを分析
  for (const logFile of logFiles) {
    const analysis = await analyzeLogFile(logFile.path)

    result.summary.totalLogs += analysis.validLogs

    // レベル統計の統合
    Object.entries(analysis.levels).forEach(([level, count]) => {
      result.levels[level] = (result.levels[level] || 0) + count
    })

    // エラー統合
    allErrors.push(...analysis.errors)

    // パフォーマンス統合
    allPerformance.push(...analysis.performance)

    // タイムスタンプ統合
    allTimestamps.push(...analysis.timestamps)

    // コンポーネント統合
    Object.entries(analysis.components).forEach(([comp, stats]) => {
      if (!result.components[comp]) {
        result.components[comp] = { logCount: 0, errorCount: 0, errorRate: 0 }
      }
      result.components[comp].logCount += stats.total
      result.components[comp].errorCount += stats.errors
    })

    // タイムライン統合
    Object.entries(analysis.timeline).forEach(([hour, stats]) => {
      if (!result.timeline[hour]) {
        result.timeline[hour] = { total: 0, errors: 0, warnings: 0 }
      }
      result.timeline[hour].total += stats.total
      result.timeline[hour].errors += stats.errors
      result.timeline[hour].warnings += stats.warnings
    })
  }

  // レベル別パーセンテージ計算
  Object.keys(result.levels).forEach((level) => {
    result.levels[level] = {
      count: result.levels[level],
      percentage: Math.round((result.levels[level] / result.summary.totalLogs) * 100 * 100) / 100,
      recent: allErrors.filter((e) => e.message).slice(0, 5),
    }
  })

  // エラー分析
  result.errors.total = allErrors.length
  result.errors.errorRate = Math.round((allErrors.length / result.summary.totalLogs) * 100 * 100) / 100

  // エラータイプ別統計
  const errorTypes = {}
  allErrors.forEach((error) => {
    const type = error.error?.name || 'Unknown'
    errorTypes[type] = (errorTypes[type] || 0) + 1
  })

  result.errors.byType = errorTypes
  result.errors.topErrors = Object.entries(errorTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([type, count]) => ({ type, count }))

  // パフォーマンス分析
  if (allPerformance.length > 0) {
    const durations = allPerformance.map((p) => p.duration).filter((d) => d)
    const memories = allPerformance.map((p) => p.memory).filter((m) => m)

    if (durations.length > 0) {
      result.performance.averageResponseTime =
        Math.round((durations.reduce((sum, d) => sum + d, 0) / durations.length) * 100) / 100

      result.performance.slowestRequests = allPerformance
        .filter((p) => p.duration)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
    }

    if (memories.length > 0) {
      result.performance.memoryUsage.average =
        Math.round((memories.reduce((sum, m) => sum + m, 0) / memories.length / 1024 / 1024) * 100) / 100 // MB

      result.performance.memoryUsage.peak = Math.round((Math.max(...memories) / 1024 / 1024) * 100) / 100 // MB

      result.performance.memoryUsage.samples = memories.length
    }
  }

  // コンポーネント別エラー率計算
  Object.keys(result.components).forEach((comp) => {
    const stats = result.components[comp]
    stats.errorRate = Math.round((stats.errorCount / stats.logCount) * 100 * 100) / 100
  })

  // 時間範囲の設定
  if (allTimestamps.length > 0) {
    result.summary.timeRange.start = new Date(Math.min(...allTimestamps.map((t) => t.getTime())))
    result.summary.timeRange.end = new Date(Math.max(...allTimestamps.map((t) => t.getTime())))
  }

  // アラート生成
  result.alerts = generateAlerts(result)

  return result
}

/**
 * 🚨 アラート生成
 */
function generateAlerts(analysis) {
  const alerts = []

  // 高いエラー率
  if (analysis.errors.errorRate > 5) {
    alerts.push({
      type: 'high_error_rate',
      severity: analysis.errors.errorRate > 10 ? 'critical' : 'high',
      message: `High error rate detected: ${analysis.errors.errorRate}%`,
      data: { errorRate: analysis.errors.errorRate, threshold: 5 },
    })
  }

  // 遅いレスポンス
  if (analysis.performance.averageResponseTime > 1000) {
    alerts.push({
      type: 'slow_response',
      severity: analysis.performance.averageResponseTime > 5000 ? 'high' : 'medium',
      message: `Slow average response time: ${analysis.performance.averageResponseTime}ms`,
      data: { averageResponseTime: analysis.performance.averageResponseTime, threshold: 1000 },
    })
  }

  // メモリ使用量スパイク
  if (analysis.performance.memoryUsage.peak > 500) {
    alerts.push({
      type: 'memory_spike',
      severity: analysis.performance.memoryUsage.peak > 1000 ? 'high' : 'medium',
      message: `High memory usage detected: ${analysis.performance.memoryUsage.peak}MB`,
      data: { peakMemory: analysis.performance.memoryUsage.peak, threshold: 500 },
    })
  }

  // コンポーネント別高エラー率
  Object.entries(analysis.components).forEach(([component, stats]) => {
    if (stats.errorRate > 10) {
      alerts.push({
        type: 'component_high_error_rate',
        severity: stats.errorRate > 20 ? 'high' : 'medium',
        message: `Component ${component} has high error rate: ${stats.errorRate}%`,
        data: { component, errorRate: stats.errorRate, threshold: 10 },
      })
    }
  })

  return alerts
}

/**
 * 📄 分析結果表示
 */
function displayAnalysisResult(result) {
  console.log()
  logger.header('Log Analysis Results')
  console.log(`${colors.dim}${'━'.repeat(80)}${colors.reset}`)

  // サマリー
  logger.info(`📊 Summary`)
  logger.data(`Total Logs: ${result.summary.totalLogs.toLocaleString()}`)
  logger.data(`Log Files: ${result.summary.logFiles.length}`)

  if (result.summary.timeRange.start && result.summary.timeRange.end) {
    logger.data(
      `Time Range: ${result.summary.timeRange.start.toLocaleString()} - ${result.summary.timeRange.end.toLocaleString()}`
    )
  }

  console.log()

  // ログレベル統計
  logger.info(`📈 Log Levels`)
  Object.entries(result.levels)
    .sort(([, a], [, b]) => b.count - a.count)
    .forEach(([level, stats]) => {
      const color = level === 'error' ? colors.red : level === 'warn' ? colors.yellow : colors.white
      logger.data(
        `${color}${level.toUpperCase().padEnd(6)}${colors.reset}: ${stats.count.toLocaleString()} (${stats.percentage}%)`
      )
    })

  console.log()

  // エラー分析
  if (result.errors.total > 0) {
    logger.info(`🚨 Error Analysis`)
    logger.data(`Total Errors: ${result.errors.total.toLocaleString()}`)
    logger.data(`Error Rate: ${result.errors.errorRate}%`)

    if (result.errors.topErrors.length > 0) {
      logger.data(`Top Error Types:`)
      result.errors.topErrors.slice(0, 5).forEach(({ type, count }) => {
        logger.dim(`  ${type}: ${count}`)
      })
    }

    console.log()
  }

  // パフォーマンス分析
  if (result.performance.averageResponseTime > 0) {
    logger.info(`⚡ Performance Analysis`)
    logger.data(`Average Response Time: ${result.performance.averageResponseTime}ms`)

    if (result.performance.memoryUsage.samples > 0) {
      logger.data(
        `Memory Usage - Average: ${result.performance.memoryUsage.average}MB, Peak: ${result.performance.memoryUsage.peak}MB`
      )
    }

    if (result.performance.slowestRequests.length > 0) {
      logger.data(`Slowest Requests:`)
      result.performance.slowestRequests.slice(0, 3).forEach((req) => {
        logger.dim(`  ${req.duration}ms - ${req.message?.substring(0, 50)}`)
      })
    }

    console.log()
  }

  // コンポーネント分析
  const topComponents = Object.entries(result.components)
    .sort(([, a], [, b]) => b.logCount - a.logCount)
    .slice(0, 10)

  if (topComponents.length > 0) {
    logger.info(`🧩 Component Analysis`)
    topComponents.forEach(([component, stats]) => {
      const errorRateColor = stats.errorRate > 10 ? colors.red : stats.errorRate > 5 ? colors.yellow : colors.green
      logger.data(`${component}: ${stats.logCount} logs, ${errorRateColor}${stats.errorRate}% errors${colors.reset}`)
    })

    console.log()
  }

  // アラート
  if (result.alerts.length > 0) {
    logger.header('🚨 Alerts')
    result.alerts.forEach((alert) => {
      const severityColor =
        alert.severity === 'critical'
          ? colors.red
          : alert.severity === 'high'
            ? colors.red
            : alert.severity === 'medium'
              ? colors.yellow
              : colors.blue

      console.log(`${severityColor}${alert.severity.toUpperCase()}${colors.reset}: ${alert.message}`)
    })

    console.log()
  }

  console.log(`${colors.dim}${'━'.repeat(80)}${colors.reset}`)
}

/**
 * 📄 JSON レポート生成
 */
function generateJsonReport(result, outputPath) {
  const report = {
    generated: new Date().toISOString(),
    analysis: result,
    metadata: {
      analyzer: 'BoxLog Log Analyzer',
      version: '1.0.0',
    },
  }

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
  logger.success(`JSON report generated: ${outputPath}`)
}

/**
 * 📄 CSV レポート生成
 */
function generateCsvReport(result, outputPath) {
  const csvLines = []

  // ヘッダー
  csvLines.push('Type,Component,Count,Percentage,Details')

  // レベル統計
  Object.entries(result.levels).forEach(([level, stats]) => {
    csvLines.push(`Level,${level},${stats.count},${stats.percentage}%,`)
  })

  // エラー統計
  result.errors.topErrors.forEach(({ type, count }) => {
    csvLines.push(`Error,${type},${count},,`)
  })

  // コンポーネント統計
  Object.entries(result.components).forEach(([component, stats]) => {
    csvLines.push(`Component,${component},${stats.logCount},,Error Rate: ${stats.errorRate}%`)
  })

  fs.writeFileSync(outputPath, csvLines.join('\n'))
  logger.success(`CSV report generated: ${outputPath}`)
}

/**
 * 🎯 メイン実行関数
 */
async function main() {
  const command = process.argv[2]
  const logDir = process.argv[3] || './logs'
  const outputFile = process.argv[4]

  logger.header('BoxLog Log Analyzer')
  logger.info(`Command: ${command || 'analyze'}`)
  logger.info(`Log Directory: ${logDir}`)
  console.log()

  try {
    const logFiles = await findLogFiles(logDir)

    if (logFiles.length === 0) {
      logger.warning('No log files found')
      return
    }

    logger.info(`Found ${logFiles.length} log files:`)
    logFiles.forEach((file) => {
      logger.dim(`  ${file.name} (${Math.round(file.size / 1024)}KB, ${file.modified.toLocaleString()})`)
    })

    console.log()

    switch (command) {
      case 'analyze':
      default:
        const result = await analyzeAllLogs(logFiles)
        displayAnalysisResult(result)

        if (outputFile) {
          if (outputFile.endsWith('.json')) {
            generateJsonReport(result, outputFile)
          } else if (outputFile.endsWith('.csv')) {
            generateCsvReport(result, outputFile)
          } else {
            generateJsonReport(result, `${outputFile}.json`)
          }
        }
        break

      case 'watch':
        logger.info('Log monitoring mode not yet implemented')
        break

      case 'alert':
        const alertResult = await analyzeAllLogs(logFiles)
        if (alertResult.alerts.length > 0) {
          logger.warning(`Found ${alertResult.alerts.length} alerts`)
          alertResult.alerts.forEach((alert) => {
            console.log(`${alert.severity.toUpperCase()}: ${alert.message}`)
          })
          process.exit(1)
        } else {
          logger.success('No alerts found')
        }
        break
    }
  } catch (error) {
    logger.error(`Analysis failed: ${error.message}`)
    process.exit(1)
  }
}

// スクリプト実行
if (require.main === module) {
  main()
}

module.exports = {
  findLogFiles,
  analyzeLogFile,
  analyzeAllLogs,
  generateAlerts,
}
