/**
 * 翻訳辞書の整合性チェックテスト
 *
 * このテストは、ja.jsonとen.jsonの翻訳キーが一致していることを確認します。
 * 翻訳漏れを防ぐための自動テストです。
 */

import { describe, expect, it } from 'vitest'

import enDictionary from '../dictionaries/en.json'
import jaDictionary from '../dictionaries/ja.json'

/**
 * ネストしたオブジェクトからすべてのキーパスを抽出
 * 例: { a: { b: 'value' } } → ['a.b']
 */
function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys.sort()
}

describe('翻訳辞書の整合性チェック', () => {
  const jaKeys = extractKeys(jaDictionary)
  const enKeys = extractKeys(enDictionary)

  it('ja.jsonとen.jsonのキー数が一致すること', () => {
    expect(jaKeys.length).toBe(enKeys.length)
  })

  it('ja.jsonのすべてのキーがen.jsonに存在すること', () => {
    const missingInEn = jaKeys.filter((key) => !enKeys.includes(key))

    if (missingInEn.length > 0) {
      console.error('❌ en.jsonに存在しないキー:')
      missingInEn.forEach((key) => console.error(`  - ${key}`))
    }

    expect(missingInEn).toEqual([])
  })

  it('en.jsonのすべてのキーがja.jsonに存在すること', () => {
    const missingInJa = enKeys.filter((key) => !jaKeys.includes(key))

    if (missingInJa.length > 0) {
      console.error('❌ ja.jsonに存在しないキー:')
      missingInJa.forEach((key) => console.error(`  - ${key}`))
    }

    expect(missingInJa).toEqual([])
  })

  it('翻訳値が空文字列でないこと（ja.json）', () => {
    const emptyValues: string[] = []

    function checkEmptyValues(obj: Record<string, unknown>, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'string' && value.trim() === '') {
          emptyValues.push(fullKey)
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          checkEmptyValues(value as Record<string, unknown>, fullKey)
        }
      }
    }

    checkEmptyValues(jaDictionary)

    if (emptyValues.length > 0) {
      console.error('❌ ja.jsonに空の翻訳値:')
      emptyValues.forEach((key) => console.error(`  - ${key}`))
    }

    expect(emptyValues).toEqual([])
  })

  it('翻訳値が空文字列でないこと（en.json）', () => {
    const emptyValues: string[] = []

    function checkEmptyValues(obj: Record<string, unknown>, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'string' && value.trim() === '') {
          emptyValues.push(fullKey)
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          checkEmptyValues(value as Record<string, unknown>, fullKey)
        }
      }
    }

    checkEmptyValues(enDictionary)

    if (emptyValues.length > 0) {
      console.error('❌ en.jsonに空の翻訳値:')
      emptyValues.forEach((key) => console.error(`  - ${key}`))
    }

    expect(emptyValues).toEqual([])
  })

  it('変数プレースホルダーが一致すること', () => {
    const mismatchedPlaceholders: string[] = []

    function extractPlaceholders(text: string): string[] {
      const matches = text.match(/\{\{(\w+)\}\}/g)
      return matches ? matches.sort() : []
    }

    function comparePlaceholders(jaObj: Record<string, unknown>, enObj: Record<string, unknown>, prefix = '') {
      for (const key in jaObj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const jaValue = jaObj[key]
        const enValue = enObj[key]

        if (typeof jaValue === 'string' && typeof enValue === 'string') {
          const jaPlaceholders = extractPlaceholders(jaValue)
          const enPlaceholders = extractPlaceholders(enValue)

          if (JSON.stringify(jaPlaceholders) !== JSON.stringify(enPlaceholders)) {
            mismatchedPlaceholders.push(
              `${fullKey}: ja=${jaPlaceholders.join(',')} vs en=${enPlaceholders.join(',')}`
            )
          }
        } else if (
          jaValue &&
          typeof jaValue === 'object' &&
          enValue &&
          typeof enValue === 'object' &&
          !Array.isArray(jaValue) &&
          !Array.isArray(enValue)
        ) {
          comparePlaceholders(
            jaValue as Record<string, unknown>,
            enValue as Record<string, unknown>,
            fullKey
          )
        }
      }
    }

    comparePlaceholders(jaDictionary, enDictionary)

    if (mismatchedPlaceholders.length > 0) {
      console.error('❌ 変数プレースホルダーの不一致:')
      mismatchedPlaceholders.forEach((msg) => console.error(`  - ${msg}`))
    }

    expect(mismatchedPlaceholders).toEqual([])
  })
})
