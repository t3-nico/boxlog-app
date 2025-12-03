/**
 * ローカルストレージ型定義
 */

// イベント型
export interface LocalEvent {
  id: string
  title: string
  description?: string | undefined
  startDate: Date
  endDate?: Date | undefined
  status: string
  priority?: string | undefined
  color: string
  tags?: string[] | undefined
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | undefined
}

// ログ型
export interface LocalLog {
  id: string
  eventId?: string | undefined
  title: string
  actualStart: Date
  actualEnd: Date
  duration: number
  satisfaction?: 1 | 2 | 3 | 4 | 5 | undefined
  focusLevel?: 1 | 2 | 3 | 4 | 5 | undefined
  energyLevel?: 1 | 2 | 3 | 4 | 5 | undefined
  note?: string | undefined
  tags?: string[] | undefined
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | undefined
}

// タグ型
export interface LocalTag {
  id: string
  name: string
  color: string
  count: number
  createdAt: Date
  updatedAt: Date
}

// ストレージ用内部型（Date -> string変換）
export interface StoredEvent
  extends Omit<LocalEvent, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  startDate: string
  endDate?: string | undefined
  createdAt: string
  updatedAt: string
  deletedAt?: string | undefined
}

export interface StoredLog
  extends Omit<LocalLog, 'actualStart' | 'actualEnd' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  actualStart: string
  actualEnd: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | undefined
}

// エラークラス
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
