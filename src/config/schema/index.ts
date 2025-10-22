/**
 * 設定スキーマ - Zodバリデーション
 */

import { z } from 'zod'

/**
 * 📋 アプリ設定スキーマ
 */
const AppConfigSchema = z.object({
  name: z.string().default('BoxLog'),
  environment: z.enum(['development', 'production', 'test']).default('development'),
  debug: z.boolean().default(false),
  version: z.string().default('1.0.0'),
})

/**
 * 📋 データベース設定スキーマ
 */
const DatabaseConfigSchema = z.object({
  url: z.string().optional(),
  ssl: z.boolean().default(true),
  maxConnections: z.number().default(10),
})

/**
 * 📋 機能フラグスキーマ
 */
const FeaturesConfigSchema = z.object({
  debugMode: z.boolean().default(false),
  experimentalFeatures: z.boolean().default(false),
  analytics: z.boolean().default(true),
})

/**
 * 📋 ロギング設定スキーマ
 */
const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  console: z.boolean().default(true),
  file: z.boolean().default(false),
})

/**
 * 📋 サーバー設定スキーマ
 */
const ServerConfigSchema = z.object({
  port: z.number().default(3000),
  host: z.string().default('localhost'),
  session: z
    .object({
      secure: z.boolean().default(true),
      maxAge: z.number().default(86400000), // 24時間
    })
    .optional(),
})

/**
 * 📋 統合設定スキーマ
 */
export const ConfigSchema = z.object({
  app: AppConfigSchema,
  database: DatabaseConfigSchema,
  features: FeaturesConfigSchema,
  logging: LoggingConfigSchema,
  server: ServerConfigSchema,
})

/**
 * 📋 設定型定義
 */
export type Config = z.infer<typeof ConfigSchema>
export type AppConfig = z.infer<typeof AppConfigSchema>
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>
export type ServerConfig = z.infer<typeof ServerConfigSchema>

/**
 * 📋 設定バリデーションエラー型
 */
export interface ConfigValidationError {
  path: string[]
  message: string
  code: string
  input?: unknown
}

/**
 * 📋 設定バリデーション結果型
 */
export type ConfigValidationResult =
  | {
      success: true
      data: Config
      errors: ConfigValidationError[]
      warnings: string[]
    }
  | {
      success: false
      errors: ConfigValidationError[]
      warnings: string[]
      data?: never
    }

/**
 * 📋 デフォルト設定
 */
export const DEFAULT_CONFIGS = {
  development: {
    app: {
      name: 'BoxLog',
      environment: 'development' as const,
      debug: true,
      version: '1.0.0',
    },
    database: {
      ssl: false,
      maxConnections: 5,
    },
    features: {
      debugMode: true,
      experimentalFeatures: true,
      analytics: false,
    },
    logging: {
      level: 'debug' as const,
      console: true,
      file: false,
    },
    server: {
      port: 3000,
      host: 'localhost',
      session: {
        secure: false,
        maxAge: 86400000,
      },
    },
  },
  production: {
    app: {
      name: 'BoxLog',
      environment: 'production' as const,
      debug: false,
      version: '1.0.0',
    },
    database: {
      ssl: true,
      maxConnections: 10,
    },
    features: {
      debugMode: false,
      experimentalFeatures: false,
      analytics: true,
    },
    logging: {
      level: 'error' as const,
      console: true,
      file: true,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      session: {
        secure: true,
        maxAge: 86400000,
      },
    },
  },
  test: {
    app: {
      name: 'BoxLog',
      environment: 'test' as const,
      debug: true,
      version: '1.0.0',
    },
    database: {
      ssl: false,
      maxConnections: 3,
    },
    features: {
      debugMode: true,
      experimentalFeatures: false,
      analytics: false,
    },
    logging: {
      level: 'warn' as const,
      console: false,
      file: false,
    },
    server: {
      port: 3001,
      host: 'localhost',
      session: {
        secure: false,
        maxAge: 3600000,
      },
    },
  },
} as const
