/**
 * 複数形処理のテスト
 */

import type { PluralTranslation } from '../pluralization'
import {
  formatCounter,
  formatFileSize,
  formatICUPlural,
  formatTimeUnit,
  getPluralCategory,
  getPluralRuleInfo,
  getSupportedPluralLocales,
  pluralizeWithVariables,
  selectPluralTranslation,
  testPluralRule,
} from '../pluralization'

describe('Pluralization System', () => {
  describe('getPluralCategory', () => {
    it('英語の複数形ルール', () => {
      expect(getPluralCategory('en', 0)).toBe('other')
      expect(getPluralCategory('en', 1)).toBe('one')
      expect(getPluralCategory('en', 2)).toBe('other')
      expect(getPluralCategory('en', 5)).toBe('other')
    })

    it('日本語の複数形ルール（常にother）', () => {
      expect(getPluralCategory('ja', 0)).toBe('other')
      expect(getPluralCategory('ja', 1)).toBe('other')
      expect(getPluralCategory('ja', 2)).toBe('other')
      expect(getPluralCategory('ja', 100)).toBe('other')
    })

    it('負の数の処理（絶対値を使用）', () => {
      expect(getPluralCategory('en', -1)).toBe('one')
      expect(getPluralCategory('en', -5)).toBe('other')
    })
  })

  describe('selectPluralTranslation', () => {
    const testTranslations: PluralTranslation = {
      zero: 'no items',
      one: '1 item',
      other: '{{count}} items',
    }

    it('適切なカテゴリーの翻訳を選択', () => {
      expect(selectPluralTranslation('en', 0, testTranslations)).toBe('no items')
      expect(selectPluralTranslation('en', 1, testTranslations)).toBe('1 item')
      expect(selectPluralTranslation('en', 5, testTranslations)).toBe('{{count}} items')
    })

    it('存在しないカテゴリーはotherにフォールバック', () => {
      const limitedTranslations: PluralTranslation = {
        other: 'default translation',
      }

      expect(selectPluralTranslation('en', 1, limitedTranslations)).toBe('default translation')
      expect(selectPluralTranslation('en', 5, limitedTranslations)).toBe('default translation')
    })
  })

  describe('pluralizeWithVariables', () => {
    const translations: PluralTranslation = {
      zero: 'no {{item}}s',
      one: '1 {{item}}',
      other: '{{count}} {{item}}s',
    }

    it('変数補間付きで正しい翻訳を返す', () => {
      expect(pluralizeWithVariables('en', 0, translations, { item: 'task' })).toBe('no tasks')
      expect(pluralizeWithVariables('en', 1, translations, { item: 'task' })).toBe('1 task')
      expect(pluralizeWithVariables('en', 5, translations, { item: 'task' })).toBe('5 tasks')
    })

    it('count変数は自動で含まれる', () => {
      const simpleTranslations: PluralTranslation = {
        one: '{{count}} item',
        other: '{{count}} items',
      }

      expect(pluralizeWithVariables('en', 1, simpleTranslations)).toBe('1 item')
      expect(pluralizeWithVariables('en', 3, simpleTranslations)).toBe('3 items')
    })
  })

  describe('formatICUPlural', () => {
    it('ICU Message Format形式を処理', () => {
      const message = 'You have {count, plural, one {# task} other {# tasks}} remaining'

      expect(formatICUPlural('en', 1, message)).toBe('You have 1 task remaining')
      expect(formatICUPlural('en', 5, message)).toBe('You have 5 tasks remaining')
    })

    it('複数のICUプレースホルダーを処理', () => {
      const message = '{count, plural, one {# user} other {# users}} and {files, plural, one {# file} other {# files}}'

      expect(formatICUPlural('en', 1, message, { files: 3 })).toBe('1 user and 3 files')
      expect(formatICUPlural('en', 2, message, { files: 1 })).toBe('2 users and 1 file')
    })

    it('other カテゴリーが欠けている場合はエラー処理', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const invalidMessage = '{count, plural, one {# task}}'

      const result = formatICUPlural('en', 5, invalidMessage)
      expect(result).toBe(invalidMessage) // 元のメッセージをそのまま返す
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('formatTimeUnit', () => {
    it('英語の時間単位フォーマット', () => {
      expect(formatTimeUnit('en', 1, 'second')).toBe('1 second')
      expect(formatTimeUnit('en', 30, 'second')).toBe('30 seconds')
      expect(formatTimeUnit('en', 1, 'minute')).toBe('1 minute')
      expect(formatTimeUnit('en', 5, 'hour')).toBe('5 hours')
    })

    it('日本語の時間単位フォーマット', () => {
      expect(formatTimeUnit('ja', 1, 'second')).toBe('1秒')
      expect(formatTimeUnit('ja', 30, 'second')).toBe('30秒')
      expect(formatTimeUnit('ja', 1, 'minute')).toBe('1分')
      expect(formatTimeUnit('ja', 5, 'hour')).toBe('5時間')
    })
  })

  describe('formatFileSize', () => {
    it('英語のファイルサイズフォーマット', () => {
      expect(formatFileSize('en', 1, 'byte')).toBe('1 byte')
      expect(formatFileSize('en', 1024, 'byte')).toBe('1024 bytes')
      expect(formatFileSize('en', 5, 'MB')).toBe('5 MB')
      expect(formatFileSize('en', 1, 'GB')).toBe('1 GB')
    })

    it('日本語のファイルサイズフォーマット', () => {
      expect(formatFileSize('ja', 1, 'byte')).toBe('1バイト')
      expect(formatFileSize('ja', 1024, 'byte')).toBe('1024バイト')
      expect(formatFileSize('ja', 5, 'MB')).toBe('5MB')
      expect(formatFileSize('ja', 1, 'GB')).toBe('1GB')
    })
  })

  describe('formatCounter', () => {
    it('デフォルトの複数形処理（英語）', () => {
      expect(formatCounter('en', 0, 'item')).toBe('no items')
      expect(formatCounter('en', 1, 'item')).toBe('1 item')
      expect(formatCounter('en', 5, 'item')).toBe('5 items')
    })

    it('デフォルトの複数形処理（日本語）', () => {
      expect(formatCounter('ja', 1, 'アイテム')).toBe('1個のアイテム')
      expect(formatCounter('ja', 5, 'アイテム')).toBe('5個のアイテム')
    })

    it('カスタム翻訳の使用', () => {
      const customTranslations: PluralTranslation = {
        zero: '{{count}}件のタスクはありません',
        one: '{{count}}件のタスク',
        other: '{{count}}件のタスク',
      }

      expect(formatCounter('ja', 0, 'task', customTranslations)).toBe('0件のタスクはありません')
      expect(formatCounter('ja', 1, 'task', customTranslations)).toBe('1件のタスク')
      expect(formatCounter('ja', 5, 'task', customTranslations)).toBe('5件のタスク')
    })
  })

  describe('ユーティリティ関数', () => {
    it('testPluralRule: テストケースの結果を返す', () => {
      const results = testPluralRule('en', [0, 1, 2, 5])
      expect(results).toEqual({
        0: 'other',
        1: 'one',
        2: 'other',
        5: 'other',
      })
    })

    it('getSupportedPluralLocales: サポート言語一覧を返す', () => {
      const locales = getSupportedPluralLocales()
      expect(locales).toContain('en')
      expect(locales).toContain('ja')
      expect(Array.isArray(locales)).toBe(true)
    })

    it('getPluralRuleInfo: 詳細情報を返す', () => {
      const info = getPluralRuleInfo('en')
      expect(info.locale).toBe('en')
      expect(info.hasRule).toBe(true)
      expect(info.testResults).toBeDefined()
      expect(info.categories).toContain('one')
      expect(info.categories).toContain('other')
    })

    it('getPluralRuleInfo: サポートされていない言語', () => {
      const info = getPluralRuleInfo('unknown' as any)
      expect(info.locale).toBe('unknown')
      expect(info.hasRule).toBe(false)
      // デフォルトルール（英語）が適用される
      expect(info.testResults[1]).toBe('one')
    })
  })

  // 将来のRTL言語サポート用テスト（現在はスキップ）
  describe.skip('将来のRTL言語複数形ルール', () => {
    it('アラビア語の複数形ルール', () => {
      expect(getPluralCategory('ar' as any, 0)).toBe('zero')
      expect(getPluralCategory('ar' as any, 1)).toBe('one')
      expect(getPluralCategory('ar' as any, 2)).toBe('two')
      expect(getPluralCategory('ar' as any, 5)).toBe('few') // 3-10
      expect(getPluralCategory('ar' as any, 15)).toBe('many') // 11-99
      expect(getPluralCategory('ar' as any, 100)).toBe('other')
    })

    it('ロシア語の複数形ルール', () => {
      expect(getPluralCategory('ru' as any, 1)).toBe('one')
      expect(getPluralCategory('ru' as any, 21)).toBe('one') // 末尾が1
      expect(getPluralCategory('ru' as any, 2)).toBe('few') // 2-4
      expect(getPluralCategory('ru' as any, 22)).toBe('few') // 末尾が2-4
      expect(getPluralCategory('ru' as any, 5)).toBe('many') // その他
      expect(getPluralCategory('ru' as any, 11)).toBe('many') // 11は例外
    })
  })
})
