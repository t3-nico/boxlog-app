/**
 * 🎯 ファクトリー関数
 */

import { ConsoleOutput } from './console'
import { FileOutput, RotatingFileOutput } from './file'
import { SupabaseOutput } from './supabase'
import { WebhookOutput } from './webhook'

export function createConsoleOutput(format: 'json' | 'pretty' | 'simple' = 'pretty'): ConsoleOutput {
  return new ConsoleOutput(format)
}

export function createFileOutput(filePath: string, format: 'json' | 'structured' | 'csv' = 'json'): FileOutput {
  return new FileOutput(filePath, format)
}

export function createRotatingFileOutput(
  filePath: string,
  maxSize = '10MB',
  maxFiles = 5,
  format: 'json' | 'structured' | 'csv' = 'json'
): RotatingFileOutput {
  return new RotatingFileOutput(filePath, format, { maxSize, maxFiles })
}

export function createWebhookOutput(url: string, options?: { headers?: Record<string, string> }): WebhookOutput {
  return new WebhookOutput(url, options)
}

export function createSupabaseOutput(url: string, key: string, tableName = 'logs'): SupabaseOutput {
  return new SupabaseOutput(url, key, tableName)
}
