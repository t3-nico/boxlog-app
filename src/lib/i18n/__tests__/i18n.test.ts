/**
 * 国際化（i18n）ユニットテストフレームワーク
 */

import { beforeEach, describe, expect, it } from 'vitest'

import type { Locale } from '@/types/i18n'

import { getErrorMessage, LocalizedError } from '../error-messages'
import {
  createTranslation,
  defaultLocale,
  detectBrowserLanguage,
  getDictionary,
  getNestedValue,
  interpolate,
  locales,
} from '../index'

describe('i18n System', () => {
  describe('getDictionary', () => {
    it('英語辞書を正常に読み込める', async () => {
      const dictionary = await getDictionary('en')
      expect(dictionary).toBeDefined()
      expect(dictionary.app).toBeDefined()
      expect(dictionary.app.name).toBe('BoxLog')
    })

    it('日本語辞書を正常に読み込める', async () => {
      const dictionary = await getDictionary('ja')
      expect(dictionary).toBeDefined()
      expect(dictionary.app).toBeDefined()
      expect(dictionary.app.name).toBe('BoxLog')
      expect(dictionary.app.description).toBe('タスク管理アプリケーション')
    })

    it('存在しない言語の場合デフォルト言語を返す', async () => {
      const dictionary = await getDictionary('invalid' as Locale)
      expect(dictionary).toBeDefined()
      // デフォルト言語（英語）の内容が返される
      expect(dictionary.app.description).toBe('Task management application')
    })
  })

  describe('createTranslation', () => {
    let translation: (key: string, variables?: Record<string, string | number>) => string

    beforeEach(async () => {
      const dictionary = await getDictionary('en')
      translation = createTranslation(dictionary)
    })

    it('基本的な翻訳キーが動作する', () => {
      expect(translation('app.name')).toBe('BoxLog')
      expect(translation('navigation.dashboard')).toBe('Dashboard')
      expect(translation('actions.save')).toBe('Save')
    })

    it('存在しない翻訳キーの場合、キー自体を返す', () => {
      expect(translation('nonexistent.key')).toBe('nonexistent.key')
    })

    it('ネストした翻訳キーが動作する', () => {
      expect(translation('auth.login.title')).toBe('Sign In')
      expect(translation('auth.register.email')).toBe('Email address')
    })

    it('変数補間が正常に動作する', () => {
      // テスト用の変数補間対応翻訳を想定
      const testDict = {
        welcome: 'Hello, {{name}}!',
        count: 'You have {{count}} items',
      }
      const testTranslation = createTranslation(testDict)

      expect(testTranslation('welcome', { name: 'John' })).toBe('Hello, John!')
      expect(testTranslation('count', { count: 5 })).toBe('You have 5 items')
    })
  })

  describe('getNestedValue', () => {
    const testObject = {
      level1: {
        level2: {
          level3: 'deep value',
        },
        direct: 'direct value',
      },
      simple: 'simple value',
    }

    it('単一レベルの値を取得できる', () => {
      expect(getNestedValue(testObject, 'simple')).toBe('simple value')
    })

    it('ネストした値を取得できる', () => {
      expect(getNestedValue(testObject, 'level1.direct')).toBe('direct value')
      expect(getNestedValue(testObject, 'level1.level2.level3')).toBe('deep value')
    })

    it('存在しないパスの場合、パス自体を返す', () => {
      expect(getNestedValue(testObject, 'nonexistent')).toBe('nonexistent')
      expect(getNestedValue(testObject, 'level1.nonexistent')).toBe('level1.nonexistent')
    })
  })

  describe('interpolate', () => {
    it('変数補間が正常に動作する', () => {
      expect(interpolate('Hello, {{name}}!', { name: 'World' })).toBe('Hello, World!')
    })

    it('複数の変数補間が動作する', () => {
      const text = '{{greeting}}, {{name}}! You have {{count}} messages.'
      const variables = { greeting: 'Hi', name: 'Alice', count: 3 }
      expect(interpolate(text, variables)).toBe('Hi, Alice! You have 3 messages.')
    })

    it('変数が提供されない場合、元のテキストを返す', () => {
      expect(interpolate('Hello, {{name}}!')).toBe('Hello, {{name}}!')
    })

    it('存在しない変数の場合、プレースホルダーを保持する', () => {
      expect(interpolate('Hello, {{name}}!', { other: 'value' })).toBe('Hello, {{name}}!')
    })

    it('数値の変数補間が動作する', () => {
      expect(interpolate('Price: ${{price}}', { price: 29.99 })).toBe('Price: $29.99')
    })
  })

  describe('detectBrowserLanguage', () => {
    it('サポートされている言語を正しく検出する', () => {
      // Navigatorをモックしてテスト
      Object.defineProperty(window, 'navigator', {
        value: {
          language: 'ja-JP',
        },
        writable: true,
      })

      const detectedLocale = detectBrowserLanguage()
      expect(detectedLocale).toBe('ja')
    })

    it('サポートされていない言語の場合、デフォルト言語を返す', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          language: 'fr-FR',
        },
        writable: true,
      })

      const detectedLocale = detectBrowserLanguage()
      expect(detectedLocale).toBe(defaultLocale)
    })
  })

  describe('Locales and Constants', () => {
    it('サポートされている言語リストが正しい', () => {
      expect(locales).toEqual(['en', 'ja'])
      expect(locales).toContain('en')
      expect(locales).toContain('ja')
    })

    it('デフォルト言語が設定されている', () => {
      expect(defaultLocale).toBe('en')
      expect(locales).toContain(defaultLocale)
    })
  })
})

