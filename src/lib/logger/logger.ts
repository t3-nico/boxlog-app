/**
 * 📊 BoxLog Logger Core
 *
 * メインロガークラス・統一ログインターフェース
 * - 構造化ログ・メタデータ管理・出力制御
 * - パフォーマンス・セキュリティ・ビジネスログ対応
 */

import os from 'os'

import type {
  BusinessLogEntry,
  ErrorLogEntry,
  LogContext,
  LogEntry,
  LogFilter,
  LogLevel,
  LogOutput,
  LogStats,
  LoggerConfig,
  PerformanceLogEntry,
  SecurityLogEntry,
} from './types'
import { LOG_LEVELS } from './types'

/**
 * 🎯 メインロガークラス
 */
export class Logger {
  private config: LoggerConfig
  private outputs: LogOutput[] = []
  private context: LogContext = {}
  private filters: LogFilter[] = []
  private stats: LogStats = this.initStats()

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      console: {
        enabled: true,
        colors: true,
        format: 'pretty',
      },
      file: {
        enabled: false,
        path: './logs/app.log',
        rotation: {
          maxSize: '10MB',
          maxFiles: 5,
        },
      },
      external: {
        enabled: false,
        services: {},
      },
      metadata: {
        includeVersion: true,
        includeEnvironment: true,
        includeHostname: false,
        includeProcessId: false,
        includeMemory: false,
      },
      filtering: {
        sensitiveKeys: ['password', 'token', 'secret', 'key'],
        excludeComponents: [],
        samplingRate: 1.0,
      },
      ...config,
    }

    // デフォルト出力先の設定
    this.setupDefaultOutputs()
  }

  /**
   * 📝 基本ログ出力メソッド
   */
  log(level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createLogEntry(level, message, meta)

    // フィルタリング
    if (!this.applyFilters(entry)) {
      return
    }

    // サンプリング
    if (Math.random() > this.config.filtering.samplingRate) {
      return
    }

    // 統計更新
    this.updateStats(entry)

    // 出力
    this.outputs.forEach((output) => {
      try {
        output.write(entry)
      } catch (error) {
        console.error(`Logger output error (${output.name}):`, error)
      }
    })
  }

  /**
   * 🚨 エラーログ
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorEntry: Partial<ErrorLogEntry> = {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: error instanceof Error && 'code' in error ? (error as { code: string }).code : undefined,
            }
          : undefined,
      context,
    }

    this.log('error', message, errorEntry)
  }

  /**
   * ⚠️ 警告ログ
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.log('warn', message, meta)
  }

  /**
   * ℹ️ 情報ログ
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.log('info', message, meta)
  }

  /**
   * 🔍 デバッグログ
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.log('debug', message, meta)
  }

  /**
   * ⚡ パフォーマンスログ
   */
  performance(
    message: string,
    performance: PerformanceLogEntry['performance'],
    meta: Record<string, unknown> = {}
  ): void {
    const perfEntry: Partial<PerformanceLogEntry> = {
      performance,
      ...meta,
    }

    this.log('info', message, perfEntry)
  }

  /**
   * 🔐 セキュリティログ
   */
  security(message: string, security: SecurityLogEntry['security'], meta: Record<string, unknown> = {}): void {
    const securityEntry: Partial<SecurityLogEntry> = {
      security,
      ...meta,
    }

    const level: LogLevel = security.threatLevel === 'critical' || security.threatLevel === 'high' ? 'error' : 'warn'
    this.log(level, message, securityEntry)
  }

  /**
   * 📊 ビジネスログ
   */
  business(message: string, business: BusinessLogEntry['business'], meta: Record<string, unknown> = {}): void {
    const businessEntry: Partial<BusinessLogEntry> = {
      business,
      ...meta,
    }

    this.log('info', message, businessEntry)
  }

  /**
   * ⏱️ タイマー機能
   */
  timer(label: string): () => void {
    const startTime = process.hrtime.bigint()
    const startMemory = process.memoryUsage()

    return () => {
      const endTime = process.hrtime.bigint()
      const endMemory = process.memoryUsage()

      const duration = Number(endTime - startTime) / 1000000 // ナノ秒からミリ秒
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed

      this.performance(`Timer: ${label}`, {
        duration,
        memory: memoryDelta,
      })
    }
  }

  /**
   * 🎯 コンテキスト管理
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context }
  }

  getContext(): LogContext {
    return { ...this.context }
  }

  clearContext(): void {
    this.context = {}
  }

  /**
   * 🔍 フィルター管理
   */
  addFilter(filter: LogFilter): void {
    this.filters.push(filter)
  }

  removeFilter(filter: LogFilter): void {
    const index = this.filters.indexOf(filter)
    if (index > -1) {
      this.filters.splice(index, 1)
    }
  }

  /**
   * 📤 出力先管理
   */
  addOutput(output: LogOutput): void {
    this.outputs.push(output)
  }

  removeOutput(outputName: string): void {
    const index = this.outputs.findIndex((output) => output.name === outputName)
    if (index > -1) {
      this.outputs.splice(index, 1)
    }
  }

  /**
   * 💾 フラッシュ
   */
  async flush(): Promise<void> {
    await Promise.all(
      this.outputs.filter((output) => output.flush).map((output) => output.flush!().catch(console.error))
    )
  }

  /**
   * 🔒 クローズ
   */
  async close(): Promise<void> {
    await this.flush()
    await Promise.all(
      this.outputs.filter((output) => output.close).map((output) => output.close!().catch(console.error))
    )
  }

  /**
   * 📊 統計情報取得
   */
  getStats(): LogStats {
    return { ...this.stats }
  }

  /**
   * 🧹 統計リセット
   */
  resetStats(): void {
    this.stats = this.initStats()
  }

  /**
   * ⚙️ 設定更新
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
    this.setupDefaultOutputs()
  }

  /**
   * 🔧 プライベートメソッド
   */

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.config.level]
  }

  private createLogEntry(level: LogLevel, message: string, meta: Record<string, unknown> = {}): LogEntry {
    const timestamp = new Date().toISOString()

    const entry: LogEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...meta,
    }

    // メタデータの追加
    if (this.config.metadata.includeVersion) {
      entry.version = process.env.npm_package_version || process.env.APP_VERSION || '1.0.0'
    }

    if (this.config.metadata.includeEnvironment) {
      entry.environment = process.env.NODE_ENV || 'development'
    }

    if (this.config.metadata.includeHostname) {
      entry.meta = { ...entry.meta, hostname: os.hostname() }
    }

    if (this.config.metadata.includeProcessId) {
      entry.meta = { ...entry.meta, pid: process.pid }
    }

    if (this.config.metadata.includeMemory) {
      const memory = process.memoryUsage()
      entry.meta = { ...entry.meta, memory: memory.heapUsed }
    }

    return entry
  }

  private applyFilters(entry: LogEntry): boolean {
    // コンポーネント除外フィルター
    if (entry.component && this.config.filtering.excludeComponents.includes(entry.component)) {
      return false
    }

    // カスタムフィルター
    return this.filters.every((filter) => filter(entry))
  }

  private updateStats(entry: LogEntry): void {
    this.updateBasicStats(entry)
    this.updateTimeStats(entry)
    this.updateComponentStats(entry)
    this.updateErrorStats(entry)
    this.updatePerformanceStats(entry)
  }

  private updateBasicStats(entry: LogEntry): void {
    this.stats.totalLogs++
    this.stats.byLevel[entry.level] = (this.stats.byLevel[entry.level] || 0) + 1
  }

  private updateTimeStats(entry: LogEntry): void {
    const hour = new Date(entry.timestamp).getHours().toString()
    this.stats.byHour[hour] = (this.stats.byHour[hour] || 0) + 1
  }

  private updateComponentStats(entry: LogEntry): void {
    if (entry.component) {
      this.stats.byComponent[entry.component] = (this.stats.byComponent[entry.component] || 0) + 1
    }
  }

  private updateErrorStats(entry: LogEntry): void {
    if (entry.level === 'error') {
      this.stats.errors.total++

      if ('error' in entry && entry.error) {
        const errorType = entry.error.name || 'Unknown'
        this.stats.errors.byType[errorType] = (this.stats.errors.byType[errorType] || 0) + 1

        this.stats.errors.recent.push(entry as ErrorLogEntry)
        if (this.stats.errors.recent.length > 10) {
          this.stats.errors.recent.shift()
        }
      }
    }
  }

  private updatePerformanceStats(entry: LogEntry): void {
    if ('performance' in entry && entry.performance) {
      const perf = entry.performance as { duration: number; memory?: number }
      if (perf.duration) {
        const currentAvg = this.stats.performance.averageDuration
        const count = this.stats.totalLogs
        this.stats.performance.averageDuration = (currentAvg * (count - 1) + perf.duration) / count

        this.stats.performance.slowestOperations.push(entry as PerformanceLogEntry)
        this.stats.performance.slowestOperations.sort((a, b) => b.performance.duration - a.performance.duration)
        if (this.stats.performance.slowestOperations.length > 5) {
          this.stats.performance.slowestOperations.pop()
        }
      }

      if (perf.memory) {
        const currentAvg = this.stats.performance.memoryUsage.average
        const count = this.stats.totalLogs
        this.stats.performance.memoryUsage.average = (currentAvg * (count - 1) + perf.memory) / count

        if (perf.memory > this.stats.performance.memoryUsage.peak) {
          this.stats.performance.memoryUsage.peak = perf.memory
        }
      }
    }
  }

  private initStats(): LogStats {
    return {
      totalLogs: 0,
      byLevel: { error: 0, warn: 0, info: 0, debug: 0 },
      byHour: {},
      byComponent: {},
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      performance: {
        averageDuration: 0,
        slowestOperations: [],
        memoryUsage: {
          average: 0,
          peak: 0,
        },
      },
    }
  }

  private setupDefaultOutputs(): void {
    // 既存の出力先をクリア（カスタム出力は保持）
    this.outputs = this.outputs.filter((output) => !['console', 'file', 'rotating-file'].includes(output.name))

    // コンソール出力
    if (this.config.console.enabled) {
      const { ConsoleOutput } = require('./outputs')
      this.outputs.push(new ConsoleOutput(this.config.console.format, this.config.console.colors))
    }

    // ファイル出力
    if (this.config.file.enabled) {
      const { RotatingFileOutput } = require('./outputs')
      this.outputs.push(new RotatingFileOutput(this.config.file.path, 'json', this.config.file.rotation))
    }
  }
}

