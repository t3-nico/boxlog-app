/**
 * 🎨 BoxLog Logger Formatters
 *
 * ログフォーマッターの実装・カスタマイズ
 * - JSON・Pretty・Simple形式
 * - カラー出力・開発者向け表示
 */

import type { LogEntry, LogFormatter } from './types'

/**
 * 🎨 ANSI カラーコード
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
} as const

/**
 * ⚡ ログレベル別カラー設定
 */
const levelColors = {
  error: colors.red,
  warn: colors.yellow,
  info: colors.blue,
  debug: colors.gray,
} as const

/**
 * 🎯 JSON フォーマッター
 */
export const jsonFormatter: LogFormatter = (entry: LogEntry): string => {
  // 機密情報のマスキング
  const maskedEntry = maskSensitiveData(entry)

  // 最適化されたJSON出力
  return JSON.stringify(maskedEntry, null, 0)
}

/**
 * 🎨 Pretty フォーマッター（開発環境用）
 */
export const prettyFormatter: LogFormatter = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString('ja-JP')
  const levelColor = levelColors[entry.level] || colors.white
  const levelPadded = entry.level.toUpperCase().padEnd(5)

  // ベーシック情報
  let output = `${colors.gray}${timestamp}${colors.reset} ${levelColor}${levelPadded}${colors.reset}`

  // コンポーネント表示
  if (entry.component) {
    output += ` ${colors.cyan}[${entry.component}]${colors.reset}`
  }

  // メッセージ
  output += ` ${entry.message}`

  // リクエストID・ユーザーID
  if (entry.requestId) {
    output += ` ${colors.dim}req:${entry.requestId.slice(0, 8)}${colors.reset}`
  }

  if (entry.userId) {
    output += ` ${colors.dim}user:${entry.userId}${colors.reset}`
  }

  // メタデータ表示
  if (entry.meta && Object.keys(entry.meta).length > 0) {
    const metaStr = Object.entries(entry.meta)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ')
    output += ` ${colors.dim}[${metaStr}]${colors.reset}`
  }

  // エラー詳細（型ガードで安全にアクセス）
  if (entry.level === 'error' && 'error' in entry && entry.error) {
    const errorEntry = entry as { error: { stack?: string; message: string } }
    output += `\n${colors.red}${errorEntry.error.stack || errorEntry.error.message}${colors.reset}`
  }

  // パフォーマンス情報
  if ('performance' in entry && entry.performance) {
    const perf = entry.performance as { duration: number; memory?: number }
    output += ` ${colors.magenta}⏱️${perf.duration}ms${colors.reset}`

    if (perf.memory) {
      const memMB = Math.round((perf.memory / 1024 / 1024) * 100) / 100
      output += ` ${colors.magenta}💾${memMB}MB${colors.reset}`
    }
  }

  return output
}

/**
 * 📝 Simple フォーマッター
 */
export const simpleFormatter: LogFormatter = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toISOString()
  const components = [timestamp, entry.level.toUpperCase(), entry.component || 'APP', entry.message]

  return components.join(' | ')
}

/**
 * 📊 Structured フォーマッター（ログ集約サービス向け）
 */
export const structuredFormatter: LogFormatter = (entry: LogEntry): string => {
  const structured = {
    '@timestamp': entry.timestamp,
    '@level': entry.level,
    '@message': entry.message,
    '@version': entry.version,
    '@environment': entry.environment,
    '@component': entry.component,
    '@requestId': entry.requestId,
    '@userId': entry.userId,
    '@sessionId': entry.sessionId,
    ...entry.meta,
  }

  // null/undefined値を除去
  Object.keys(structured).forEach((key) => {
    const typedKey = key as keyof typeof structured
    if (structured[typedKey] === null || structured[typedKey] === undefined) {
      delete structured[typedKey]
    }
  })

  return JSON.stringify(structured, null, 0)
}

/**
 * 🔍 CSV フォーマッター（分析用）
 */
export const csvFormatter: LogFormatter = (entry: LogEntry): string => {
  const values = [
    entry.timestamp,
    entry.level,
    entry.component || '',
    `"${entry.message.replace(/"/g, '""')}"`, // CSV エスケープ
    entry.requestId || '',
    entry.userId || '',
    entry.version || '',
    entry.environment || '',
  ]

  return values.join(',')
}

/**
 * 🎯 カスタムフォーマッター作成
 */
