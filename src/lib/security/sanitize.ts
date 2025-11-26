/**
 * HTML Sanitization Utilities
 *
 * XSS攻撃防止のためのHTMLサニタイゼーション
 * 企業級セキュリティベストプラクティス準拠
 */

import DOMPurify from 'dompurify'
import type { Config } from 'dompurify'

/**
 * 基本的なHTMLサニタイゼーション設定
 * 最小限の安全なタグのみ許可
 */
const BASIC_CONFIG: Config = {
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
}

/**
 * リッチテキスト用設定
 * エディタで使用される一般的なHTMLタグを許可
 */
const RICH_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'b',
    'i',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror', 'javascript'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
  ALLOW_DATA_ATTR: false,
}

/**
 * コードブロック用設定
 * シンタックスハイライト用のclassを許可
 */
const CODE_BLOCK_CONFIG: Config = {
  ALLOWED_TAGS: ['pre', 'code', 'span', 'div'],
  ALLOWED_ATTR: ['class', 'data-language'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
  ALLOW_DATA_ATTR: false,
}

/**
 * 基本的なHTMLコンテンツをサニタイズ
 * 最小限の安全なタグのみ許可
 */
export function sanitizeBasicHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return String(DOMPurify.sanitize(html, BASIC_CONFIG))
}

/**
 * リッチテキストコンテンツをサニタイズ
 * エディタで使用される一般的なHTMLタグを許可
 */
export function sanitizeRichText(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return String(DOMPurify.sanitize(html, RICH_TEXT_CONFIG))
}

/**
 * コードブロックコンテンツをサニタイズ
 * シンタックスハイライト用のHTMLを安全化
 */
export function sanitizeCodeBlock(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return String(DOMPurify.sanitize(html, CODE_BLOCK_CONFIG))
}

/**
 * カスタム設定でHTMLをサニタイズ
 * 特殊なケース用のカスタマイズ可能な関数
 */
export function sanitizeCustomHTML(html: string, config: Config): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return String(DOMPurify.sanitize(html, config))
}

/**
 * 危険なコンテンツの検出
 * サニタイズ前後でコンテンツが変更されたかチェック
 */
export function detectDangerousContent(html: string): boolean {
  if (!html || typeof html !== 'string') {
    return false
  }

  const sanitized = sanitizeBasicHTML(html)
  return html !== sanitized
}

/**
 * 安全なHTMLかどうかの検証
 * 開発環境でのデバッグ用
 */
export function validateSafeHTML(html: string): {
  isSafe: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!html || typeof html !== 'string') {
    return { isSafe: true, issues: [] }
  }

  // 危険なパターンをチェック
  const dangerousPatterns = [
    /javascript:/i,
    /on\w+\s*=/i,
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ]

  dangerousPatterns.forEach((pattern, index) => {
    if (pattern.test(html)) {
      issues.push(`Dangerous pattern ${index + 1} detected`)
    }
  })

  return {
    isSafe: issues.length === 0,
    issues,
  }
}
