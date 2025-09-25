/**
 * 🚨 BoxLog統一エラーコード体系
 *
 * 分野別・系統別でエラーコードを整理し、ログ分析・監視を効率化
 * チーム開発での一貫したエラーハンドリングを実現
 *
 * 番号体系:
 * - 1000番台: 認証・セキュリティ系
 * - 2000番台: API・ネットワーク系
 * - 3000番台: データ・データベース系
 * - 4000番台: UI・フロントエンド系
 * - 5000番台: システム・インフラ系
 * - 6000番台: ビジネスロジック系
 * - 7000番台: 外部サービス連携系
 */

// ==============================================
// 1000番台: 認証・セキュリティ系エラー
// ==============================================
export const AUTH_ERRORS = {
  /** 無効な認証トークン */
  AUTH_INVALID_TOKEN: 1001,
  /** 認証トークンの有効期限切れ */
  AUTH_EXPIRED: 1002,
  /** アクセス権限なし */
  AUTH_NO_PERMISSION: 1003,
  /** セッションタイムアウト */
  AUTH_SESSION_TIMEOUT: 1004,
  /** ログイン失敗（認証情報不正） */
  AUTH_LOGIN_FAILED: 1005,
  /** パスワード強度不足 */
  AUTH_WEAK_PASSWORD: 1006,
  /** アカウントロック */
  AUTH_ACCOUNT_LOCKED: 1007,
  /** 多要素認証失敗 */
  AUTH_MFA_FAILED: 1008,
  /** CSRFトークンエラー */
  AUTH_CSRF_ERROR: 1009,
  /** 権限昇格エラー */
  AUTH_PRIVILEGE_ESCALATION: 1010,
} as const

// ==============================================
// 2000番台: API・ネットワーク系エラー
// ==============================================
export const API_ERRORS = {
  /** APIレート制限超過 */
  API_RATE_LIMIT: 2001,
  /** 無効なAPIパラメータ */
  API_INVALID_PARAM: 2002,
  /** APIサーバーエラー */
  API_SERVER_ERROR: 2003,
  /** APIタイムアウト */
  API_TIMEOUT: 2004,
  /** APIバージョン不一致 */
  API_VERSION_MISMATCH: 2005,
  /** JSON解析エラー */
  API_JSON_PARSE_ERROR: 2006,
  /** HTTPステータスエラー */
  API_HTTP_ERROR: 2007,
  /** APIキー無効 */
  API_KEY_INVALID: 2008,
  /** CORS エラー */
  API_CORS_ERROR: 2009,
  /** ペイロードサイズ超過 */
  API_PAYLOAD_TOO_LARGE: 2010,
} as const

// ==============================================
// 3000番台: データ・データベース系エラー
// ==============================================
export const DATA_ERRORS = {
  /** データが見つからない */
  DATA_NOT_FOUND: 3001,
  /** データ重複エラー */
  DATA_DUPLICATE: 3002,
  /** データ検証エラー */
  DATA_VALIDATION_ERROR: 3003,
  /** データ破損 */
  DATA_CORRUPTION: 3004,
  /** データベース接続エラー */
  DATA_DB_CONNECTION_ERROR: 3005,
  /** トランザクションエラー */
  DATA_TRANSACTION_ERROR: 3006,
  /** データ制約違反 */
  DATA_CONSTRAINT_VIOLATION: 3007,
  /** マイグレーションエラー */
  DATA_MIGRATION_ERROR: 3008,
  /** バックアップエラー */
  DATA_BACKUP_ERROR: 3009,
  /** データ同期エラー */
  DATA_SYNC_ERROR: 3010,
} as const

// ==============================================
// 4000番台: UI・フロントエンド系エラー
// ==============================================
export const UI_ERRORS = {
  /** コンポーネントエラー */
  UI_COMPONENT_ERROR: 4001,
  /** レンダリングエラー */
  UI_RENDER_ERROR: 4002,
  /** State管理エラー */
  UI_STATE_ERROR: 4003,
  /** ルーティングエラー */
  UI_ROUTING_ERROR: 4004,
  /** フォーム検証エラー */
  UI_FORM_VALIDATION_ERROR: 4005,
  /** アップロードエラー */
  UI_UPLOAD_ERROR: 4006,
  /** メモリリーク */
  UI_MEMORY_LEAK: 4007,
  /** パフォーマンスエラー */
  UI_PERFORMANCE_ERROR: 4008,
  /** ブラウザ互換性エラー */
  UI_BROWSER_COMPAT_ERROR: 4009,
  /** アクセシビリティエラー */
  UI_ACCESSIBILITY_ERROR: 4010,
} as const

// ==============================================
// 5000番台: システム・インフラ系エラー
// ==============================================
export const SYSTEM_ERRORS = {
  /** メモリ不足エラー */
  SYSTEM_MEMORY_ERROR: 5001,
  /** ネットワークエラー */
  SYSTEM_NETWORK_ERROR: 5002,
  /** 設定エラー */
  SYSTEM_CONFIG_ERROR: 5003,
  /** ファイルシステムエラー */
  SYSTEM_FILESYSTEM_ERROR: 5004,
  /** CPU使用率異常 */
  SYSTEM_CPU_ERROR: 5005,
  /** ディスク容量不足 */
  SYSTEM_DISK_FULL: 5006,
  /** SSL証明書エラー */
  SYSTEM_SSL_ERROR: 5007,
  /** キャッシュエラー */
  SYSTEM_CACHE_ERROR: 5008,
  /** ログ書き込みエラー */
  SYSTEM_LOG_ERROR: 5009,
  /** 環境変数エラー */
  SYSTEM_ENV_ERROR: 5010,
} as const