describe('Error Messages System', () => {
  describe('getErrorMessage', () => {
    it('英語でエラーメッセージを取得できる', () => {
      const error = getErrorMessage('REQUIRED_FIELD', 'en')
      expect(error.code).toBe('REQUIRED_FIELD')
      expect(error.type).toBe('validation')
      expect(error.title).toBe('Required Field')
      expect(error.message).toContain('required')
    })

    it('日本語でエラーメッセージを取得できる', () => {
      const error = getErrorMessage('REQUIRED_FIELD', 'ja')
      expect(error.code).toBe('REQUIRED_FIELD')
      expect(error.type).toBe('validation')
      expect(error.title).toBe('必須項目')
      expect(error.message).toContain('必須')
    })

    it('変数補間が正常に動作する', () => {
      const error = getErrorMessage('REQUIRED_FIELD', 'en', { field: 'Email' })
      expect(error.message).toBe('Email is required.')
    })

    it('存在しないエラーコードの場合、デフォルトエラーを返す', () => {
      const error = getErrorMessage('NONEXISTENT' as any, 'en')
      expect(error.code).toBe('INTERNAL_ERROR')
      expect(error.type).toBe('system')
    })
  })

  describe('LocalizedError', () => {
    it('ローカライズされたエラーオブジェクトを作成できる', () => {
      const error = new LocalizedError('INVALID_EMAIL', 'ja')
      expect(error.code).toBe('INVALID_EMAIL')
      expect(error.locale).toBe('ja')
      expect(error.message).toContain('メール')
    })

    it('変数付きでローカライズされたエラーを作成できる', () => {
      const error = new LocalizedError('MIN_LENGTH', 'en', { field: 'Password', min: 8 })
      const localizedMessage = error.getLocalizedMessage()
      expect(localizedMessage.message).toBe('Password must be at least 8 characters long.')
    })
  })
})

describe('Translation Key Coverage', () => {
  let enDictionary: any
  let jaDictionary: any

  beforeEach(async () => {
    enDictionary = await getDictionary('en')
    jaDictionary = await getDictionary('ja')
  })

  it('英語と日本語で同じキーが存在する', () => {
    const enKeys = getAllKeys(enDictionary)
    const jaKeys = getAllKeys(jaDictionary)

    expect(enKeys).toEqual(jaKeys)
  })

  it('必須の翻訳キーが存在する', () => {
    const requiredKeys = [
      'app.name',
      'app.description',
      'navigation.dashboard',
      'navigation.tasks',
      'actions.save',
      'actions.cancel',
      'auth.login.title',
      'auth.register.title',
      'language.switch',
    ]

    requiredKeys.forEach((key) => {
      expect(getNestedValue(enDictionary, key)).not.toBe(key)
      expect(getNestedValue(jaDictionary, key)).not.toBe(key)
    })
  })

  it('翻訳値が空でない', () => {
    const checkEmptyValues = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'string') {
          expect(value.trim()).not.toBe('')
          expect(value).not.toBe(currentKey) // 翻訳漏れチェック
        } else if (typeof value === 'object' && value !== null) {
          checkEmptyValues(value, currentKey)
        }
      }
    }

    checkEmptyValues(enDictionary)
    checkEmptyValues(jaDictionary)
  })
})

// ヘルパー関数：オブジェクトからすべてのキーのパスを取得
function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getAllKeys(value, currentKey))
    } else {
      keys.push(currentKey)
    }
  }

  return keys.sort()
}
