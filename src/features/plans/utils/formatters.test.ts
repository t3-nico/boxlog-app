import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  formatplanDate,
  formatplanDateTime,
  formatplanNumber,
  formatplanStatus,
  formatRelativeTime,
} from './formatters'

describe('formatters', () => {
  describe('formatplanNumber', () => {
    it('TKT-YYYYMMDD-XXX形式を#TKT-XXXに変換する', () => {
      expect(formatplanNumber('TKT-20241030-001')).toBe('#TKT-001')
    })

    it('TKT-YYYYMMDD-XXX形式で3桁以上の番号も正しく変換する', () => {
      expect(formatplanNumber('TKT-20241030-123')).toBe('#TKT-123')
    })

    it('パーツが3つでない場合はそのまま#を付けて返す', () => {
      expect(formatplanNumber('TKT-001')).toBe('#TKT-001')
    })

    it('単一の文字列は#を付けて返す', () => {
      expect(formatplanNumber('ABC')).toBe('#ABC')
    })
  })

  describe('formatplanStatus', () => {
    it('todoをTodoに変換する', () => {
      expect(formatplanStatus('todo')).toBe('Todo')
    })

    it('doingをDoingに変換する', () => {
      expect(formatplanStatus('doing')).toBe('Doing')
    })

    it('doneをDoneに変換する', () => {
      expect(formatplanStatus('done')).toBe('Done')
    })
  })

  describe('formatplanDate', () => {
    it('YYYY-MM-DD形式をYYYY年MM月DD日に変換する', () => {
      expect(formatplanDate('2025-01-15')).toBe('2025年1月15日')
    })

    it('ISO 8601形式も正しく変換する', () => {
      // タイムゾーンの影響を受けるため、UTCの日付を使用
      const result = formatplanDate('2025-12-25T00:00:00Z')
      expect(result).toMatch(/2025年12月2[45]日/) // タイムゾーンによって24日か25日
    })

    it('nullの場合は-を返す', () => {
      expect(formatplanDate(null)).toBe('-')
    })

    it('undefinedの場合は-を返す', () => {
      expect(formatplanDate(undefined)).toBe('-')
    })

    it('空文字列の場合は-を返す', () => {
      expect(formatplanDate('')).toBe('-')
    })
  })

  describe('formatplanDateTime', () => {
    it('ISO 8601形式をYYYY/MM/DD HH:mmに変換する', () => {
      // ローカルタイムゾーンでテスト
      const date = new Date(2025, 0, 15, 9, 30) // 2025-01-15 09:30
      const isoString = date.toISOString()
      const result = formatplanDateTime(isoString)
      expect(result).toBe('2025/01/15 09:30')
    })

    it('nullの場合は-を返す', () => {
      expect(formatplanDateTime(null)).toBe('-')
    })

    it('undefinedの場合は-を返す', () => {
      expect(formatplanDateTime(undefined)).toBe('-')
    })

    it('空文字列の場合は-を返す', () => {
      expect(formatplanDateTime('')).toBe('-')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // 現在時刻を固定
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('1分未満は「たった今」を返す', () => {
      const date = new Date('2025-01-15T11:59:30Z').toISOString()
      expect(formatRelativeTime(date)).toBe('たった今')
    })

    it('1分以上60分未満は「X分前」を返す', () => {
      const date = new Date('2025-01-15T11:30:00Z').toISOString()
      expect(formatRelativeTime(date)).toBe('30分前')
    })

    it('1時間以上24時間未満は「X時間前」を返す', () => {
      const date = new Date('2025-01-15T09:00:00Z').toISOString()
      expect(formatRelativeTime(date)).toBe('3時間前')
    })

    it('1日以上30日未満は「X日前」を返す', () => {
      const date = new Date('2025-01-10T12:00:00Z').toISOString()
      expect(formatRelativeTime(date)).toBe('5日前')
    })

    it('30日以上は日付形式を返す', () => {
      const date = new Date('2024-12-01T12:00:00Z').toISOString()
      const result = formatRelativeTime(date)
      expect(result).toMatch(/2024年12月1日/)
    })

    it('nullの場合は-を返す', () => {
      expect(formatRelativeTime(null)).toBe('-')
    })

    it('undefinedの場合は-を返す', () => {
      expect(formatRelativeTime(undefined)).toBe('-')
    })

    it('空文字列の場合は-を返す', () => {
      expect(formatRelativeTime('')).toBe('-')
    })
  })
})
