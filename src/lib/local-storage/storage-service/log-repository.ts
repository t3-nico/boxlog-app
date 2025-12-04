/**
 * ログリポジトリ
 */

import type { LocalLog, StoredLog } from './types'
import { StorageQuotaExceededError } from './types'
import {
  acquireLock,
  checkStorageQuota,
  dateToString,
  generateId,
  releaseLock,
  safeJsonParse,
  safeJsonStringify,
  stringToDate,
} from './utils'

const LOGS_KEY = 'boxlog_logs'

// 変換関数
function logToStored(log: LocalLog): StoredLog {
  return {
    ...log,
    actualStart: dateToString(log.actualStart),
    actualEnd: dateToString(log.actualEnd),
    createdAt: dateToString(log.createdAt),
    updatedAt: dateToString(log.updatedAt),
    deletedAt: log.deletedAt ? dateToString(log.deletedAt) : undefined,
  }
}

function storedToLog(stored: StoredLog): LocalLog {
  return {
    ...stored,
    actualStart: stringToDate(stored.actualStart),
    actualEnd: stringToDate(stored.actualEnd),
    createdAt: stringToDate(stored.createdAt),
    updatedAt: stringToDate(stored.updatedAt),
    deletedAt: stored.deletedAt ? stringToDate(stored.deletedAt) : undefined,
  }
}

// CRUD操作
export async function createLog(log: Omit<LocalLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalLog> {
  await acquireLock(LOGS_KEY)

  try {
    const now = new Date()
    const newLog: LocalLog = {
      ...log,
      id: generateId('log'),
      createdAt: now,
      updatedAt: now,
    }

    const logs = await getLogs(true)
    logs.push(newLog)

    const storedLogs = logs.map((l) => logToStored(l))
    const dataStr = safeJsonStringify(storedLogs)

    if (!checkStorageQuota(dataStr.length)) {
      throw new StorageQuotaExceededError()
    }

    localStorage.setItem(LOGS_KEY, dataStr)
    return newLog
  } finally {
    releaseLock(LOGS_KEY)
  }
}

export async function updateLog(id: string, updates: Partial<LocalLog>): Promise<LocalLog | null> {
  await acquireLock(LOGS_KEY)

  try {
    const logs = await getLogs(true)
    const logIndex = logs.findIndex((l) => l.id === id)

    if (logIndex === -1) {
      return null
    }

    const currentLog = logs[logIndex]
    if (!currentLog) {
      return null
    }

    const updatedLog: LocalLog = {
      ...currentLog,
      ...updates,
      id,
      updatedAt: new Date(),
    }

    logs[logIndex] = updatedLog

    const storedLogs = logs.map((l) => logToStored(l))
    localStorage.setItem(LOGS_KEY, safeJsonStringify(storedLogs))

    return updatedLog
  } finally {
    releaseLock(LOGS_KEY)
  }
}

export async function deleteLog(id: string, soft = true): Promise<boolean> {
  await acquireLock(LOGS_KEY)

  try {
    const logs = await getLogs(true)
    const logIndex = logs.findIndex((l) => l.id === id)

    if (logIndex === -1) {
      return false
    }

    if (soft) {
      const log = logs[logIndex]
      if (log) {
        log.deletedAt = new Date()
      }
    } else {
      logs.splice(logIndex, 1)
    }

    const storedLogs = logs.map((l) => logToStored(l))
    localStorage.setItem(LOGS_KEY, safeJsonStringify(storedLogs))

    return true
  } finally {
    releaseLock(LOGS_KEY)
  }
}

export async function getLog(id: string): Promise<LocalLog | null> {
  const logs = await getLogs(true)
  return logs.find((l) => l.id === id) || null
}

export async function getLogs(includeDeleted = false): Promise<LocalLog[]> {
  const data = localStorage.getItem(LOGS_KEY)
  if (!data) return []

  const storedLogs: StoredLog[] = safeJsonParse(data, [])
  const logs = storedLogs.map((l) => storedToLog(l))

  if (includeDeleted) {
    return logs
  }

  return logs.filter((l) => !l.deletedAt)
}

export async function getLogsByDateRange(start: Date, end: Date): Promise<LocalLog[]> {
  const logs = await getLogs()

  return logs.filter((log) => {
    const logStart = log.actualStart
    const logEnd = log.actualEnd

    return (
      (logStart >= start && logStart <= end) ||
      (logEnd >= start && logEnd <= end) ||
      (logStart <= start && logEnd >= end)
    )
  })
}

// 初期化
export function initializeLogs(): void {
  if (!localStorage.getItem(LOGS_KEY)) {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]))
  }
}

// 検証
export function validateLogs(logs: LocalLog[]): string[] {
  const errors: string[] = []

  for (const log of logs) {
    if (!log.id || !log.title || !log.actualStart || !log.actualEnd) {
      errors.push(`ログ ${log.id} に必須フィールドが不足しています`)
    }
    if (log.actualEnd < log.actualStart) {
      errors.push(`ログ ${log.id} の終了時刻が開始時刻より前です`)
    }
  }

  return errors
}

// エクスポート用
export { LOGS_KEY, logToStored, storedToLog }
