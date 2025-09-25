/**
 * 数値・通貨フォーマットのテスト
 */

import {
  formatCompact,
  formatCurrency,
  formatDiscount,
  formatFileSize,
  formatNumber,
  formatOrdinal,
  formatPercentage,
  formatPhoneNumber,
  formatPriceRange,
  formatRating,
  formatScientific,
  formatWithUnit,
  getCurrencyInfo,
  getCurrentNumberFormatInfo,
  getSupportedCurrencies,
  isInRange,
  isValidNumber,
} from '../number-currency'

describe('Number and Currency Formatting', () => {
  describe('formatNumber', () => {
    it('基本的な数値フォーマット', () => {
      expect(formatNumber(1234.56, 'en')).toBe('1,234.56')
      expect(formatNumber(1234.56, 'ja')).toBe('1,234.56')
    })

    it('小数点以下の桁数指定', () => {
      const formatted = formatNumber(1234.5678, 'en', 'decimal', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      expect(formatted).toBe('1,234.57')
    })

    it('負の数のフォーマット', () => {
      expect(formatNumber(-1234.56, 'en')).toBe('-1,234.56')
    })

    it('ゼロのフォーマット', () => {
      expect(formatNumber(0, 'en')).toBe('0')
    })

    it('コンパクト表記', () => {
      const compact = formatNumber(1500000, 'en', 'compact')
      expect(compact).toMatch(/1\.5M|1500K/)
    })

    it('科学的記数法', () => {
      const scientific = formatNumber(1234567, 'en', 'scientific')
      expect(scientific).toMatch(/1\.23\d*E\+6/)
    })
  })

  describe('formatCurrency', () => {
    it('アメリカドルのフォーマット', () => {
      expect(formatCurrency(1234.56, 'en', 'USD')).toBe('$1,234.56')
    })

    it('日本円のフォーマット（小数点なし）', () => {
      const formatted = formatCurrency(1234, 'ja', 'JPY')
      expect(formatted).toMatch(/¥1,234|￥1,234/)
    })

    it('ユーロのフォーマット', () => {
      const formatted = formatCurrency(1234.56, 'en', 'EUR')
      expect(formatted).toContain('€')
      expect(formatted).toContain('1,234.56')
    })

    it('デフォルト通貨の使用', () => {
      // 英語ロケールのデフォルトはUSD
      const formatted = formatCurrency(100, 'en')
      expect(formatted).toContain('$')
    })

    it('負の金額のフォーマット', () => {
      const formatted = formatCurrency(-100, 'en', 'USD')
      expect(formatted).toMatch(/-\$100|(\$100)/) // 会計表記の場合は括弧
    })
  })

  describe('formatPercentage', () => {
    it('基本的なパーセンテージフォーマット', () => {
      expect(formatPercentage(0.1234, 'en')).toBe('12%')
      expect(formatPercentage(0.5, 'en')).toBe('50%')
    })

    it('小数点付きパーセンテージ', () => {
      const formatted = formatPercentage(0.1234, 'en', { maximumFractionDigits: 2 })
      expect(formatted).toBe('12.34%')
    })

    it('100%を超える値', () => {
      expect(formatPercentage(1.5, 'en')).toBe('150%')
    })
  })

  describe('formatCompact', () => {
    it('千の単位のコンパクト表記', () => {
      const formatted = formatCompact(1500, 'en')
      expect(formatted).toMatch(/1\.5K|1500/)
    })

    it('百万の単位のコンパクト表記', () => {
      const formatted = formatCompact(1500000, 'en')
      expect(formatted).toMatch(/1\.5M/)
    })

    it('十億の単位のコンパクト表記', () => {
      const formatted = formatCompact(1500000000, 'en')
      expect(formatted).toMatch(/1\.5B/)
    })
  })

  describe('formatFileSize', () => {
    it('バイナリ単位でのファイルサイズ', () => {
      expect(formatFileSize(0, 'en')).toContain('0')
      expect(formatFileSize(1024, 'en', true)).toMatch(/1.*KiB/)
      expect(formatFileSize(1048576, 'en', true)).toMatch(/1.*MiB/)
    })

    it('十進単位でのファイルサイズ', () => {
      expect(formatFileSize(1000, 'en', false)).toMatch(/1.*KB/)
      expect(formatFileSize(1000000, 'en', false)).toMatch(/1.*MB/)
    })

    it('大きなファイルサイズ', () => {
      const formatted = formatFileSize(1099511627776, 'en', true) // 1TB
      expect(formatted).toMatch(/1.*TiB/)
    })
  })

  describe('formatPriceRange', () => {
    it('価格範囲のフォーマット', () => {
      const formatted = formatPriceRange(100, 200, 'en', 'USD')
      expect(formatted).toContain('$100')
      expect(formatted).toContain('$200')
      expect(formatted).toContain('-')
    })

    it('同じ価格の場合は一つだけ表示', () => {
      const formatted = formatPriceRange(100, 100, 'en', 'USD')
      expect(formatted).toBe('$100.00')
      expect(formatted).not.toContain('-')
    })

    it('日本語での価格範囲', () => {
      const formatted = formatPriceRange(1000, 2000, 'ja', 'JPY')
      expect(formatted).toContain('〜')
    })
  })

  describe('formatOrdinal', () => {
    it('英語の序数詞', () => {
      expect(formatOrdinal(1, 'en')).toBe('1st')
      expect(formatOrdinal(2, 'en')).toBe('2nd')
      expect(formatOrdinal(3, 'en')).toBe('3rd')
      expect(formatOrdinal(4, 'en')).toBe('4th')
      expect(formatOrdinal(21, 'en')).toBe('21st')
      expect(formatOrdinal(22, 'en')).toBe('22nd')
      expect(formatOrdinal(23, 'en')).toBe('23rd')
    })

    it('日本語の序数詞', () => {
      expect(formatOrdinal(1, 'ja')).toBe('第1')
      expect(formatOrdinal(10, 'ja')).toBe('第10')
    })
  })

  describe('formatPhoneNumber', () => {
    it('アメリカの電話番号フォーマット', () => {
      expect(formatPhoneNumber('1234567890', 'en-US')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('11234567890', 'en-US')).toBe('+1 (123) 456-7890')
    })

    it('日本の電話番号フォーマット', () => {
      expect(formatPhoneNumber('0312345678', 'ja')).toBe('03-1234-5678')
      expect(formatPhoneNumber('09012345678', 'ja')).toBe('090-1234-5678')
    })

    it('既にフォーマットされた番号の処理', () => {
      expect(formatPhoneNumber('(123) 456-7890', 'en-US')).toBe('(123) 456-7890')
    })
  })

  describe('formatDiscount', () => {
    it('割引率のみ表示', () => {
      const formatted = formatDiscount(1000, 800, 'en', false)
      expect(formatted).toBe('20%')
    })

    it('割引額と割引率の両方表示（英語）', () => {
      const formatted = formatDiscount(1000, 800, 'en', true)
      expect(formatted).toContain('$200.00')
      expect(formatted).toContain('20%')
      expect(formatted).toContain('off')
    })

    it('割引額と割引率の両方表示（日本語）', () => {
      const formatted = formatDiscount(1000, 800, 'ja', true)
      expect(formatted).toContain('オフ')
      expect(formatted).toContain('引き')
    })
  })

  describe('formatRating', () => {
    it('最大値付きレーティング（英語）', () => {
      expect(formatRating(4.5, 5, 'en', true)).toBe('4.5 out of 5')
    })

    it('最大値付きレーティング（日本語）', () => {
      expect(formatRating(4.5, 5, 'ja', true)).toBe('4.5/5')
    })

    it('レーティングのみ表示', () => {
      expect(formatRating(4.5, 5, 'en', false)).toBe('4.5')
    })

    it('10点満点のレーティング', () => {
      expect(formatRating(8.7, 10, 'en', true)).toBe('8.7 out of 10')
    })
  })

  describe('formatWithUnit', () => {
    it('英語での単位付き数値', () => {
      expect(formatWithUnit(25, 'en', 'kg')).toBe('25 kg')
      expect(formatWithUnit(1.5, 'en', 'hours')).toBe('1.5 hours')
    })

    it('日本語での単位付き数値', () => {
      expect(formatWithUnit(25, 'ja', 'kg')).toBe('25kg')
      expect(formatWithUnit(100, 'ja', 'cm')).toBe('100cm')
    })
  })

  describe('formatScientific', () => {
    it('科学的記数法のフォーマット', () => {
      const formatted = formatScientific(1234567, 'en')
      expect(formatted).toMatch(/1\.23\d*E\+?6/)
    })

    it('小さな数値の科学的記数法', () => {
      const formatted = formatScientific(0.000123, 'en')
      expect(formatted).toMatch(/1\.23E-4/)
    })
  })

  describe('ユーティリティ関数', () => {
    it('isValidNumber: 有効な数値の判定', () => {
      expect(isValidNumber(123)).toBe(true)
      expect(isValidNumber(123.45)).toBe(true)
      expect(isValidNumber(0)).toBe(true)
      expect(isValidNumber(-123)).toBe(true)

      expect(isValidNumber(NaN)).toBe(false)
      expect(isValidNumber(Infinity)).toBe(false)
      expect(isValidNumber(-Infinity)).toBe(false)
      expect(isValidNumber('123')).toBe(false)
      expect(isValidNumber(null)).toBe(false)
      expect(isValidNumber(undefined)).toBe(false)
    })

    it('isInRange: 数値の範囲チェック', () => {
      expect(isInRange(5, 1, 10)).toBe(true)
      expect(isInRange(1, 1, 10)).toBe(true)
      expect(isInRange(10, 1, 10)).toBe(true)
      expect(isInRange(0, 1, 10)).toBe(false)
      expect(isInRange(11, 1, 10)).toBe(false)
    })

    it('getCurrencyInfo: 通貨情報の取得', () => {
      const usdInfo = getCurrencyInfo('USD')
      expect(usdInfo).toEqual({
        currency: 'USD',
        symbol: '$',
        name: 'US Dollar',
        decimalPlaces: 2,
        symbolPosition: 'before',
      })

      const jpyInfo = getCurrencyInfo('JPY')
      expect(jpyInfo?.decimalPlaces).toBe(0)

      expect(getCurrencyInfo('INVALID')).toBeNull()
    })

    it('getSupportedCurrencies: サポート通貨一覧', () => {
      const currencies = getSupportedCurrencies()
      expect(currencies).toContain('USD')
      expect(currencies).toContain('JPY')
      expect(currencies).toContain('EUR')
      expect(Array.isArray(currencies)).toBe(true)
    })

    it('getCurrentNumberFormatInfo: 地域の数値・通貨情報', () => {
      const info = getCurrentNumberFormatInfo('en')
      expect(info.locale).toBe('en')
      expect(info.defaultCurrency).toBe('USD')
      expect(info.examples.number).toBeDefined()
      expect(info.examples.currency).toBeDefined()
      expect(info.examples.percentage).toBeDefined()
      expect(info.examples.compact).toBeDefined()
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なロケールでもフォールバック', () => {
      const invalidLocale = 'xx-XX' as any
      expect(() => formatNumber(1234, invalidLocale)).not.toThrow()
      expect(() => formatCurrency(1234, invalidLocale, 'USD')).not.toThrow()
    })

    it('無効な通貨コードでもフォールバック', () => {
      expect(() => formatCurrency(1234, 'en', 'INVALID')).not.toThrow()
    })
  })

  describe('境界値テスト', () => {
    it('非常に大きな数値', () => {
      const largeNumber = 999999999999999
      expect(() => formatNumber(largeNumber, 'en')).not.toThrow()
      expect(() => formatCurrency(largeNumber, 'en', 'USD')).not.toThrow()
    })

    it('非常に小さな数値', () => {
      const smallNumber = 0.000000001
      expect(() => formatNumber(smallNumber, 'en')).not.toThrow()
      expect(() => formatCurrency(smallNumber, 'en', 'USD')).not.toThrow()
    })

    it('ゼロに近い値', () => {
      expect(formatPercentage(0.001, 'en', { maximumFractionDigits: 3 })).toBe('0.1%')
    })
  })
})
