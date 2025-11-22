import { describe, expect, it } from 'vitest'
import { formatDateString, parseDateString, parseDatetimeString } from './dateUtils'

describe('dateUtils', () => {
  describe('parseDateString', () => {
    it('YYYY-MM-DD文字列をローカルタイムゾーンのDateに変換（前日にならない）', () => {
      const result = parseDateString('2025-01-22')
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // 0 = January
      expect(result.getDate()).toBe(22)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })

    it('不正な形式でエラーをスロー', () => {
      expect(() => parseDateString('2025/01/22')).toThrow('Invalid date format')
      expect(() => parseDateString('2025-1-22')).toThrow('Invalid date format')
      expect(() => parseDateString('invalid')).toThrow('Invalid date format')
    })
  })

  describe('formatDateString', () => {
    it('YYYY-MM-DD を yyyy/MM/dd に変換', () => {
      expect(formatDateString('2025-01-22')).toBe('2025/01/22')
      expect(formatDateString('2024-12-01')).toBe('2024/12/01')
    })
  })

  describe('parseDatetimeString', () => {
    it('タイムゾーンなしのISO 8601 datetime文字列をローカルタイムゾーンのDateに変換', () => {
      const result = parseDatetimeString('2025-01-22T14:30:00')
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // 0 = January
      expect(result.getDate()).toBe(22)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(0)
    })

    it('タイムゾーン付きのISO 8601 datetime文字列（UTC）をローカルタイムゾーンに変換', () => {
      const result = parseDatetimeString('2025-11-20T22:15:00+00:00')
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(10) // 10 = November
      expect(result.getDate()).toBe(20)
      // UTC 22:15 は日本時間（UTC+9）では翌日の 7:15
      // テスト環境のタイムゾーンに依存するため、時刻の値はテストしない
      expect(result).toBeInstanceOf(Date)
      expect(isNaN(result.getTime())).toBe(false)
    })

    it('タイムゾーン付きのISO 8601 datetime文字列（Z）をローカルタイムゾーンに変換', () => {
      const result = parseDatetimeString('2025-11-20T22:15:00Z')
      expect(result).toBeInstanceOf(Date)
      expect(isNaN(result.getTime())).toBe(false)
    })

    it('ミリ秒付きのタイムゾーン付きISO 8601 datetime文字列をローカルタイムゾーンに変換', () => {
      const result = parseDatetimeString('2025-11-20T22:15:00.123+00:00')
      expect(result).toBeInstanceOf(Date)
      expect(result.getMilliseconds()).toBe(123)
      expect(isNaN(result.getTime())).toBe(false)
    })

    it('toISOString()形式（ミリ秒.000Z）をローカルタイムゾーンに変換', () => {
      const result = parseDatetimeString('2025-11-20T22:15:00.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getMilliseconds()).toBe(0)
      expect(isNaN(result.getTime())).toBe(false)
    })

    it('不正な形式でエラーをスロー', () => {
      expect(() => parseDatetimeString('2025-01-22')).toThrow('Invalid datetime format')
      expect(() => parseDatetimeString('2025-01-22 14:30:00')).toThrow('Invalid datetime format')
      expect(() => parseDatetimeString('invalid')).toThrow('Invalid datetime')
    })
  })

  describe('タイムゾーン問題の回避', () => {
    it('parseDateStringはタイムゾーンの影響を受けない', () => {
      const dateStr = '2025-01-22'

      // parseDateString はローカルタイムゾーンとして解釈
      const dateWithParse = parseDateString(dateStr)

      // parseDateString の方が正しい日付を返す
      expect(dateWithParse.getDate()).toBe(22)

      // 備考: new Date('2025-01-22') はUTCとして解釈されるため、
      // タイムゾーンによって21日になることがある（日本時間など）
    })
  })
})
