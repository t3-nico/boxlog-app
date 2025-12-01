/**
 * 📊 BoxLog Logger Types
 *
 * ログシステムの型定義・インターフェース定義
 * - ログレベル・メタデータ・設定の型安全性
 */

/**
 * 🎯 ログレベル定義
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

/**
 * 📊 ログレベル優先度
 */
export const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const

/**
 * 📋 基本ログエントリ
 */
export interface LogEntry {
  /** タイムスタンプ */
  timestamp: string
  /** ログレベル */
  level: LogLevel
  /** メッセージ */
  message: string
  /** アプリケーションバージョン */
  version?: string | undefined
  /** 実行環境 */
  environment?: string | undefined
  /** コンポーネント名 */
  component?: string | undefined
  /** リクエストID */
  requestId?: string | undefined
  /** ユーザーID */
  userId?: string | undefined
  /** セッションID */
  sessionId?: string | undefined
  /** 追加メタデータ */
  meta?: Record<string, unknown>
}

/**
 * 🚨 エラーログエントリ
 */
export interface ErrorLogEntry extends LogEntry {
  level: 'error'
  /** エラーオブジェクト */
  error?:
    | {
        name: string
        message: string
        stack?: string | undefined
        code?: string | number | undefined
      }
    | undefined
  /** エラーコンテキスト */
  context?: {
    action?: string
    resource?: string
    parameters?: Record<string, unknown>
  }
}

/**
 * ⚡ パフォーマンスログエントリ
 */
export interface PerformanceLogEntry extends LogEntry {
  level: 'info' | 'debug'
  /** パフォーマンスメトリクス */
  performance: {
    /** 実行時間（ミリ秒） */
    duration: number
    /** メモリ使用量（バイト） */
    memory?: number
    /** CPUタイム（ミリ秒） */
    cpu?: number
    /** データベースクエリ時間 */
    dbTime?: number
    /** 外部API呼び出し時間 */
    apiTime?: number
  }
}

/**
 * 🔐 セキュリティログエントリ
 */
export interface SecurityLogEntry extends LogEntry {
  level: 'warn' | 'error'
  /** セキュリティイベント */
  security: {
    /** イベントタイプ */
    eventType: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach'
    /** IPアドレス */
    ipAddress?: string
    /** ユーザーエージェント */
    userAgent?: string
    /** 脅威レベル */
    threatLevel?: 'low' | 'medium' | 'high' | 'critical'
    /** 関連リソース */
    resource?: string
  }
}

/**
 * 📊 ビジネスログエントリ
 */
export interface BusinessLogEntry extends LogEntry {
  level: 'info'
  /** ビジネスイベント */
  business: {
    /** イベントタイプ */
    eventType: 'user_action' | 'transaction' | 'conversion' | 'milestone'
    /** ビジネス値 */
    value?: number
    /** 通貨 */
    currency?: string
    /** カテゴリ */
    category?: string
    /** タグ */
    tags?: string[]
  }
}

/**
 * ⚙️ ログ出力設定
 */
export interface LoggerConfig {
  /** 最小ログレベル */
  level: LogLevel
  /** コンソール出力 */
  console: {
    enabled: boolean
    /** カラー出力 */
    colors: boolean
    /** フォーマット形式 */
    format: 'json' | 'pretty' | 'simple'
  }
  /** ファイル出力 */
  file: {
    enabled: boolean
    /** ファイルパス */
    path: string
    /** ローテーション設定 */
    rotation: {
      /** 最大ファイルサイズ */
      maxSize: string
      /** 最大ファイル数 */
      maxFiles: number
      /** 日別ローテーション */
      datePattern?: string
    }
  }
  /** 外部サービス出力 */
  external: {
    enabled: boolean
    /** サービス設定 */
    services: {
      vercel?: {
        enabled: boolean
      }
      supabase?: {
        enabled: boolean
        table?: string
      }
      webhook?: {
        enabled: boolean
        url?: string
        headers?: Record<string, string>
      }
    }
  }
  /** メタデータ設定 */
  metadata: {
    /** 自動追加するフィールド */
    includeVersion: boolean
    includeEnvironment: boolean
    includeHostname: boolean
    includeProcessId: boolean
    includeMemory: boolean
  }
  /** フィルタリング設定 */
  filtering: {
    /** 機密情報のマスキング */
    sensitiveKeys: string[]
    /** 除外するコンポーネント */
    excludeComponents: string[]
    /** サンプリングレート */
    samplingRate: number
  }
}

/**
 * 📤 ログ出力インターフェース
 */
export interface LogOutput {
  /** 出力名 */
  name: string
  /** ログエントリの出力 */
  write(entry: LogEntry): Promise<void> | void
  /** クローズ処理 */
  close?(): Promise<void> | void
  /** フラッシュ処理 */
  flush?(): Promise<void> | void
}

/**
 * 🎯 ログコンテキスト
 */
export interface LogContext {
  /** リクエストID */
  requestId?: string | undefined
  /** ユーザーID */
  userId?: string | undefined
  /** セッションID */
  sessionId?: string | undefined
  /** コンポーネント名 */
  component?: string | undefined
  /** 追加コンテキスト */
  [key: string]: unknown
}

/**
 * 📊 ログ統計情報
 */
export interface LogStats {
  /** 総ログ数 */
  totalLogs: number
  /** レベル別統計 */
  byLevel: Record<LogLevel, number>
  /** 時間帯別統計 */
  byHour: Record<string, number>
  /** コンポーネント別統計 */
  byComponent: Record<string, number>
  /** エラー統計 */
  errors: {
    total: number
    byType: Record<string, number>
    recent: ErrorLogEntry[]
  }
  /** パフォーマンス統計 */
  performance: {
    averageDuration: number
    slowestOperations: PerformanceLogEntry[]
    memoryUsage: {
      average: number
      peak: number
    }
  }
}

/**
 * 🎨 ログフォーマッター関数型
 */
export type LogFormatter = (entry: LogEntry) => string

/**
 * 🔍 ログフィルター関数型
 */
export type LogFilter = (entry: LogEntry) => boolean

/**
 * 📋 ログクエリ条件
 */
export interface LogQuery {
  /** 開始日時 */
  startTime?: Date
  /** 終了日時 */
  endTime?: Date
  /** ログレベル */
  levels?: LogLevel[]
  /** コンポーネント */
  components?: string[]
  /** ユーザーID */
  userIds?: string[]
  /** メッセージ検索 */
  messageSearch?: string
  /** メタデータ条件 */
  metaFilters?: Record<string, unknown>
  /** 制限数 */
  limit?: number
  /** オフセット */
  offset?: number
  /** ソート順 */
  sortOrder?: 'asc' | 'desc'
}
