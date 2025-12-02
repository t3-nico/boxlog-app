/**
 * 🌐 Webhook 出力
 */

import type { LogEntry, LogOutput } from '../types'

export class WebhookOutput implements LogOutput {
  name = 'webhook'
  private buffer: LogEntry[] = []
  private bufferTimeout?: NodeJS.Timeout | undefined

  constructor(
    private url: string,
    private options: {
      headers?: Record<string, string>
      bufferSize?: number
      bufferTimeout?: number
      retries?: number
      retryDelay?: number
    } = {}
  ) {
    this.options = {
      bufferSize: 10,
      bufferTimeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...options,
    }
  }

  write(entry: LogEntry): void {
    this.buffer.push(entry)

    if (this.buffer.length >= (this.options.bufferSize || 10)) {
      this.flush()
    } else if (!this.bufferTimeout) {
      this.bufferTimeout = setTimeout(() => {
        this.flush()
      }, this.options.bufferTimeout || 10000)
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

  private async sendToWebhook(entries: LogEntry[], attempt = 1): Promise<void> {
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
    } catch (error) {
      console.error(`Webhook delivery failed (attempt ${attempt}):`, error)

      // リトライ
      if (attempt < (this.options.retries || 3)) {
        setTimeout(
          () => {
            this.sendToWebhook(entries, attempt + 1)
          },
          (this.options.retryDelay || 1000) * attempt
        )
      }
    }
  }

  async close(): Promise<void> {
    await this.flush()
  }
}
