/**
 * 📊 Supabase 出力
 */

import type { LogEntry, LogOutput } from '../types'

export class SupabaseOutput implements LogOutput {
  name = 'supabase'
  private buffer: LogEntry[] = []
  private bufferTimeout?: NodeJS.Timeout | undefined

  constructor(
    private supabaseUrl: string,
    private supabaseKey: string,
    private tableName = 'logs',
    private options: {
      bufferSize?: number
      bufferTimeout?: number
    } = {}
  ) {
    this.options = {
      bufferSize: 20,
      bufferTimeout: 15000,
      ...options,
    }
  }

  write(entry: LogEntry): void {
    this.buffer.push(entry)

    if (this.buffer.length >= (this.options.bufferSize || 20)) {
      this.flush()
    } else if (!this.bufferTimeout) {
      this.bufferTimeout = setTimeout(() => {
        this.flush()
      }, this.options.bufferTimeout || 15000)
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

    try {
      // Supabase REST API への投稿
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: this.supabaseKey,
        },
        body: JSON.stringify(entries),
      })

      if (!response.ok) {
        throw new Error(`Supabase insert failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Supabase logging error:', error)
    }
  }

  async close(): Promise<void> {
    await this.flush()
  }
}
