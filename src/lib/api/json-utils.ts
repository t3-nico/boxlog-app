/**
 * 🔧 JSON安全処理ユーティリティ
 *
 * 高サロゲート文字などの無効なUnicode文字を処理し、
 * APIエラーを防ぐためのJSON処理ユーティリティ
 */

/**
 * 🛡️ 安全なJSON文字列化
 * 無効なUnicode文字（高サロゲート文字等）を除去/置換してJSONを生成
 */
export function safeJsonStringify(obj: any, space?: string | number): string {
  // 常に文字列を清浄化してからJSON化
  // （一部のJavaScriptエンジンやAPIエンドポイントは無効な文字を受け付けない）
  const cleanedObj = sanitizeObject(obj)
  return JSON.stringify(cleanedObj, null, space)
}

/**
 * 🧹 オブジェクトの文字列清浄化
 * 無効なUnicode文字を含む文字列を清浄化
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = sanitizeString(key)
      sanitized[cleanKey] = sanitizeObject(value)
    }
    return sanitized
  }

  return obj
}

/**
 * 🔤 文字列の清浄化
 * 無効なUnicode文字を除去/置換
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str

  // 高サロゲート文字（0xD800-0xDBFF）および低サロゲート文字（0xDC00-0xDFFF）の処理
  return str
    // 孤立した高サロゲート文字を除去
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '�')
    // 孤立した低サロゲート文字を除去
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�')
    // その他の制御文字を除去（タブ、改行、復帰は保持）
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // 非文字コードポイントを除去
    .replace(/[\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '�')
}

/**
 * 🔍 文字列に無効なUnicode文字が含まれているかチェック
 */
export function hasInvalidUnicodeChars(str: string): boolean {
  if (typeof str !== 'string') return false

  // 孤立したサロゲート文字をチェック
  const isolatedHighSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])/
  const isolatedLowSurrogate = /(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/
  const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/
  const nonCharacters = /[\uFDD0-\uFDEF\uFFFE\uFFFF]/

  return isolatedHighSurrogate.test(str) ||
         isolatedLowSurrogate.test(str) ||
         controlChars.test(str) ||
         nonCharacters.test(str)
}

/**
 * 🧪 デバッグ用：問題のある文字の詳細を取得
 */
export function analyzeInvalidChars(str: string): {
  hasIssues: boolean
  issues: Array<{
    type: string
    char: string
    position: number
    charCode: number
  }>
} {
  if (typeof str !== 'string') {
    return { hasIssues: false, issues: [] }
  }

  const issues: Array<{
    type: string
    char: string
    position: number
    charCode: number
  }> = []

  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const charCode = str.charCodeAt(i)

    // 高サロゲート文字
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      const nextChar = str[i + 1]
      if (!nextChar || nextChar.charCodeAt(0) < 0xDC00 || nextChar.charCodeAt(0) > 0xDFFF) {
        issues.push({
          type: 'isolated_high_surrogate',
          char,
          position: i,
          charCode
        })
      }
    }

    // 低サロゲート文字
    if (charCode >= 0xDC00 && charCode <= 0xDFFF) {
      const prevChar = str[i - 1]
      if (!prevChar || prevChar.charCodeAt(0) < 0xD800 || prevChar.charCodeAt(0) > 0xDBFF) {
        issues.push({
          type: 'isolated_low_surrogate',
          char,
          position: i,
          charCode
        })
      }
    }

    // 制御文字
    if ((charCode >= 0x0000 && charCode <= 0x0008) ||
        charCode === 0x000B ||
        charCode === 0x000C ||
        (charCode >= 0x000E && charCode <= 0x001F) ||
        (charCode >= 0x007F && charCode <= 0x009F)) {
      issues.push({
        type: 'control_character',
        char: char === '\u0000' ? '\\0' : char,
        position: i,
        charCode
      })
    }

    // 非文字コードポイント
    if ((charCode >= 0xFDD0 && charCode <= 0xFDEF) ||
        charCode === 0xFFFE ||
        charCode === 0xFFFF) {
      issues.push({
        type: 'non_character',
        char,
        position: i,
        charCode
      })
    }
  }

  return {
    hasIssues: issues.length > 0,
    issues
  }
}