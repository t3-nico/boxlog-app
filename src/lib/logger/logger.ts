/**
 * BoxLog Logger Core
 *
 * メインロガークラス・統一ログインターフェース
 * - 構造化ログ・メタデータ管理・出力制御
 * - パフォーマンス・セキュリティ・ビジネスログ対応
 *
 * @see ./config.ts - 設定関連
 * @see ./stats.ts - 統計関連
 * @see ./outputs.ts - 出力先
 */

import os from 'os'

import { DEFAULT_CONFIG } from './config'
import { initStats, updateStats } from './stats'
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

// Re-export config utilities
export { getDefaultConfig } from './config'

/**
 * 🎯 メインロガークラス
 */
export class Logger {
  private config: LoggerConfig
  private outputs: LogOutput[] = []
  private context: LogContext = {}
  private filters: LogFilter[] = []
  private stats: LogStats = initStats()

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
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
    updateStats(this.stats, entry)

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
    const errorEntry: Partial<ErrorLogEntry> = {}

    // undefined を除外して追加
    if (error instanceof Error) {
      errorEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error instanceof Error && 'code' in error ? (error as { code: string }).code : undefined,
      }
    }

    if (context) {
      errorEntry.context = context
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
      this.outputs
        .filter((output) => output.flush)
        .map((output) => Promise.resolve(output.flush!()).catch(console.error))
    )
  }

  /**
   * 🔒 クローズ
   */
  async close(): Promise<void> {
    await this.flush()
    await Promise.all(
      this.outputs
        .filter((output) => output.close)
        .map((output) => Promise.resolve(output.close!()).catch(console.error))
    )
  }

  /**
   * 📊 統計情報取得
   */
  getStats(): LogStats {
    return { ...this.stats }
  }

  /**
   * 統計リセット
   */
  resetStats(): void {
    this.stats = initStats()
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
 * 便利関数
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config)
}
