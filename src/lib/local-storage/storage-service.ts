/**
 * BoxLog ローカルストレージサービス
 * イベントとログをローカルストレージで管理
 */

// 型定義
export interface LocalEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  status: string
  priority?: string
  color: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date // ソフト削除用
}

export interface LocalLog {
  id: string
  eventId?: string
  title: string
  actualStart: Date
  actualEnd: Date
  duration: number // 分
  satisfaction?: 1 | 2 | 3 | 4 | 5
  focusLevel?: 1 | 2 | 3 | 4 | 5
  energyLevel?: 1 | 2 | 3 | 4 | 5
  note?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface LocalTag {
  id: string
  name: string
  color: string
  count: number
  createdAt: Date
  updatedAt: Date
}

// ストレージ用の内部型（Date -> string変換）
interface StoredEvent extends Omit<LocalEvent, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

interface StoredLog extends Omit<LocalLog, 'actualStart' | 'actualEnd' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  actualStart: string
  actualEnd: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

// ストレージ制限とエラー
export class StorageQuotaExceededError extends Error {
  constructor(message = 'ローカルストレージの容量制限に達しました') {
    super(message)
    this.name = 'StorageQuotaExceededError'
  }
}

export class DataCorruptionError extends Error {
  constructor(message = 'データが破損しています') {
    super(message)
    this.name = 'DataCorruptionError'
  }
}

// メインサービスクラス
export class LocalStorageService {
  private readonly EVENTS_KEY = 'boxlog_events'
  private readonly LOGS_KEY = 'boxlog_logs'
  private readonly TAGS_KEY = 'boxlog_tags'
  private readonly VERSION_KEY = 'boxlog_version'
  private readonly CURRENT_VERSION = '1.0.0'
  
  // 同時書き込み防止用ロック
  private writeLocks = new Set<string>()
  
  constructor() {
    this.initializeStorage()
  }

  // 初期化
  private async initializeStorage(): Promise<void> {
    try {
      // バージョン確認
      const version = localStorage.getItem(this.VERSION_KEY)
      if (!version) {
        localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION)
      }

      // データ存在確認と初期化
      if (!localStorage.getItem(this.EVENTS_KEY)) {
        localStorage.setItem(this.EVENTS_KEY, JSON.stringify([]))
      }
      if (!localStorage.getItem(this.LOGS_KEY)) {
        localStorage.setItem(this.LOGS_KEY, JSON.stringify([]))
      }
      if (!localStorage.getItem(this.TAGS_KEY)) {
        localStorage.setItem(this.TAGS_KEY, JSON.stringify([]))
      }
    } catch (error) {
      console.error('ローカルストレージの初期化に失敗:', error)
    }
  }

  // ロック機能
  private async acquireLock(key: string): Promise<void> {
    while (this.writeLocks.has(key)) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    this.writeLocks.add(key)
  }

  private releaseLock(key: string): void {
    this.writeLocks.delete(key)
  }

  // 日付変換ユーティリティ
  private dateToString(date: Date): string {
    return date.toISOString()
  }

  private stringToDate(dateStr: string): Date {
    return new Date(dateStr)
  }

  // ストレージサイズ計算
  private calculateStorageSize(): number {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }

