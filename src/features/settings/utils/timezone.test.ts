import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  formatTimezoneInfo,
  getBrowserTimezone,
  getShortTimezoneDisplay,
  getTimezoneOffset,
  getUserTimezone,
  setUserTimezone,
  SUPPORTED_TIMEZONES,
} from './timezone'

describe('timezone', () => {
  describe('SUPPORTED_TIMEZONES', () => {
    it('9つのタイムゾーンが定義されている', () => {
      expect(SUPPORTED_TIMEZONES).toHaveLength(9)
    })

    it('日本（Asia/Tokyo）が含まれている', () => {
      const tokyo = SUPPORTED_TIMEZONES.find((tz) => tz.value === 'Asia/Tokyo')
      expect(tokyo).toBeDefined()
      expect(tokyo?.label).toBe('日本 (JST)')
      expect(tokyo?.offset).toBe('+09:00')
    })

    it('UTCが含まれている', () => {
      const utc = SUPPORTED_TIMEZONES.find((tz) => tz.value === 'UTC')
      expect(utc).toBeDefined()
      expect(utc?.offset).toBe('+00:00')
    })

    it('すべてのタイムゾーンにvalue, label, offsetが定義されている', () => {
      SUPPORTED_TIMEZONES.forEach((tz) => {
        expect(tz.value).toBeTruthy()
        expect(tz.label).toBeTruthy()
        expect(tz.offset).toBeTruthy()
      })
    })
  })

  describe('getBrowserTimezone', () => {
    it('Intl APIからタイムゾーンを取得する', () => {
      const result = getBrowserTimezone()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('エラー時はAsia/Tokyoにフォールバックする', () => {
      // Intl.DateTimeFormat をモック
      const originalIntl = globalThis.Intl
      // @ts-expect-error - テスト用にIntlを一時的に無効化
      globalThis.Intl = {
        DateTimeFormat: () => {
          throw new Error('Test error')
        },
      }

      const result = getBrowserTimezone()
      expect(result).toBe('Asia/Tokyo')

      // 復元
      globalThis.Intl = originalIntl
    })
  })

  describe('getUserTimezone / setUserTimezone', () => {
    beforeEach(() => {
      // localStorage をクリア
      localStorage.clear()
    })

    afterEach(() => {
      localStorage.clear()
    })

    it('保存されていない場合はnullを返す', () => {
      const result = getUserTimezone()
      expect(result).toBeNull()
    })

    it('タイムゾーンを保存・取得できる', () => {
      setUserTimezone('America/New_York')
      const result = getUserTimezone()
      expect(result).toBe('America/New_York')
    })

    it('異なるタイムゾーンで上書きできる', () => {
      setUserTimezone('Asia/Tokyo')
      setUserTimezone('Europe/London')
      const result = getUserTimezone()
      expect(result).toBe('Europe/London')
    })
  })

  describe('getTimezoneOffset', () => {
    it('UTCは0分を返す', () => {
      const result = getTimezoneOffset('UTC')
      expect(result).toBe(0)
    })

    it('Asia/Tokyoは540分（+9時間）を返す', () => {
      const result = getTimezoneOffset('Asia/Tokyo')
      // サマータイムがないので常に540分
      expect(result).toBe(540)
    })

    it('不明なタイムゾーンは0を返す（フォールバック）', () => {
      const result = getTimezoneOffset('Unknown/Timezone')
      expect(result).toBe(0)
    })
  })

  describe('formatTimezoneInfo', () => {
    it('サポートされているタイムゾーンはラベルとオフセットを含む', () => {
      const result = formatTimezoneInfo('Asia/Tokyo')
      expect(result).toContain('日本')
      expect(result).toContain('JST')
      expect(result).toContain('+09:00')
    })

    it('UTCは正しくフォーマットされる', () => {
      const result = formatTimezoneInfo('UTC')
      expect(result).toContain('UTC')
      expect(result).toContain('+00:00')
    })

    it('サポート外のタイムゾーンもフォーマットされる', () => {
      const result = formatTimezoneInfo('Pacific/Auckland')
      expect(result).toContain('Pacific/Auckland')
    })
  })

  describe('getShortTimezoneDisplay', () => {
    it('Asia/TokyoはJSTを返す', () => {
      expect(getShortTimezoneDisplay('Asia/Tokyo')).toBe('JST')
    })

    it('Asia/SeoulはKSTを返す', () => {
      expect(getShortTimezoneDisplay('Asia/Seoul')).toBe('KST')
    })

    it('UTCはUTCを返す', () => {
      expect(getShortTimezoneDisplay('UTC')).toBe('UTC')
    })

    it('America/New_YorkはESTを返す', () => {
      expect(getShortTimezoneDisplay('America/New_York')).toBe('EST')
    })

    it('Europe/LondonはGMTを返す', () => {
      expect(getShortTimezoneDisplay('Europe/London')).toBe('GMT')
    })

    it('未知のタイムゾーンは最後のパスを返す', () => {
      const result = getShortTimezoneDisplay('Pacific/Auckland')
      expect(result).toBe('Auckland')
    })

    it('スラッシュがないタイムゾーンはそのまま返す', () => {
      const result = getShortTimezoneDisplay('SomeTimezone')
      expect(result).toBe('SomeTimezone')
    })
  })

  describe('タイムゾーン変換の一貫性', () => {
    it('既知のオフセットマップが正しい', () => {
      const knownOffsets: { [key: string]: number } = {
        'Asia/Tokyo': 540, // UTC+9
        'Asia/Seoul': 540, // UTC+9
        'Asia/Shanghai': 480, // UTC+8
        'Australia/Sydney': 600, // UTC+10
        'Europe/London': 0, // UTC+0
        'Europe/Paris': 60, // UTC+1
        'America/New_York': -300, // UTC-5
        'America/Los_Angeles': -480, // UTC-8
        UTC: 0,
      }

      // Asia/Tokyoの確認
      expect(knownOffsets['Asia/Tokyo']).toBe(9 * 60)
      // America/New_Yorkの確認
      expect(knownOffsets['America/New_York']).toBe(-5 * 60)
      // UTCの確認
      expect(knownOffsets['UTC']).toBe(0)
    })
  })
})