// ==============================================
// 6000番台: ビジネスロジック系エラー
// ==============================================
export const BUSINESS_ERRORS = {
  /** ビジネスルール違反 */
  BUSINESS_RULE_VIOLATION: 6001,
  /** ワークフロー状態エラー */
  BUSINESS_WORKFLOW_ERROR: 6002,
  /** 計算エラー */
  BUSINESS_CALCULATION_ERROR: 6003,
  /** 在庫不足 */
  BUSINESS_INSUFFICIENT_STOCK: 6004,
  /** 期限切れ */
  BUSINESS_EXPIRED: 6005,
  /** 処理中断エラー */
  BUSINESS_PROCESS_INTERRUPTED: 6006,
  /** 依存関係エラー */
  BUSINESS_DEPENDENCY_ERROR: 6007,
  /** 状態整合性エラー */
  BUSINESS_STATE_INCONSISTENCY: 6008,
  /** 同時実行エラー */
  BUSINESS_CONCURRENCY_ERROR: 6009,
  /** リソース制限エラー */
  BUSINESS_RESOURCE_LIMIT: 6010,
} as const

// ==============================================
// 7000番台: 外部サービス連携系エラー
// ==============================================
export const EXTERNAL_ERRORS = {
  /** 外部API接続エラー */
  EXTERNAL_API_CONNECTION: 7001,
  /** 外部サービス認証エラー */
  EXTERNAL_SERVICE_AUTH: 7002,
  /** 外部データ形式エラー */
  EXTERNAL_DATA_FORMAT: 7003,
  /** 外部サービスメンテナンス */
  EXTERNAL_SERVICE_MAINTENANCE: 7004,
  /** WebHookエラー */
  EXTERNAL_WEBHOOK_ERROR: 7005,
  /** 1Password連携エラー */
  EXTERNAL_ONEPASSWORD_ERROR: 7006,
  /** Supabase接続エラー */
  EXTERNAL_SUPABASE_ERROR: 7007,
  /** メール送信エラー */
  EXTERNAL_EMAIL_ERROR: 7008,
  /** ストレージ接続エラー */
  EXTERNAL_STORAGE_ERROR: 7009,
  /** 決済サービスエラー */
  EXTERNAL_PAYMENT_ERROR: 7010,
} as const

// ==============================================
// 全エラーコードの統合
// ==============================================
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...API_ERRORS,
  ...DATA_ERRORS,
  ...UI_ERRORS,
  ...SYSTEM_ERRORS,
  ...BUSINESS_ERRORS,
  ...EXTERNAL_ERRORS,
} as const

// ==============================================
// エラーカテゴリマッピング
// ==============================================
export const ERROR_CATEGORIES = {
  auth: AUTH_ERRORS,
  api: API_ERRORS,
  data: DATA_ERRORS,
  ui: UI_ERRORS,
  system: SYSTEM_ERRORS,
  business: BUSINESS_ERRORS,
  external: EXTERNAL_ERRORS,
} as const

// ==============================================
// エラー情報辞書
// ==============================================
export const ERROR_INFO = {
  [ERROR_CODES.AUTH_INVALID_TOKEN]: {
    message: '認証トークンが無効です',
    level: 'error',
    category: 'auth',
    action: 'ログイン画面にリダイレクト',
    recoverable: true,
  },
  [ERROR_CODES.AUTH_EXPIRED]: {
    message: '認証の有効期限が切れています',
    level: 'warning',
    category: 'auth',
    action: 'トークンリフレッシュまたは再ログイン',
    recoverable: true,
  },
  [ERROR_CODES.DATA_NOT_FOUND]: {
    message: '要求されたデータが見つかりません',
    level: 'info',
    category: 'data',
    action: '404画面表示',
    recoverable: false,
  },
  [ERROR_CODES.API_RATE_LIMIT]: {
    message: 'APIリクエスト制限に達しました',
    level: 'warning',
    category: 'api',
    action: '一定時間後にリトライ',
    recoverable: true,
  },
  // 必要に応じて他のエラーコードの情報も追加
} as const

// ==============================================
// TypeScript型定義
// ==============================================
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
export type ErrorCategory = keyof typeof ERROR_CATEGORIES
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical'

export interface ErrorInfo {
  message: string
  level: ErrorLevel
  category: ErrorCategory
  action: string
  recoverable: boolean
}

// ==============================================
// ヘルパー関数
// ==============================================

/**
 * エラーコードからカテゴリを取得
 */
export function getErrorCategory(code: ErrorCode): ErrorCategory {
  if (code >= 1000 && code < 2000) return 'auth'
  if (code >= 2000 && code < 3000) return 'api'
  if (code >= 3000 && code < 4000) return 'data'
  if (code >= 4000 && code < 5000) return 'ui'
  if (code >= 5000 && code < 6000) return 'system'
  if (code >= 6000 && code < 7000) return 'business'
  if (code >= 7000 && code < 8000) return 'external'
  return 'system' // デフォルト
}

/**
 * エラーコードから重要度を判定
 */
export function getErrorSeverity(code: ErrorCode): ErrorLevel {
  const category = getErrorCategory(code)

  // カテゴリ別のデフォルト重要度
  switch (category) {
    case 'auth':
      return 'error'
    case 'system':
      return 'critical'
    case 'data':
      return 'error'
    case 'api':
      return 'warning'
    case 'ui':
      return 'warning'
    case 'business':
      return 'error'
    case 'external':
      return 'warning'
    default:
      return 'error'
  }
}

/**
 * エラーコード名を取得（デバッグ用）
 */
export function getErrorCodeName(code: ErrorCode): string {
  const entry = Object.entries(ERROR_CODES).find(([, value]) => value === code)
  return entry ? entry[0] : `UNKNOWN_ERROR_${code}`
}
