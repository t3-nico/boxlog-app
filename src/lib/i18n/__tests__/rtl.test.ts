/**
 * RTLサポートのテスト
 */

import {
  getBorderEnd,
  getBorderStart,
  getDirection,
  getFlexDirection,
  getIconPlacement,
  getMarginEnd,
  getMarginStart,
  getPaddingEnd,
  getPaddingStart,
  getPositionEnd,
  getPositionStart,
  getRoundedEnd,
  getRoundedStart,
  getTextAlignment,
  getTransform,
  isRTL,
} from '../rtl'

describe('RTL Support', () => {
  describe('isRTL', () => {
    it('LTR言語でfalseを返す', () => {
      expect(isRTL('en')).toBe(false)
      expect(isRTL('ja')).toBe(false)
    })

    // 将来のRTL言語サポート用のテスト
    it('RTL言語リストが空の場合はfalseを返す', () => {
      // 現在RTL言語はサポートしていないため、すべてfalse
      expect(isRTL('en' as any)).toBe(false)
    })
  })

  describe('getDirection', () => {
    it('LTR言語で"ltr"を返す', () => {
      expect(getDirection('en')).toBe('ltr')
      expect(getDirection('ja')).toBe('ltr')
    })
  })

  describe('getTextAlignment', () => {
    it('LTR言語で"text-left"を返す', () => {
      expect(getTextAlignment('en')).toBe('text-left')
      expect(getTextAlignment('ja')).toBe('text-left')
    })
  })

  describe('getFlexDirection', () => {
    it('LTR言語で"flex-row"を返す', () => {
      expect(getFlexDirection('en')).toBe('flex-row')
      expect(getFlexDirection('ja')).toBe('flex-row')
    })
  })

  describe('マージンクラス', () => {
    it('getMarginStart: LTR言語で左マージンを返す', () => {
      expect(getMarginStart('en', '4')).toBe('ml-4')
      expect(getMarginStart('ja', '2')).toBe('ml-2')
    })

    it('getMarginEnd: LTR言語で右マージンを返す', () => {
      expect(getMarginEnd('en', '4')).toBe('mr-4')
      expect(getMarginEnd('ja', '2')).toBe('mr-2')
    })
  })

  describe('パディングクラス', () => {
    it('getPaddingStart: LTR言語で左パディングを返す', () => {
      expect(getPaddingStart('en', '4')).toBe('pl-4')
      expect(getPaddingStart('ja', '8')).toBe('pl-8')
    })

    it('getPaddingEnd: LTR言語で右パディングを返す', () => {
      expect(getPaddingEnd('en', '4')).toBe('pr-4')
      expect(getPaddingEnd('ja', '6')).toBe('pr-6')
    })
  })

  describe('位置クラス', () => {
    it('getPositionStart: LTR言語で左位置を返す', () => {
      expect(getPositionStart('en', '0')).toBe('left-0')
      expect(getPositionStart('ja', '4')).toBe('left-4')
    })

    it('getPositionEnd: LTR言語で右位置を返す', () => {
      expect(getPositionEnd('en', '0')).toBe('right-0')
      expect(getPositionEnd('ja', '8')).toBe('right-8')
    })
  })

  describe('getIconPlacement', () => {
    it('LTR言語で"left"を返す', () => {
      expect(getIconPlacement('en')).toBe('left')
      expect(getIconPlacement('ja')).toBe('left')
    })
  })

  describe('ボーダークラス', () => {
    it('getBorderStart: LTR言語で左ボーダーを返す', () => {
      expect(getBorderStart('en')).toBe('border-l-2')
      expect(getBorderStart('ja', '4')).toBe('border-l-4')
    })

    it('getBorderEnd: LTR言語で右ボーダーを返す', () => {
      expect(getBorderEnd('en')).toBe('border-r-2')
      expect(getBorderEnd('ja', '1')).toBe('border-r-1')
    })
  })

  describe('角丸クラス', () => {
    it('getRoundedStart: LTR言語で左角丸を返す', () => {
      expect(getRoundedStart('en')).toBe('rounded-l-md')
      expect(getRoundedStart('ja', 'lg')).toBe('rounded-l-lg')
    })

    it('getRoundedEnd: LTR言語で右角丸を返す', () => {
      expect(getRoundedEnd('en')).toBe('rounded-r-md')
      expect(getRoundedEnd('ja', 'sm')).toBe('rounded-r-sm')
    })
  })

  describe('getTransform', () => {
    it('LTR言語では変換しない', () => {
      expect(getTransform('en', 'translateX(10px)')).toBe('translateX(10px)')
      expect(getTransform('ja', 'rotate(45deg)')).toBe('rotate(45deg)')
    })

    it('translateXがない場合はそのまま返す', () => {
      expect(getTransform('en', 'scale(1.5)')).toBe('scale(1.5)')
    })
  })

  // 将来のRTL言語サポート用のテスト（現在はスキップ）
  describe.skip('RTL言語サポート（将来実装予定）', () => {
    const rtlLocale = 'ar' as any // アラビア語（将来サポート予定）

    it('RTL言語でtrueを返す', () => {
      expect(isRTL(rtlLocale)).toBe(true)
    })

    it('RTL言語で"rtl"を返す', () => {
      expect(getDirection(rtlLocale)).toBe('rtl')
    })

    it('RTL言語で"text-right"を返す', () => {
      expect(getTextAlignment(rtlLocale)).toBe('text-right')
    })

    it('RTL言語で"flex-row-reverse"を返す', () => {
      expect(getFlexDirection(rtlLocale)).toBe('flex-row-reverse')
    })

    it('RTLマージン: 開始位置が右マージン', () => {
      expect(getMarginStart(rtlLocale, '4')).toBe('mr-4')
      expect(getMarginEnd(rtlLocale, '4')).toBe('ml-4')
    })

    it('RTLパディング: 開始位置が右パディング', () => {
      expect(getPaddingStart(rtlLocale, '4')).toBe('pr-4')
      expect(getPaddingEnd(rtlLocale, '4')).toBe('pl-4')
    })

    it('RTL位置: 開始位置が右位置', () => {
      expect(getPositionStart(rtlLocale, '0')).toBe('right-0')
      expect(getPositionEnd(rtlLocale, '0')).toBe('left-0')
    })

    it('RTLアイコン配置: 右側', () => {
      expect(getIconPlacement(rtlLocale)).toBe('right')
    })

    it('RTLトランスフォーム: translateX値を反転', () => {
      expect(getTransform(rtlLocale, 'translateX(10px)')).toBe('translateX(-10px)')
      expect(getTransform(rtlLocale, 'translateX(-5rem)')).toBe('translateX(5rem)')
    })

    it('RTLトランスフォーム: scaleX値を反転', () => {
      expect(getTransform(rtlLocale, 'scaleX(1)')).toBe('scaleX(-1)')
      expect(getTransform(rtlLocale, 'scaleX(-1)')).toBe('scaleX(1)')
    })
  })
})

describe('RTL CSS生成', () => {
  // CSS生成関数のテスト（文字列検証）
  it('RTLスタイルシートが生成される', () => {
    const { generateRTLStyles } = require('../rtl')
    const styles = generateRTLStyles()

    expect(styles).toContain('[dir="rtl"]')
    expect(styles).toContain('direction: rtl')
    expect(styles).toContain('text-align: right')
    expect(styles).toContain('.sidebar-left')
    expect(styles).toContain('.dropdown-menu')
  })
})
