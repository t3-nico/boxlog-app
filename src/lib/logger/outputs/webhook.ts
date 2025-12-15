/**
 * 🌐 Webhook 出力
 *
 * 改善点:
 * - 適切なリトライロジック（指数バックオフ）
 * - 失敗エントリの追跡（デッドレターキュー）
 * - エラーコールバック通知
 * - 詳細なエラーログ
 */

import type { LogEntry, LogOutput } from '../types'

/**
 * Webhook配信結果
 */
export interface WebhookDeliveryResult {
  success: boolean
  entriesCount: number
  attempt: number
  error?: string
}

/**
 * Webhookエラーコールバック
 */
export type WebhookErrorCallback = (
  error: Error,
  entries: LogEntry[],
  result: WebhookDeliveryResult
) => void

/**
 * Webhook出力オプション
 */
export interface WebhookOutputOptions {
  headers?: Record<string, string>
  bufferSize?: number
  bufferTimeout?: number
  retries?: number
  retryDelay?: number
  /** 最大失敗エントリ保持数 */
  maxFailedEntries?: number
  /** エラー発生時のコールバック */
  onError?: WebhookErrorCallback
}

/**
 * スリープ関数（指数バックオフ用）
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class WebhookOutput implements LogOutput {
  name = 'webhook'
  private buffer: LogEntry[] = []
  private bufferTimeout?: NodeJS.Timeout | undefined
  /** 配信に失敗したエントリ（デッドレターキュー） */
  private failedEntries: LogEntry[] = []
  private readonly maxFailedEntries: number

  constructor(
    private url: string,
    private options: WebhookOutputOptions = {}
  ) {
    this.options = {
      bufferSize: 10,
      bufferTimeout: 10000,
      retries: 3,
      retryDelay: 1000,
      maxFailedEntries: 100,
      ...options,
    }
    this.maxFailedEntries = this.options.maxFailedEntries ?? 100
  }

  write(entry: LogEntry): void {
    this.buffer.push(entry)

    if (this.buffer.length >= (this.options.bufferSize ?? 10)) {
      // void: 意図的に非同期処理を開始して待機しない
      void this.flush()
    } else if (!this.bufferTimeout) {
      this.bufferTimeout = setTimeout(() => {
        void this.flush()
      }, this.options.bufferTimeout ?? 10000)
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const entries = [...this.buffer]
    this.buffer = []

    if (this.bufferTimeout !== undefined) {
      clearTimeout(this.bufferTimeout)
      this.bufferTimeout = undefined
    }

    await this.sendToWebhook(entries)
  }

  private async sendToWebhook(entries: LogEntry[], attempt = 1): Promise<WebhookDeliveryResult> {
    const maxRetries = this.options.retries ?? 3
    const baseDelay = this.options.retryDelay ?? 1000

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BoxLog-Logger/1.0',
          ...this.options.headers,
        },
        body: JSON.stringify({
          logs: entries,
          timestamp: new Date().toISOString(),
          source: 'boxlog-app',
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        success: true,
        entriesCount: entries.length,
        attempt,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[Webhook] Delivery failed (attempt ${attempt}/${maxRetries}):`, {
        url: this.url,
        entriesCount: entries.length,
        error: errorMessage,
      })

      // リトライ（指数バックオフ）
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) // 指数バックオフ: 1s, 2s, 4s...
        console.debug(`[Webhook] Retrying in ${delay}ms...`)
        await sleep(delay)
        return this.sendToWebhook(entries, attempt + 1)
      }

      // 最大リトライ回数を超えた場合
      const result: WebhookDeliveryResult = {
        success: false,
        entriesCount: entries.length,
        attempt,
        error: errorMessage,
      }

      // 失敗したエントリをデッドレターキューに追加
      this.addToFailedEntries(entries)

      // エラーコールバックを呼び出し
      if (this.options.onError) {
        try {
          this.options.onError(
            error instanceof Error ? error : new Error(errorMessage),
            entries,
            result
          )
        } catch (callbackError) {
          console.error('[Webhook] Error callback failed:', callbackError)
        }
      }

      console.error(`[Webhook] All retries exhausted. ${entries.length} entries moved to dead letter queue.`)

      return result
    }
  }

  /**
   * 失敗したエントリをデッドレターキューに追加
   */
  private addToFailedEntries(entries: LogEntry[]): void {
    this.failedEntries.push(...entries)

    // 最大保持数を超えた場合、古いエントリを削除
    if (this.failedEntries.length > this.maxFailedEntries) {
      const overflow = this.failedEntries.length - this.maxFailedEntries
      console.warn(`[Webhook] Dead letter queue overflow. Dropping ${overflow} oldest entries.`)
      this.failedEntries = this.failedEntries.slice(overflow)
    }
  }

  /**
   * 失敗したエントリを取得
   */
  getFailedEntries(): LogEntry[] {
    return [...this.failedEntries]
  }

  /**
   * 失敗したエントリをクリア
   */
  clearFailedEntries(): void {
    this.failedEntries = []
  }

  /**
   * 失敗したエントリを再送信
   */
  async retryFailedEntries(): Promise<WebhookDeliveryResult | null> {
    if (this.failedEntries.length === 0) {
      return null
    }

    const entries = [...this.failedEntries]
    this.failedEntries = []

    console.info(`[Webhook] Retrying ${entries.length} failed entries...`)
    return this.sendToWebhook(entries)
  }

  /**
   * 統計情報を取得
   */
  getStats(): {
    bufferedCount: number
    failedCount: number
  } {
    return {
      bufferedCount: this.buffer.length,
      failedCount: this.failedEntries.length,
    }
  }

  async close(): Promise<void> {
    await this.flush()

    if (this.failedEntries.length > 0) {
      console.warn(`[Webhook] Closing with ${this.failedEntries.length} undelivered entries in dead letter queue.`)
    }
  }
}
