/**
 * 🧪 JSON安全処理ユーティリティのテスト
 */

import { describe, test, expect } from 'vitest'
import { safeJsonStringify, hasInvalidUnicodeChars, analyzeInvalidChars } from '../json-utils'

describe('safeJsonStringify', () => {
  test('通常のオブジェクトが正常に処理される', () => {
    const obj = { name: 'テスト', value: 123 }
    const result = safeJsonStringify(obj)
    expect(result).toBe(JSON.stringify(obj))
  })

  test('高サロゲート文字を含む文字列が清浄化される', () => {
    // 孤立した高サロゲート文字を含むオブジェクト
    const objWithInvalidChars = {
      name: 'テスト\uD800invalid',
      description: 'これは\uD800\uD801問題のある文字列です'
    }

    const result = safeJsonStringify(objWithInvalidChars)
    expect(result).toContain('�') // 置換文字が含まれる
    expect(() => JSON.parse(result)).not.toThrow()

    const parsed = JSON.parse(result)
    expect(parsed.name).not.toContain('\uD800')
    expect(parsed.description).not.toContain('\uD800')
  })

  test('正常なサロゲートペアは保持される', () => {
    const objWithValidSurrogates = {
      emoji: '🌟', // 正常なサロゲートペア
      text: '📝テスト'
    }

    const result = safeJsonStringify(objWithValidSurrogates)
    const parsed = JSON.parse(result)
    expect(parsed.emoji).toBe('🌟')
    expect(parsed.text).toBe('📝テスト')
  })

  test('配列内の無効な文字も処理される', () => {
    const arrayWithInvalidChars = [
      '正常な文字列',
      '問題のある\uD800文字列',
      '別の\uDC00問題'
    ]

    const result = safeJsonStringify(arrayWithInvalidChars)
    expect(() => JSON.parse(result)).not.toThrow()
    const parsed = JSON.parse(result)
    expect(parsed[1]).not.toContain('\uD800')
    expect(parsed[2]).not.toContain('\uDC00')
    expect(parsed[1]).toContain('�') // 置換文字が含まれる
    expect(parsed[2]).toContain('�') // 置換文字が含まれる
  })

  test('制御文字が除去される', () => {
    const objWithControlChars = {
      text: 'テスト\u0000\u0001\u0002文字列'
    }

    const result = safeJsonStringify(objWithControlChars)
    const parsed = JSON.parse(result)
    expect(parsed.text).toBe('テスト文字列')
    expect(parsed.text).not.toContain('\u0000')
    expect(parsed.text).not.toContain('\u0001')
    expect(parsed.text).not.toContain('\u0002')
  })

  test('ネストしたオブジェクトも処理される', () => {
    const nestedObj = {
      user: {
        name: '無効\uD800文字',
        profile: {
          bio: '説明\uDC00テキスト'
        }
      }
    }

    const result = safeJsonStringify(nestedObj)
    expect(() => JSON.parse(result)).not.toThrow()
    const parsed = JSON.parse(result)
    expect(parsed.user.name).not.toContain('\uD800')
    expect(parsed.user.profile.bio).not.toContain('\uDC00')
    expect(parsed.user.name).toContain('�')
    expect(parsed.user.profile.bio).toContain('�')
  })
})

describe('hasInvalidUnicodeChars', () => {
  test('正常な文字列はfalseを返す', () => {
    expect(hasInvalidUnicodeChars('正常な文字列')).toBe(false)
    expect(hasInvalidUnicodeChars('🌟📝')).toBe(false)
    expect(hasInvalidUnicodeChars('')).toBe(false)
  })

  test('孤立した高サロゲート文字を検出', () => {
    expect(hasInvalidUnicodeChars('テスト\uD800文字')).toBe(true)
  })

  test('孤立した低サロゲート文字を検出', () => {
    expect(hasInvalidUnicodeChars('テスト\uDC00文字')).toBe(true)
  })

  test('制御文字を検出', () => {
    expect(hasInvalidUnicodeChars('テスト\u0000文字')).toBe(true)
    expect(hasInvalidUnicodeChars('テスト\u0001文字')).toBe(true)
  })

  test('非文字コードポイントを検出', () => {
    expect(hasInvalidUnicodeChars('テスト\uFFFE文字')).toBe(true)
    expect(hasInvalidUnicodeChars('テスト\uFFFF文字')).toBe(true)
  })

  test('正常なサロゲートペアは問題なしと判定', () => {
    expect(hasInvalidUnicodeChars('🌟📝')).toBe(false)
  })

  test('非文字列は問題なしと判定', () => {
    expect(hasInvalidUnicodeChars(123 as any)).toBe(false)
    expect(hasInvalidUnicodeChars(null as any)).toBe(false)
    expect(hasInvalidUnicodeChars(undefined as any)).toBe(false)
  })
})

describe('analyzeInvalidChars', () => {
  test('正常な文字列は問題なしと判定', () => {
    const result = analyzeInvalidChars('正常な文字列🌟')
    expect(result.hasIssues).toBe(false)
    expect(result.issues).toEqual([])
  })

  test('孤立した高サロゲート文字を詳細分析', () => {
    const result = analyzeInvalidChars('テスト\uD800文字')
    expect(result.hasIssues).toBe(true)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toEqual({
      type: 'isolated_high_surrogate',
      char: '\uD800',
      position: 3,
      charCode: 0xD800
    })
  })

  test('複数の問題を同時に検出', () => {
    const testString = 'テスト\uD800\u0000\uDC00文字'
    const result = analyzeInvalidChars(testString)
    expect(result.hasIssues).toBe(true)
    expect(result.issues).toHaveLength(3)

    // 高サロゲート、制御文字、低サロゲートの問題が検出される
    expect(result.issues.some(issue => issue.type === 'isolated_high_surrogate')).toBe(true)
    expect(result.issues.some(issue => issue.type === 'control_character')).toBe(true)
    expect(result.issues.some(issue => issue.type === 'isolated_low_surrogate')).toBe(true)
  })

  test('非文字列は問題なしと判定', () => {
    const result = analyzeInvalidChars(123 as any)
    expect(result.hasIssues).toBe(false)
    expect(result.issues).toEqual([])
  })
})

describe('実際のAPIエラーケースの再現', () => {
  test('リクエストヘッダーに無効な文字が含まれる場合', () => {
    const requestData = {
      headers: {
        'user-agent': 'Mozilla/5.0\uD800invalid',
        'content-type': 'application/json'
      },
      body: {
        name: 'テスト\uDC00ユーザー'
      }
    }

    const result = safeJsonStringify(requestData)
    expect(() => JSON.parse(result)).not.toThrow()

    const parsed = JSON.parse(result)
    expect(parsed.headers['user-agent']).not.toContain('\uD800')
    expect(parsed.body.name).not.toContain('\uDC00')
    expect(parsed.headers['user-agent']).toContain('�')
    expect(parsed.body.name).toContain('�')
  })

  test('大きなオブジェクトでの文字エンコーディング問題', () => {
    const largeObject = {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `ユーザー${i}\uD800`,
        description: `説明${i}\uDC00テキスト`
      }))
    }

    const result = safeJsonStringify(largeObject)
    expect(() => JSON.parse(result)).not.toThrow()

    const parsed = JSON.parse(result)
    parsed.users.forEach((user: any) => {
      expect(user.name).not.toContain('\uD800')
      expect(user.description).not.toContain('\uDC00')
      expect(user.name).toContain('�')
      expect(user.description).toContain('�')
    })
  })
})