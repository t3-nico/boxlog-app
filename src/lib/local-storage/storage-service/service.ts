/**
 * ローカルストレージサービス
 * イベントとログをローカルストレージで管理
 */

import * as eventRepo from './event-repository'
import * as logRepo from './log-repository'
import type { LocalEvent, LocalLog } from './types'
import { acquireLock, calculateStorageSize, releaseLock, safeJsonStringify } from './utils'

const VERSION_KEY = 'boxlog_version'
const TAGS_KEY = 'boxlog_tags'
const CURRENT_VERSION = '1.0.0'

export class LocalStorageService {
  constructor() {
    this.initializeStorage()
  }

  private async initializeStorage(): Promise<void> {
    try {
      const version = localStorage.getItem(VERSION_KEY)
      if (!version) {
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      }

      eventRepo.initializeEvents()
      logRepo.initializeLogs()

      if (!localStorage.getItem(TAGS_KEY)) {
        localStorage.setItem(TAGS_KEY, JSON.stringify([]))
      }
    } catch (error) {
      console.error('ローカルストレージの初期化に失敗:', error)
    }
  }

  // イベント操作
  async createEvent(event: Omit<LocalEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalEvent> {
    return eventRepo.createEvent(event)
  }

  async updateEvent(id: string, updates: Partial<LocalEvent>): Promise<LocalEvent | null> {
    return eventRepo.updateEvent(id, updates)
  }

  async deleteEvent(id: string, soft = true): Promise<boolean> {
    return eventRepo.deleteEvent(id, soft)
  }

  async getEvent(id: string): Promise<LocalEvent | null> {
    return eventRepo.getEvent(id)
  }

  async getEvents(includeDeleted = false): Promise<LocalEvent[]> {
    return eventRepo.getEvents(includeDeleted)
  }

  async getEventsByDateRange(start: Date, end: Date): Promise<LocalEvent[]> {
    return eventRepo.getEventsByDateRange(start, end)
  }

  // ログ操作
  async createLog(log: Omit<LocalLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalLog> {
    return logRepo.createLog(log)
  }

  async updateLog(id: string, updates: Partial<LocalLog>): Promise<LocalLog | null> {
    return logRepo.updateLog(id, updates)
  }

  async deleteLog(id: string, soft = true): Promise<boolean> {
    return logRepo.deleteLog(id, soft)
  }

  async getLog(id: string): Promise<LocalLog | null> {
    return logRepo.getLog(id)
  }

  async getLogs(includeDeleted = false): Promise<LocalLog[]> {
    return logRepo.getLogs(includeDeleted)
  }

  async getLogsByDateRange(start: Date, end: Date): Promise<LocalLog[]> {
    return logRepo.getLogsByDateRange(start, end)
  }

  // ユーティリティ
  async exportData(): Promise<{ events: LocalEvent[]; logs: LocalLog[] }> {
    const [events, logs] = await Promise.all([this.getEvents(true), this.getLogs(true)])
    return { events, logs }
  }

  async importData(data: { events?: LocalEvent[]; logs?: LocalLog[] }): Promise<void> {
    if (data.events) {
      await acquireLock(eventRepo.EVENTS_KEY)
      try {
        const storedEvents = data.events.map((e) => eventRepo.eventToStored(e))
        localStorage.setItem(eventRepo.EVENTS_KEY, safeJsonStringify(storedEvents))
      } finally {
        releaseLock(eventRepo.EVENTS_KEY)
      }
    }

    if (data.logs) {
      await acquireLock(logRepo.LOGS_KEY)
      try {
        const storedLogs = data.logs.map((l) => logRepo.logToStored(l))
        localStorage.setItem(logRepo.LOGS_KEY, safeJsonStringify(storedLogs))
      } finally {
        releaseLock(logRepo.LOGS_KEY)
      }
    }
  }

  async clearAll(): Promise<void> {
    const keys = [eventRepo.EVENTS_KEY, logRepo.LOGS_KEY, TAGS_KEY]

    for (const key of keys) {
      await acquireLock(key)
      try {
        localStorage.setItem(key, JSON.stringify([]))
      } finally {
        releaseLock(key)
      }
    }
  }

  async getStorageSize(): Promise<number> {
    return calculateStorageSize()
  }

  async getStorageInfo(): Promise<{
    totalSize: number
    eventsCount: number
    logsCount: number
    version: string
  }> {
    const [events, logs] = await Promise.all([this.getEvents(true), this.getLogs(true)])

    return {
      totalSize: calculateStorageSize(),
      eventsCount: events.length,
      logsCount: logs.length,
      version: localStorage.getItem(VERSION_KEY) || 'unknown',
    }
  }

  async validateData(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      const events = await this.getEvents(true)
      const logs = await this.getLogs(true)

      errors.push(...eventRepo.validateEvents(events))
      errors.push(...logRepo.validateLogs(logs))
    } catch (error) {
      errors.push(`データ検証中にエラーが発生しました: ${error}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// シングルトンインスタンス
export const localStorageService = new LocalStorageService()
