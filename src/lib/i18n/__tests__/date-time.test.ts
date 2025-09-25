/**
 * 日付・時刻フォーマットのテスト
 */

import {
  compareTime,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  formatTime,
  getCurrentLocaleInfo,
  getFirstDayOfWeek,
  getMonthNames,
  getTimezone,
  getWeekdayNames,
  getWeekendDays,
  isValidDate,
} from '../date-time'

// テスト用の固定日付
const testDate = new Date('2024-01-15T14:30:00Z') // 2024年1月15日 14:30 UTC
const testDate2 = new Date('2024-01-20T09:15:00Z') // 2024年1月20日 09:15 UTC

describe('Date Time Formatting', () => {
  describe('formatDate', () => {
    it('英語（アメリカ）の日付フォーマット', () => {
      expect(formatDate(testDate, 'en', 'short')).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
      expect(formatDate(testDate, 'en', 'medium')).toContain('Jan')
      expect(formatDate(testDate, 'en', 'long')).toContain('January')
    })

    it('日本語の日付フォーマット', () => {
      const formatted = formatDate(testDate, 'ja', 'medium')
      expect(formatted).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/)
    })

    it('文字列からの日付変換', () => {
      expect(formatDate('2024-01-15', 'en', 'medium')).toContain('Jan')
    })

    it('数値（タイムスタンプ）からの日付変換', () => {
      const timestamp = testDate.getTime()
      expect(formatDate(timestamp, 'en', 'medium')).toContain('Jan')
    })
  })

  describe('formatTime', () => {
    it('英語（アメリカ）の時刻フォーマット - AM/PM', () => {
      const formatted = formatTime(testDate, 'en', 'short')
      expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
    })

    it('日本語の時刻フォーマット - 24時間制', () => {
      const formatted = formatTime(testDate, 'ja', 'short')
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
      expect(formatted).not.toMatch(/(AM|PM)/i)
    })
  })

  describe('formatDateTime', () => {
    it('日付と時刻の組み合わせフォーマット', () => {
      const formatted = formatDateTime(testDate, 'en', 'medium', 'short')
      expect(formatted).toContain('Jan')
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // 現在時刻を固定（2024-01-15T12:00:00Z）
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('過去の時刻を相対表現で表示', () => {
      const pastDate = new Date('2024-01-15T11:00:00Z') // 1時間前
      const formatted = formatRelativeTime(pastDate, 'en')
      expect(formatted).toMatch(/hour/i)
    })

    it('未来の時刻を相対表現で表示', () => {
      const futureDate = new Date('2024-01-15T14:00:00Z') // 2時間後
      const formatted = formatRelativeTime(futureDate, 'en')
      expect(formatted).toMatch(/hour/i)
    })

    it('日本語での相対時刻表現', () => {
      const pastDate = new Date('2024-01-14T12:00:00Z') // 1日前
      const formatted = formatRelativeTime(pastDate, 'ja')
      expect(formatted).toBeDefined()
    })
  })

  describe('formatDuration', () => {
    it('時間と分の期間表示', () => {
      const duration = 2 * 60 * 60 * 1000 + 30 * 60 * 1000 // 2時間30分
      const formatted = formatDuration(duration, 'en', ['hour', 'minute'])
      expect(formatted).toContain('2')
      expect(formatted).toContain('30')
    })

    it('秒単位の期間表示', () => {
      const duration = 45 * 1000 // 45秒
      const formatted = formatDuration(duration, 'en', ['second'])
      expect(formatted).toContain('45')
    })

    it('0秒の場合のフォールバック', () => {
      const formatted = formatDuration(0, 'en', ['hour', 'minute'])
      expect(formatted).toBe('0 seconds')
    })
  })

  describe('formatDateRange', () => {
    it('日付範囲のフォーマット', () => {
      const formatted = formatDateRange(testDate, testDate2, 'en')
      expect(formatted).toContain('-')
    })

    it('同じ日付の場合は一つだけ表示', () => {
      const formatted = formatDateRange(testDate, testDate, 'en')
      expect(formatted).not.toContain('-')
    })
  })

  describe('地域設定ヘルパー', () => {
    it('getFirstDayOfWeek: 英語圏は日曜日開始', () => {
      expect(getFirstDayOfWeek('en')).toBe(0) // Sunday
    })

    it('getWeekendDays: 一般的に土日が週末', () => {
      const weekendDays = getWeekendDays('en')
      expect(weekendDays).toContain(0) // Sunday
      expect(weekendDays).toContain(6) // Saturday
    })

    it('getWeekdayNames: 曜日名の取得', () => {
      const weekdays = getWeekdayNames('en', 'short')
      expect(weekdays).toHaveLength(7)
      expect(weekdays[0]).toMatch(/sun/i)
      expect(weekdays[1]).toMatch(/mon/i)
    })

    it('getMonthNames: 月名の取得', () => {
      const months = getMonthNames('en', 'short')
      expect(months).toHaveLength(12)
      expect(months[0]).toMatch(/jan/i)
      expect(months[11]).toMatch(/dec/i)
    })

    it('getMonthNames: 日本語の月名', () => {
      const months = getMonthNames('ja', 'long')
      expect(months).toHaveLength(12)
      expect(months[0]).toContain('1')
      expect(months[11]).toContain('12')
    })
  })

  describe('ユーティリティ関数', () => {
    it('getTimezone: タイムゾーン情報を取得', () => {
      const timezone = getTimezone()
      expect(typeof timezone).toBe('string')
      expect(timezone.length).toBeGreaterThan(0)
    })

    it('isValidDate: 有効な日付の判定', () => {
      expect(isValidDate(new Date())).toBe(true)
      expect(isValidDate(new Date('2024-01-15'))).toBe(true)
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate('2024-01-15')).toBe(false)
      expect(isValidDate(null)).toBe(false)
    })

    it('compareTime: 時刻のみの比較', () => {
      const time1 = new Date('2024-01-15T14:30:00Z')
      const time2 = new Date('2024-01-20T14:30:00Z') // 同じ時刻、異なる日
      const time3 = new Date('2024-01-15T15:30:00Z') // 1時間後

      expect(compareTime(time1, time2)).toBe(0) // 同じ時刻
      expect(compareTime(time1, time3)).toBeLessThan(0) // time1 が早い
      expect(compareTime(time3, time1)).toBeGreaterThan(0) // time3 が遅い
    })
  })

  describe('getCurrentLocaleInfo', () => {
    it('英語の地域情報を取得', () => {
      const info = getCurrentLocaleInfo('en')
      expect(info.locale).toBe('en')
      expect(info.weekdayNames).toHaveLength(7)
      expect(info.monthNames).toHaveLength(12)
      expect(info.config.firstDayOfWeek).toBeDefined()
    })

    it('日本語の地域情報を取得', () => {
      const info = getCurrentLocaleInfo('ja')
      expect(info.locale).toBe('ja')
      expect(info.config.ampm).toBe(false) // 24時間制
      expect(info.weekdayNames).toHaveLength(7)
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なロケールでもフォールバックして動作', () => {
      const invalidLocale = 'xx-XX' as any
      const formatted = formatDate(testDate, invalidLocale, 'medium')
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })

    it('無効な日付でもエラーにならない', () => {
      expect(() => {
        formatDate('invalid-date', 'en', 'medium')
      }).not.toThrow()
    })
  })

  describe('境界値テスト', () => {
    it('うるう年の2月29日を正しく処理', () => {
      const leapDate = new Date('2024-02-29T12:00:00Z')
      const formatted = formatDate(leapDate, 'en', 'medium')
      expect(formatted).toContain('Feb')
      expect(formatted).toContain('29')
    })

    it('年末年始の日付を正しく処理', () => {
      const newYear = new Date('2024-01-01T00:00:00Z')
      const formatted = formatDate(newYear, 'en', 'medium')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('1')
    })

    it('夏時間切り替えを考慮', () => {
      // 実際の実装では複雑になるため、基本的な動作確認のみ
      const summerDate = new Date('2024-07-15T12:00:00Z')
      const formatted = formatTime(summerDate, 'en', 'short')
      expect(typeof formatted).toBe('string')
    })
  })
})
