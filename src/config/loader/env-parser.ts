/**
 * 設定ローダー - 環境変数パーサー
 */

import { ENV_VAR_MAPPINGS } from './constants'

/**
 * 🌍 環境変数の適用
 */
export function applyEnvironmentVariables(config: Record<string, unknown>): Record<string, unknown> {
  const result = { ...config }

  Object.entries(ENV_VAR_MAPPINGS).forEach(([configPath, envVar]) => {
    const envValue = process.env[envVar]

    if (envValue !== undefined) {
      setNestedValue(result, configPath, parseEnvValue(envValue))
    }
  })

  return result
}

/**
 * 🔄 環境変数値のパース
 */
export function parseEnvValue(value: string): unknown {
  // Boolean
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false

  // Number
  if (/^\d+$/.test(value)) return parseInt(value, 10)
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value)

  // JSON
  if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
    try {
      return JSON.parse(value)
    } catch {
      // JSONパースに失敗した場合は文字列として扱う
    }
  }

  // String
  return value
}

/**
 * 🎯 ネストされた値の設定
 */
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
}