  // 安全なJSON操作
  private safeJsonParse<T>(data: string, fallback: T): T {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('JSON解析エラー:', error)
      return fallback
    }
  }

  private safeJsonStringify(data: any): string {
    try {
      return JSON.stringify(data)
    } catch (error) {
      console.error('JSON文字列化エラー:', error)
      throw new DataCorruptionError('データをシリアライズできません')
    }
  }

  // データ変換
  private eventToStored(event: LocalEvent): StoredEvent {
    return {
      ...event,
      startDate: this.dateToString(event.startDate),
      endDate: event.endDate ? this.dateToString(event.endDate) : undefined,
      createdAt: this.dateToString(event.createdAt),
      updatedAt: this.dateToString(event.updatedAt),
      deletedAt: event.deletedAt ? this.dateToString(event.deletedAt) : undefined
    }
  }

  private storedToEvent(stored: StoredEvent): LocalEvent {
    return {
      ...stored,
      startDate: this.stringToDate(stored.startDate),
      endDate: stored.endDate ? this.stringToDate(stored.endDate) : undefined,
      createdAt: this.stringToDate(stored.createdAt),
      updatedAt: this.stringToDate(stored.updatedAt),
      deletedAt: stored.deletedAt ? this.stringToDate(stored.deletedAt) : undefined
    }
  }

  private logToStored(log: LocalLog): StoredLog {
    return {
      ...log,
      actualStart: this.dateToString(log.actualStart),
      actualEnd: this.dateToString(log.actualEnd),
      createdAt: this.dateToString(log.createdAt),
      updatedAt: this.dateToString(log.updatedAt),
      deletedAt: log.deletedAt ? this.dateToString(log.deletedAt) : undefined
    }
  }

  private storedToLog(stored: StoredLog): LocalLog {
    return {
      ...stored,
      actualStart: this.stringToDate(stored.actualStart),
      actualEnd: this.stringToDate(stored.actualEnd),
      createdAt: this.stringToDate(stored.createdAt),
      updatedAt: this.stringToDate(stored.updatedAt),
      deletedAt: stored.deletedAt ? this.stringToDate(stored.deletedAt) : undefined
    }
  }

  // イベントのCRUD操作
  async createEvent(event: Omit<LocalEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalEvent> {
    await this.acquireLock(this.EVENTS_KEY)
    
    try {
      const now = new Date()
      const newEvent: LocalEvent = {
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      }

      const events = await this.getEvents(true)
      events.push(newEvent)

      const storedEvents = events.map(e => this.eventToStored(e))
      const dataStr = this.safeJsonStringify(storedEvents)
      
      // ストレージサイズチェック
      if (this.calculateStorageSize() + dataStr.length > 5 * 1024 * 1024) { // 5MB
        throw new StorageQuotaExceededError()
      }

      localStorage.setItem(this.EVENTS_KEY, dataStr)
      return newEvent
    } finally {
      this.releaseLock(this.EVENTS_KEY)
    }
  }

  async updateEvent(id: string, updates: Partial<LocalEvent>): Promise<LocalEvent | null> {
    await this.acquireLock(this.EVENTS_KEY)
    
    try {
      const events = await this.getEvents(true)
      const eventIndex = events.findIndex(e => e.id === id)
      
      if (eventIndex === -1) {
        return null
      }

      const updatedEvent: LocalEvent = {
        ...events[eventIndex],
        ...updates,
        id, // IDは変更不可
        updatedAt: new Date()
      }

      events[eventIndex] = updatedEvent

      const storedEvents = events.map(e => this.eventToStored(e))
      localStorage.setItem(this.EVENTS_KEY, this.safeJsonStringify(storedEvents))
      
      return updatedEvent
    } finally {
      this.releaseLock(this.EVENTS_KEY)
    }
  }

  async deleteEvent(id: string, soft = true): Promise<boolean> {
    await this.acquireLock(this.EVENTS_KEY)
    
    try {
      const events = await this.getEvents(true)
      const eventIndex = events.findIndex(e => e.id === id)
      
      if (eventIndex === -1) {
        return false
      }

      if (soft) {
        events[eventIndex].deletedAt = new Date()
      } else {
        events.splice(eventIndex, 1)
      }

      const storedEvents = events.map(e => this.eventToStored(e))
      localStorage.setItem(this.EVENTS_KEY, this.safeJsonStringify(storedEvents))
      
      return true
    } finally {
      this.releaseLock(this.EVENTS_KEY)
    }
  }

  async getEvent(id: string): Promise<LocalEvent | null> {
    const events = await this.getEvents(true)
    return events.find(e => e.id === id) || null
  }

  async getEvents(includeDeleted = false): Promise<LocalEvent[]> {
    const data = localStorage.getItem(this.EVENTS_KEY)
    if (!data) return []

    const storedEvents: StoredEvent[] = this.safeJsonParse(data, [])
    const events = storedEvents.map(e => this.storedToEvent(e))

    if (includeDeleted) {
      return events
    }

    return events.filter(e => !e.deletedAt)
  }

  async getEventsByDateRange(start: Date, end: Date): Promise<LocalEvent[]> {
    const events = await this.getEvents()
    
    return events.filter(event => {
      const eventStart = event.startDate
      const eventEnd = event.endDate || event.startDate
      
      return (eventStart >= start && eventStart <= end) ||
             (eventEnd >= start && eventEnd <= end) ||
             (eventStart <= start && eventEnd >= end)
    })
  }

  // ログのCRUD操作
  async createLog(log: Omit<LocalLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalLog> {
    await this.acquireLock(this.LOGS_KEY)
    
    try {
      const now = new Date()
      const newLog: LocalLog = {
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      }

      const logs = await this.getLogs(true)
      logs.push(newLog)

      const storedLogs = logs.map(l => this.logToStored(l))
      const dataStr = this.safeJsonStringify(storedLogs)
      
      if (this.calculateStorageSize() + dataStr.length > 5 * 1024 * 1024) {
        throw new StorageQuotaExceededError()
      }

      localStorage.setItem(this.LOGS_KEY, dataStr)
      return newLog
    } finally {
      this.releaseLock(this.LOGS_KEY)
    }
  }

  async updateLog(id: string, updates: Partial<LocalLog>): Promise<LocalLog | null> {
    await this.acquireLock(this.LOGS_KEY)
    
    try {
      const logs = await this.getLogs(true)
      const logIndex = logs.findIndex(l => l.id === id)
      
      if (logIndex === -1) {
        return null
      }

      const updatedLog: LocalLog = {
        ...logs[logIndex],
        ...updates,
        id,
        updatedAt: new Date()
      }

      logs[logIndex] = updatedLog

      const storedLogs = logs.map(l => this.logToStored(l))
      localStorage.setItem(this.LOGS_KEY, this.safeJsonStringify(storedLogs))
      
      return updatedLog
    } finally {
      this.releaseLock(this.LOGS_KEY)
    }
  }

  async deleteLog(id: string, soft = true): Promise<boolean> {
    await this.acquireLock(this.LOGS_KEY)
    
    try {
      const logs = await this.getLogs(true)
      const logIndex = logs.findIndex(l => l.id === id)
      
      if (logIndex === -1) {
        return false
      }

      if (soft) {
        logs[logIndex].deletedAt = new Date()
      } else {
        logs.splice(logIndex, 1)
      }

      const storedLogs = logs.map(l => this.logToStored(l))
      localStorage.setItem(this.LOGS_KEY, this.safeJsonStringify(storedLogs))
      
      return true
    } finally {
      this.releaseLock(this.LOGS_KEY)
    }
  }

  async getLog(id: string): Promise<LocalLog | null> {
    const logs = await this.getLogs(true)
    return logs.find(l => l.id === id) || null
  }

  async getLogs(includeDeleted = false): Promise<LocalLog[]> {
    const data = localStorage.getItem(this.LOGS_KEY)
    if (!data) return []

    const storedLogs: StoredLog[] = this.safeJsonParse(data, [])
    const logs = storedLogs.map(l => this.storedToLog(l))

    if (includeDeleted) {
      return logs
    }

    return logs.filter(l => !l.deletedAt)
  }

  async getLogsByDateRange(start: Date, end: Date): Promise<LocalLog[]> {
    const logs = await this.getLogs()
    
    return logs.filter(log => {
      const logStart = log.actualStart
      const logEnd = log.actualEnd
      
      return (logStart >= start && logStart <= end) ||
             (logEnd >= start && logEnd <= end) ||
             (logStart <= start && logEnd >= end)
    })
  }

  // ユーティリティメソッド
  async exportData(): Promise<{ events: LocalEvent[], logs: LocalLog[] }> {
    const [events, logs] = await Promise.all([
      this.getEvents(true),
      this.getLogs(true)
    ])

    return { events, logs }
  }

  async importData(data: { events?: LocalEvent[], logs?: LocalLog[] }): Promise<void> {
    if (data.events) {
      await this.acquireLock(this.EVENTS_KEY)
      try {
        const storedEvents = data.events.map(e => this.eventToStored(e))
        localStorage.setItem(this.EVENTS_KEY, this.safeJsonStringify(storedEvents))
      } finally {
        this.releaseLock(this.EVENTS_KEY)
      }
    }

    if (data.logs) {
      await this.acquireLock(this.LOGS_KEY)
      try {
        const storedLogs = data.logs.map(l => this.logToStored(l))
        localStorage.setItem(this.LOGS_KEY, this.safeJsonStringify(storedLogs))
      } finally {
        this.releaseLock(this.LOGS_KEY)
      }
    }
  }

  async clearAll(): Promise<void> {
    const keys = [this.EVENTS_KEY, this.LOGS_KEY, this.TAGS_KEY]
    
    for (const key of keys) {
      await this.acquireLock(key)
      try {
        localStorage.setItem(key, JSON.stringify([]))
      } finally {
        this.releaseLock(key)
      }
    }
  }

  async getStorageSize(): Promise<number> {
    return this.calculateStorageSize()
  }

  // デバッグ用メソッド
  async getStorageInfo(): Promise<{
    totalSize: number
    eventsCount: number
    logsCount: number
    version: string
  }> {
    const [events, logs] = await Promise.all([
      this.getEvents(true),
      this.getLogs(true)
    ])

    return {
      totalSize: this.calculateStorageSize(),
      eventsCount: events.length,
      logsCount: logs.length,
      version: localStorage.getItem(this.VERSION_KEY) || 'unknown'
    }
  }

  // データ整合性チェック
  async validateData(): Promise<{ isValid: boolean, errors: string[] }> {
    const errors: string[] = []

    try {
      const events = await this.getEvents(true)
      const logs = await this.getLogs(true)

      // イベントの検証
      for (const event of events) {
        if (!event.id || !event.title || !event.startDate) {
          errors.push(`イベント ${event.id} に必須フィールドが不足しています`)
        }
        if (event.endDate && event.endDate < event.startDate) {
          errors.push(`イベント ${event.id} の終了日が開始日より前です`)
        }
      }

      // ログの検証
      for (const log of logs) {
        if (!log.id || !log.title || !log.actualStart || !log.actualEnd) {
          errors.push(`ログ ${log.id} に必須フィールドが不足しています`)
        }
        if (log.actualEnd < log.actualStart) {
          errors.push(`ログ ${log.id} の終了時刻が開始時刻より前です`)
        }
      }

    } catch (error) {
      errors.push(`データ検証中にエラーが発生しました: ${error}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// シングルトンインスタンス
export const localStorageService = new LocalStorageService()