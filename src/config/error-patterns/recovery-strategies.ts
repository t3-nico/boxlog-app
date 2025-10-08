// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * 自動復旧戦略システム
 * エラーカテゴリ別の自動リトライ・復旧ロジックを提供
 */

import { ErrorCategory, ErrorCode, getErrorCategory } from './categories'

/**
 * リトライ戦略の設定
 */
export interface RetryStrategy {
  enabled: boolean // リトライを有効にするか
  maxAttempts: number // 最大試行回数
  baseDelay: number // 基本待機時間（ミリ秒）
  maxDelay: number // 最大待機時間（ミリ秒）
  backoffMultiplier: number // 指数バックオフの乗数
  jitter: boolean // ジッタ（ランダム要素）を追加するか
  retryCondition?: (error: Error) => boolean // リトライ条件
}

/**
 * サーキットブレーカーの設定
 */
export interface CircuitBreakerConfig {
  enabled: boolean // サーキットブレーカーを有効にするか
  failureThreshold: number // 失敗閾値（この回数失敗でOPEN）
  recoveryTimeout: number // 復旧タイムアウト（ミリ秒）
  successThreshold: number // 成功閾値（この回数成功でCLOSED）
  monitoringPeriod: number // 監視期間（ミリ秒）
}

/**
 * フォールバック戦略
 */
export interface FallbackStrategy {
  enabled: boolean // フォールバックを有効にするか
  handler: () => Promise<unknown> // フォールバック処理関数
  timeout?: number // フォールバックのタイムアウト
}

/**
 * 復旧戦略の完全な設定
 */
export interface RecoveryStrategy {
  retry: RetryStrategy
  circuitBreaker: CircuitBreakerConfig
  fallback?: FallbackStrategy
  autoRecovery: boolean // 自動復旧を試行するか
  userNotification: boolean // ユーザーに通知するか
  logLevel: 'debug' | 'info' | 'warn' | 'error' // ログレベル
}

/**
 * 認証エラー用復旧戦略
 */
const AUTH_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: false, // 認証エラーは基本的にリトライしない
    maxAttempts: 1,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitter: false,
  },
  circuitBreaker: {
    enabled: false, // 認証では使用しない
    failureThreshold: 5,
    recoveryTimeout: 30000,
    successThreshold: 3,
    monitoringPeriod: 60000,
  },
  autoRecovery: false, // 手動対応が必要
  userNotification: true, // ユーザーに明確に通知
  logLevel: 'warn',
}

/**
 * バリデーションエラー用復旧戦略
 */
const VALIDATION_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: false, // バリデーションエラーはリトライ不要
    maxAttempts: 1,
    baseDelay: 0,
    maxDelay: 0,
    backoffMultiplier: 1,
    jitter: false,
  },
  circuitBreaker: {
    enabled: false, // バリデーションでは使用しない
    failureThreshold: 10,
    recoveryTimeout: 10000,
    successThreshold: 2,
    monitoringPeriod: 30000,
  },
  autoRecovery: false, // ユーザー入力修正が必要
  userNotification: true, // 入力エラーを明確に通知
  logLevel: 'info',
}

/**
 * データベースエラー用復旧戦略
 */
const DB_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: true, // DBエラーは積極的にリトライ
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true, // DB負荷分散のためジッタ有効
    retryCondition: (error) => {
      // 接続エラーやタイムアウトのみリトライ
      return (
        error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('deadlock')
      )
    },
  },
  circuitBreaker: {
    enabled: true, // DB負荷軽減のため有効
    failureThreshold: 5,
    recoveryTimeout: 30000,
    successThreshold: 3,
    monitoringPeriod: 60000,
  },
  autoRecovery: true, // 自動復旧を試行
  userNotification: true, // 問題を透明性を持って通知
  logLevel: 'error',
}

/**
 * ビジネスロジックエラー用復旧戦略
 */
const BIZ_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: false, // ビジネスルール違反はリトライ不要
    maxAttempts: 1,
    baseDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 1.5,
    jitter: false,
  },
  circuitBreaker: {
    enabled: false, // ビジネスロジックでは使用しない
    failureThreshold: 10,
    recoveryTimeout: 15000,
    successThreshold: 2,
    monitoringPeriod: 45000,
  },
  autoRecovery: false, // ユーザー操作が必要
  userNotification: true, // ビジネスルール説明を通知
  logLevel: 'info',
}

/**
 * 外部サービスエラー用復旧戦略
 */
const EXTERNAL_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: true, // 外部サービスエラーは積極的にリトライ
    maxAttempts: 4,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2.5,
    jitter: true, // ネットワーク負荷分散
    retryCondition: (error) => {
      // タイムアウトや一時的なエラーのみリトライ
      return (
        !error.message.includes('authentication') &&
        !error.message.includes('authorization') &&
        !error.message.includes('forbidden')
      )
    },
  },
  circuitBreaker: {
    enabled: true, // 外部サービス保護のため有効
    failureThreshold: 3, // 外部サービスは敏感に反応
    recoveryTimeout: 60000, // 長めの復旧時間
    successThreshold: 2,
    monitoringPeriod: 120000,
  },
  fallback: {
    enabled: true,
    handler: async () => {
      // キャッシュされたデータや代替サービスを使用
      return null
    },
    timeout: 5000,
  },
  autoRecovery: true, // フォールバック含む自動復旧
  userNotification: true, // 外部サービス問題を通知
  logLevel: 'warn',
}

