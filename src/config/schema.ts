/**
 * 🔧 BoxLog Configuration Schema System
 *
 * 設定ファイルの統一スキーマ定義・バリデーション・型安全性管理システム
 * - TypeScript型安全性保証
 * - Zodバリデーション
 * - 環境別設定管理
 * - デフォルト値・必須項目定義
 */

import { z } from 'zod';

/**
 * 📊 データベース設定スキーマ
 */
export const DatabaseConfigSchema = z.object({
  /** データベースホスト */
  host: z.string().min(1, 'Database host is required'),
  /** データベースポート */
  port: z.number().int().min(1).max(65535).default(5432),
  /** データベース名 */
  name: z.string().min(1, 'Database name is required'),
  /** ユーザー名 */
  username: z.string().min(1, 'Database username is required'),
  /** パスワード */
  password: z.string().min(1, 'Database password is required'),
  /** SSL接続 */
  ssl: z.boolean().default(false),
  /** 接続プール最大数 */
  maxConnections: z.number().int().min(1).max(100).default(10),
  /** 接続タイムアウト（ミリ秒） */
  connectionTimeout: z.number().int().min(1000).default(30000),
  /** クエリタイムアウト（ミリ秒） */
  queryTimeout: z.number().int().min(1000).default(60000),
});

/**
 * 🔐 認証設定スキーマ
 */
export const AuthConfigSchema = z.object({
  /** JWT秘密鍵 */
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  /** JWT有効期限 */
  jwtExpiresIn: z.string().default('7d'),
  /** リフレッシュトークン有効期限 */
  refreshTokenExpiresIn: z.string().default('30d'),
  /** パスワード最小長 */
  passwordMinLength: z.number().int().min(6).max(50).default(8),
  /** パスワードリセット有効期限（分） */
  passwordResetExpiry: z.number().int().min(5).max(1440).default(60),
  /** アカウントロック試行回数 */
  maxLoginAttempts: z.number().int().min(3).max(20).default(5),
  /** アカウントロック期間（分） */
  lockoutDuration: z.number().int().min(5).max(1440).default(30),
});

/**
 * 🎨 機能フラグ設定スキーマ
 */
export const FeatureFlagsSchema = z.object({
  /** ダッシュボード機能 */
  dashboard: z.boolean().default(true),
  /** ダークモード */
  darkMode: z.boolean().default(true),
  /** AI機能 */
  aiFeatures: z.boolean().default(false),
  /** カレンダー機能 */
  calendar: z.boolean().default(true),
  /** タスク管理 */
  taskManagement: z.boolean().default(true),
  /** ファイルアップロード */
  fileUpload: z.boolean().default(true),
  /** 通知機能 */
  notifications: z.boolean().default(true),
  /** リアルタイム機能 */
  realtime: z.boolean().default(false),
  /** 分析機能 */
  analytics: z.boolean().default(true),
  /** デバッグモード */
  debugMode: z.boolean().default(false),
});

/**
 * 📧 メール設定スキーマ
 */
export const EmailConfigSchema = z.object({
  /** SMTP ホスト */
  host: z.string().min(1, 'Email host is required'),
  /** SMTP ポート */
  port: z.number().int().min(1).max(65535).default(587),
  /** 認証が必要 */
  secure: z.boolean().default(false),
  /** ユーザー名 */
  username: z.string().optional(),
  /** パスワード */
  password: z.string().optional(),
  /** 送信者アドレス */
  from: z.string().email('Invalid from email address'),
  /** 送信者名 */
  fromName: z.string().default('BoxLog'),
  /** 1時間あたりの送信制限 */
  rateLimit: z.number().int().min(1).default(100),
});

/**
 * 🔗 外部API設定スキーマ
 */
export const ExternalApisSchema = z.object({
  /** OpenAI設定 */
  openai: z
    .object({
      apiKey: z.string().optional(),
      model: z.string().default('gpt-3.5-turbo'),
      maxTokens: z.number().int().min(1).max(4000).default(1000),
      temperature: z.number().min(0).max(2).default(0.7),
    })
    .optional(),
  /** Vercel Analytics */
  vercel: z
    .object({
      token: z.string().optional(),
      projectId: z.string().optional(),
    })
    .optional(),
});

/**
 * 🚀 サーバー設定スキーマ
 */