/**
 * 🎯 便利関数
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config)
}

/**
 * 🔧 環境別デフォルト設定
 */
export function getDefaultConfig(environment: string = process.env.NODE_ENV || 'development'): LoggerConfig {
  const base: LoggerConfig = {
    level: 'info',
    console: {
      enabled: true,
      colors: true,
      format: 'pretty',
    },
    file: {
      enabled: false,
      path: './logs/app.log',
      rotation: {
        maxSize: '10MB',
        maxFiles: 5,
      },
    },
    external: {
      enabled: false,
      services: {},
    },
    metadata: {
      includeVersion: true,
      includeEnvironment: true,
      includeHostname: false,
      includeProcessId: false,
      includeMemory: false,
    },
    filtering: {
      sensitiveKeys: ['password', 'token', 'secret', 'key'],
      excludeComponents: [],
      samplingRate: 1.0,
    },
  }

  switch (environment) {
    case 'development':
      return {
        ...base,
        level: 'debug',
        console: {
          enabled: true,
          colors: true,
          format: 'pretty',
        },
        metadata: {
          ...base.metadata,
          includeMemory: true,
        },
      }

    case 'production':
      return {
        ...base,
        level: 'warn',
        console: {
          enabled: false,
          colors: false,
          format: 'json',
        },
        file: {
          enabled: true,
          path: './logs/production.log',
          rotation: {
            maxSize: '50MB',
            maxFiles: 10,
          },
        },
        metadata: {
          ...base.metadata,
          includeHostname: true,
          includeProcessId: true,
        },
      }

    case 'staging':
      return {
        ...base,
        level: 'info',
        file: {
          enabled: true,
          path: './logs/staging.log',
          rotation: {
            maxSize: '20MB',
            maxFiles: 7,
          },
        },
        metadata: {
          ...base.metadata,
          includeHostname: true,
        },
      }

    default:
      return base
  }
}