/**
 * システムエラー用復旧戦略
 */
const SYSTEM_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: true, // システムエラーは慎重にリトライ
    maxAttempts: 2,
    baseDelay: 3000,
    maxDelay: 15000,
    backoffMultiplier: 3,
    jitter: true,
    retryCondition: (error) => {
      // 一時的なシステムエラーのみリトライ
      return (
        error.message.includes('temporary') ||
        error.message.includes('unavailable') ||
        error.message.includes('timeout')
      )
    },
  },
  circuitBreaker: {
    enabled: true, // システム保護のため有効
    failureThreshold: 2, // 低い閾値でシステム保護
    recoveryTimeout: 120000, // 長い復旧時間
    successThreshold: 5, // 慎重な復旧判定
    monitoringPeriod: 300000,
  },
  autoRecovery: true, // 自動復旧を試行
  userNotification: true, // システム問題を通知
  logLevel: 'error',
}

/**
 * レート制限エラー用復旧戦略
 */
const RATE_RECOVERY_STRATEGY: RecoveryStrategy = {
  retry: {
    enabled: true, // レート制限は時間経過でリトライ
    maxAttempts: 5,
    baseDelay: 5000, // 長めの初期待機時間
    maxDelay: 60000,
    backoffMultiplier: 2,
    jitter: true, // 負荷分散のためジッタ有効
    retryCondition: () => true, // レート制限は全てリトライ可能
  },
  circuitBreaker: {
    enabled: true, // API保護のため有効
    failureThreshold: 3,
    recoveryTimeout: 300000, // 5分の長い復旧時間
    successThreshold: 2,
    monitoringPeriod: 600000,
  },
  autoRecovery: true, // 自動的に待機してリトライ
  userNotification: false, // ユーザーには透明に処理
  logLevel: 'debug',
}

/**
 * カテゴリ別復旧戦略マップ
 */
export const RECOVERY_STRATEGIES: Record<ErrorCategory, RecoveryStrategy> = {
  AUTH: AUTH_RECOVERY_STRATEGY,
  VALIDATION: VALIDATION_RECOVERY_STRATEGY,
  DB: DB_RECOVERY_STRATEGY,
  BIZ: BIZ_RECOVERY_STRATEGY,
  EXTERNAL: EXTERNAL_RECOVERY_STRATEGY,
  SYSTEM: SYSTEM_RECOVERY_STRATEGY,
  RATE: RATE_RECOVERY_STRATEGY,
}

/**
 * エラーコードから復旧戦略を取得
 */
export function getRecoveryStrategy(errorCode: ErrorCode): RecoveryStrategy {
  const category = getErrorCategory(errorCode)
  return RECOVERY_STRATEGIES[category]
}

/**
 * 指数バックオフ計算（ジッタ付き）
 */
export function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: boolean = false
): number {
  let delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1)
  delay = Math.min(delay, maxDelay)

  if (jitter) {
    // ±25%のランダム要素を追加
    const jitterFactor = 0.25
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * jitterFactor
    delay *= randomFactor
  }

  return Math.floor(delay)
}

/**
 * リトライ実行関数
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  strategy: RetryStrategy,
  errorCode?: ErrorCode
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // 最後の試行の場合はエラーを投げる
      if (attempt === strategy.maxAttempts) {
        throw lastError
      }

      // リトライ条件をチェック
      if (strategy.retryCondition && !strategy.retryCondition(lastError)) {
        throw lastError
      }

      // 待機時間を計算
      const delay = calculateDelay(
        attempt,
        strategy.baseDelay,
        strategy.maxDelay,
        strategy.backoffMultiplier,
        strategy.jitter
      )

      // ログ出力
      console.log(`Retry attempt ${attempt}/${strategy.maxAttempts} for error code ${errorCode}, waiting ${delay}ms`)

      // 待機
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * サーキットブレーカーの状態
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

/**
 * サーキットブレーカー実装
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private nextAttemptTime = 0

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.config.enabled) {
      return await operation()
    }

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN')
      }
      this.state = 'HALF_OPEN'
      this.successCount = 0
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'CLOSED'
        this.successCount = 0
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN'
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    }
  }

  getState(): CircuitBreakerState {
    return this.state
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    }
  }
}

/**
 * フォールバック実行関数
 */
export async function executeWithFallback<T>(primary: () => Promise<T>, fallback: FallbackStrategy): Promise<T> {
  if (!fallback.enabled) {
    return await primary()
  }

  try {
    return await primary()
  } catch (error) {
    console.log('Primary operation failed, executing fallback')

    if (fallback.timeout) {
      return await Promise.race([
        fallback.handler(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Fallback timeout')), fallback.timeout)),
      ])
    }

    return await fallback.handler()
  }
}
