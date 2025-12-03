/**
 * ストレージユーティリティ
 */

import { DataCorruptionError } from './types'

// 同時書き込み防止用ロック管理
const writeLocks = new Set<string>()

export async function acquireLock(key: string): Promise<void> {
  while (writeLocks.has(key)) {
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  writeLocks.add(key)
}

export function releaseLock(key: string): void {
  writeLocks.delete(key)
}

// 日付変換
export function dateToString(date: Date): string {
  return date.toISOString()
}

export function stringToDate(dateStr: string): Date {
  return new Date(dateStr)
}

// ストレージサイズ計算
export function calculateStorageSize(): number {
  let total = 0
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        total += value.length + key.length
      }
    }
  }
  return total
}

// ID生成
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 安全なJSON操作
export function safeJsonParse<T>(data: string, fallback: T): T {
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('JSON解析エラー:', error)
    return fallback
  }
}

export function safeJsonStringify(data: unknown): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error('JSON文字列化エラー:', error)
    throw new DataCorruptionError('データをシリアライズできません')
  }
}

// ストレージ容量チェック
export function checkStorageQuota(additionalSize: number): boolean {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  return calculateStorageSize() + additionalSize <= MAX_SIZE
}