export function createCustomFormatter(template: string): LogFormatter {
  return (entry: LogEntry): string => {
    let output = template

    // テンプレート変数の置換
    const replacements: Record<string, string> = {
      '{{timestamp}}': entry.timestamp,
      '{{level}}': entry.level,
      '{{message}}': entry.message,
      '{{component}}': entry.component || '',
      '{{requestId}}': entry.requestId || '',
      '{{userId}}': entry.userId || '',
      '{{version}}': entry.version || '',
      '{{environment}}': entry.environment || '',
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
      // Security: Use safer string replacement instead of RegExp
      while (output.includes(placeholder)) {
        output = output.replace(placeholder, value)
      }
    })

    // メタデータの処理
    if (entry.meta) {
      const metaJson = JSON.stringify(entry.meta)
      output = output.replace('{{meta}}', metaJson)
    }

    return output
  }
}

/**
 * 🔒 機密データのマスキング
 */
function maskSensitiveData(entry: LogEntry): LogEntry {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'credential',
    'apiKey',
    'accessToken',
    'refreshToken',
    'sessionToken',
    'privateKey',
    'publicKey',
    'certificate',
    'signature',
  ]

  const maskedEntry = { ...entry }

  // メタデータ内の機密情報をマスク
  if (maskedEntry.meta) {
    maskedEntry.meta = { ...maskedEntry.meta }

    Object.keys(maskedEntry.meta).forEach((key) => {
      const lowerKey = key.toLowerCase()
      const isSensitive = sensitiveKeys.some((sensitiveKey) => lowerKey.includes(sensitiveKey))

      if (isSensitive && typeof maskedEntry.meta![key] === 'string') {
        const value = maskedEntry.meta![key] as string
        maskedEntry.meta![key] = `***${value.slice(-4)}` // 末尾4文字のみ表示
      }
    })
  }

  // エラー情報内の機密情報をマスク
  if ('error' in maskedEntry && maskedEntry.error) {
    const errorEntry = maskedEntry as { error: { message: string; name?: string; stack?: string } }
    if (errorEntry.error.message) {
      // パスワードやトークンを含む可能性のあるエラーメッセージをマスク
      sensitiveKeys.forEach((key) => {
        // Security: Use safer string replacement instead of dynamic regex
        const patterns = [`${key}:`, `${key}=`, `${key} :`, `${key} =`]

        patterns.forEach((pattern) => {
          const lowerMessage = errorEntry.error.message.toLowerCase()
          const lowerPattern = pattern.toLowerCase()

          if (lowerMessage.includes(lowerPattern)) {
            const index = lowerMessage.indexOf(lowerPattern)
            if (index !== -1) {
              const before = errorEntry.error.message.substring(0, index)
              const patternPart = errorEntry.error.message.substring(index, index + pattern.length)
              const after = errorEntry.error.message.substring(index + pattern.length)

              // Replace the first word after pattern with ***
              const afterWords = after.split(/\s+/)
              if (afterWords.length > 0 && afterWords[0]) {
                afterWords[0] = '***'
                errorEntry.error.message = before + patternPart + afterWords.join(' ')
              }
            }
          }
        })
      })
    }
  }

  return maskedEntry
}

/**
 * 🎨 フォーマッター選択ヘルパー
 */
export function getFormatter(format: 'json' | 'pretty' | 'simple' | 'structured' | 'csv'): LogFormatter {
  switch (format) {
    case 'json':
      return jsonFormatter
    case 'pretty':
      return prettyFormatter
    case 'simple':
      return simpleFormatter
    case 'structured':
      return structuredFormatter
    case 'csv':
      return csvFormatter
    default:
      return jsonFormatter
  }
}

/**
 * 📊 ログサマリー作成
 */
export function createLogSummary(entries: LogEntry[]): string {
  if (entries.length === 0) {
    return 'No log entries found'
  }

  const levelCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const timeRange = {
    start: new Date(Math.min(...entries.map((e) => new Date(e.timestamp).getTime()))),
    end: new Date(Math.max(...entries.map((e) => new Date(e.timestamp).getTime()))),
  }

  const components = [...new Set(entries.map((e) => e.component).filter(Boolean))]

  let summary = `\n${colors.bright}📊 Log Summary${colors.reset}\n`
  summary += `${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  summary += `📅 Time Range: ${timeRange.start.toLocaleString()} - ${timeRange.end.toLocaleString()}\n`
  summary += `📊 Total Entries: ${entries.length}\n`
  summary += `🏷️  Log Levels: ${Object.entries(levelCounts)
    .map(([level, count]) => {
      const color = levelColors[level as keyof typeof levelColors] || colors.white
      return `${color}${level}:${count}${colors.reset}`
    })
    .join(' ')}\n`

  if (components.length > 0) {
    summary += `🧩 Components: ${components.join(', ')}\n`
  }

  summary += `${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`

  return summary
}

/**
 * 🎯 デフォルトエクスポート
 */
const loggerFormatters = {
  json: jsonFormatter,
  pretty: prettyFormatter,
  simple: simpleFormatter,
  structured: structuredFormatter,
  csv: csvFormatter,
  getFormatter,
  createCustomFormatter,
  createLogSummary,
}

export default loggerFormatters