export const ServerConfigSchema = z.object({
  /** サーバーポート */
  port: z.number().int().min(1000).max(65535).default(3000),
  /** ホスト */
  host: z.string().default('localhost'),
  /** HTTPS使用 */
  https: z.boolean().default(false),
  /** CORS origins */
  corsOrigins: z.array(z.string()).default(['*']),
  /** ボディサイズ制限 */
  bodyLimit: z.string().default('10mb'),
  /** レート制限 */
  rateLimit: z.object({
    windowMs: z.number().int().min(1000).default(60000),
    maxRequests: z.number().int().min(1).default(100),
  }),
  /** セッション設定 */
  session: z.object({
    secret: z.string().min(32, 'Session secret must be at least 32 characters'),
    maxAge: z.number().int().min(60000).default(86400000), // 24時間
    httpOnly: z.boolean().default(true),
    secure: z.boolean().default(false),
  }),
});

/**
 * 📊 ログ設定スキーマ
 */
export const LoggingConfigSchema = z.object({
  /** ログレベル */
  level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  /** コンソール出力 */
  console: z.boolean().default(true),
  /** ファイル出力 */
  file: z.boolean().default(false),
  /** ファイルパス */
  filePath: z.string().default('./logs/boxlog.log'),
  /** ファイルローテーション */
  rotation: z.object({
    maxSize: z.string().default('10m'),
    maxFiles: z.number().int().min(1).default(5),
  }),
  /** JSON形式 */
  json: z.boolean().default(false),
  /** タイムスタンプ */
  timestamp: z.boolean().default(true),
});

/**
 * 🎯 メインアプリケーション設定スキーマ
 */
export const AppConfigSchema = z.object({
  /** アプリケーション名 */
  name: z.string().default('BoxLog'),
  /** バージョン */
  version: z.string().default('1.0.0'),
  /** 環境 */
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  /** ベースURL */
  baseUrl: z.string().url().default('http://localhost:3000'),
  /** タイムゾーン */
  timezone: z.string().default('Asia/Tokyo'),
  /** ロケール */
  locale: z.string().default('ja-JP'),
  /** デバッグモード */
  debug: z.boolean().default(false),
});

/**
 * 🔧 統合設定スキーマ
 */
export const ConfigSchema = z.object({
  /** アプリケーション設定 */
  app: AppConfigSchema,
  /** データベース設定 */
  database: DatabaseConfigSchema,
  /** 認証設定 */
  auth: AuthConfigSchema,
  /** 機能フラグ */
  features: FeatureFlagsSchema,
  /** メール設定 */
  email: EmailConfigSchema,
  /** 外部API設定 */
  apis: ExternalApisSchema,
  /** サーバー設定 */
  server: ServerConfigSchema,
  /** ログ設定 */
  logging: LoggingConfigSchema,
});

/**
 * 📝 型定義エクスポート
 */
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type ExternalApisConfig = z.infer<typeof ExternalApisSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

/**
 * 🎯 環境別デフォルト設定
 */
export const DEFAULT_CONFIGS = {
  development: {
    app: {
      debug: true,
      baseUrl: 'http://localhost:3000',
    },
    database: {
      ssl: false,
      maxConnections: 5,
    },
    features: {
      debugMode: true,
      aiFeatures: true,
    },
    logging: {
      level: 'debug' as const,
      console: true,
      file: false,
    },
    server: {
      https: false,
      corsOrigins: ['*'],
      session: {
        secure: false,
      },
    },
  },
  staging: {
    app: {
      debug: false,
      baseUrl: 'https://staging.boxlog.app',
    },
    database: {
      ssl: true,
      maxConnections: 20,
    },
    features: {
      debugMode: false,
      aiFeatures: true,
    },
    logging: {
      level: 'info' as const,
      console: true,
      file: true,
    },
    server: {
      https: true,
      corsOrigins: ['https://staging.boxlog.app'],
      session: {
        secure: true,
      },
    },
  },
  production: {
    app: {
      debug: false,
      baseUrl: 'https://boxlog.app',
    },
    database: {
      ssl: true,
      maxConnections: 50,
    },
    features: {
      debugMode: false,
      aiFeatures: false,
    },
    logging: {
      level: 'warn' as const,
      console: false,
      file: true,
    },
    server: {
      https: true,
      corsOrigins: ['https://boxlog.app'],
      session: {
        secure: true,
      },
    },
  },
} as const;

/**
 * 🔍 設定検証エラー情報
 */
export interface ConfigValidationError {
  path: string[];
  message: string;
  code: string;
  input?: unknown;
}

/**
 * ✅ 設定検証結果
 */
export interface ConfigValidationResult {
  success: boolean;
  data?: Config;
  errors: ConfigValidationError[];
  warnings: string[];
}
