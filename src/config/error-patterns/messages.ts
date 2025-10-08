/**
 * ユーザー向けエラーメッセージ統一システム
 * 技術的な詳細を隠し、ユーザーにとって分かりやすく、行動指向のメッセージを提供
 */

import { ERROR_CODES, ErrorCode, getErrorCategory, type SeverityLevel } from './categories'

/**
 * ユーザー向けメッセージの構造
 */
export interface UserMessage {
  title: string // 短いタイトル（例：「認証エラー」）
  description: string // 詳細説明（ユーザー理解用）
  action?: string // 推奨アクション（例：「再度ログインしてください」）
  severity: SeverityLevel // 重要度レベル
  icon?: string // アイコン名（UI表示用）
  autoRetry?: boolean // 自動リトライ可能か
  supportContact?: boolean // サポート連絡が必要か
}

/**
 * 認証・認可エラーメッセージ (1xxx)
 */
const AUTH_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.INVALID_TOKEN]: {
    title: 'ログインが必要です',
    description: 'セッションが無効です。再度ログインしてください。',
    action: 'ログインページに移動してください',
    severity: 'high',
    icon: 'lock',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.EXPIRED_TOKEN]: {
    title: 'セッションが期限切れです',
    description: 'ログインセッションの有効期限が切れました。',
    action: '再度ログインしてください',
    severity: 'medium',
    icon: 'clock',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.NO_PERMISSION]: {
    title: 'アクセス権限がありません',
    description: 'この操作を実行する権限がありません。',
    action: '管理者にお問い合わせください',
    severity: 'high',
    icon: 'shield-x',
    autoRetry: false,
    supportContact: true,
  },
  [ERROR_CODES.INVALID_CREDENTIALS]: {
    title: 'ログイン情報が正しくありません',
    description: 'メールアドレスまたはパスワードが間違っています。',
    action: '正しい情報を入力してください',
    severity: 'medium',
    icon: 'key',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.ACCOUNT_LOCKED]: {
    title: 'アカウントがロックされています',
    description: 'セキュリティのためアカウントが一時的にロックされました。',
    action: '時間をおいて再試行するか、サポートにご連絡ください',
    severity: 'high',
    icon: 'lock',
    autoRetry: false,
    supportContact: true,
  },
  [ERROR_CODES.SESSION_EXPIRED]: {
    title: 'セッションが期限切れです',
    description: '長時間操作がなかったため、セッションが切れました。',
    action: '再度ログインしてください',
    severity: 'medium',
    icon: 'clock',
    autoRetry: false,
    supportContact: false,
  },
}

/**
 * バリデーションエラーメッセージ (2xxx)
 */
const VALIDATION_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.REQUIRED_FIELD]: {
    title: '必須項目が入力されていません',
    description: '必要な情報がすべて入力されていません。',
    action: '赤枠の項目を入力してください',
    severity: 'medium',
    icon: 'alert-circle',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.INVALID_FORMAT]: {
    title: '入力形式が正しくありません',
    description: '指定された形式で入力してください。',
    action: '入力例を参考に修正してください',
    severity: 'medium',
    icon: 'edit',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.INVALID_EMAIL]: {
    title: 'メールアドレスの形式が正しくありません',
    description: '有効なメールアドレスを入力してください。',
    action: '例：user@example.com',
    severity: 'medium',
    icon: 'mail',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.PASSWORD_TOO_WEAK]: {
    title: 'パスワードが安全ではありません',
    description: 'より強固なパスワードを設定してください。',
    action: '8文字以上で、英数字と記号を組み合わせてください',
    severity: 'medium',
    icon: 'shield',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.FILE_TOO_LARGE]: {
    title: 'ファイルサイズが大きすぎます',
    description: 'アップロードするファイルが制限サイズを超えています。',
    action: 'より小さなファイルを選択してください',
    severity: 'medium',
    icon: 'file',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.DUPLICATE_VALUE]: {
    title: 'すでに使用されている値です',
    description: 'この値は既に他の場所で使用されています。',
    action: '別の値を入力してください',
    severity: 'medium',
    icon: 'copy',
    autoRetry: false,
    supportContact: false,
  },
}

/**
 * データベースエラーメッセージ (3xxx)
 */
const DB_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.CONNECTION_FAILED]: {
    title: 'データベース接続エラー',
    description: 'データベースに接続できませんでした。',
    action: 'しばらく待ってから再試行してください',
    severity: 'critical',
    icon: 'database',
    autoRetry: true,
    supportContact: true,
  },
  [ERROR_CODES.QUERY_TIMEOUT]: {
    title: '処理がタイムアウトしました',
    description: 'データベースの処理に時間がかかりすぎています。',
    action: 'しばらく待ってから再試行してください',
    severity: 'high',
    icon: 'clock',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.NOT_FOUND]: {
    title: 'データが見つかりません',
    description: '指定されたデータが存在しません。',
    action: '条件を確認して再検索してください',
    severity: 'medium',
    icon: 'search',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.DUPLICATE_KEY]: {
    title: '重複データエラー',
    description: '同じデータが既に存在します。',
    action: '異なる値で再試行してください',
    severity: 'medium',
    icon: 'copy',
    autoRetry: false,
    supportContact: false,
  },
}

/**
 * ビジネスロジックエラーメッセージ (4xxx)
 */
const BIZ_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.INSUFFICIENT_BALANCE]: {
    title: '残高が不足しています',
    description: '操作を完了するのに十分な残高がありません。',
    action: 'チャージするか、より少ない金額で試してください',
    severity: 'medium',
    icon: 'credit-card',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.INVALID_OPERATION]: {
    title: '無効な操作です',
    description: 'この操作は現在実行できません。',
    action: '条件を確認してください',
    severity: 'medium',
    icon: 'x-circle',
    autoRetry: false,
    supportContact: false,
  },
  [ERROR_CODES.RESOURCE_UNAVAILABLE]: {
    title: 'リソースが利用できません',
    description: '要求されたリソースは現在利用できません。',
    action: 'しばらく待ってから再試行してください',
    severity: 'medium',
    icon: 'server',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.QUOTA_EXCEEDED]: {
    title: '利用制限に達しました',
    description: '月間の利用制限に達しています。',
    action: '来月まで待つか、プランをアップグレードしてください',
    severity: 'high',
    icon: 'trending-up',
    autoRetry: false,
    supportContact: false,
  },
}

/**
 * 外部サービス連携エラーメッセージ (5xxx)
 */
const EXTERNAL_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.API_UNAVAILABLE]: {
    title: '外部サービスが利用できません',
    description: '連携しているサービスが一時的に利用できません。',
    action: 'しばらく待ってから再試行してください',
    severity: 'high',
    icon: 'globe',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.API_TIMEOUT]: {
    title: '外部サービスとの通信がタイムアウトしました',
    description: '外部サービスとの通信に時間がかかりすぎています。',
    action: 'しばらく待ってから再試行してください',
    severity: 'medium',
    icon: 'clock',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.PAYMENT_FAILED]: {
    title: '決済に失敗しました',
    description: '決済処理でエラーが発生しました。',
    action: 'カード情報を確認するか、別の決済方法をお試しください',
    severity: 'high',
    icon: 'credit-card',
    autoRetry: false,
    supportContact: true,
  },
  [ERROR_CODES.EMAIL_SEND_FAILED]: {
    title: 'メール送信に失敗しました',
    description: 'メールを送信できませんでした。',
    action: 'メールアドレスを確認してから再試行してください',
    severity: 'medium',
    icon: 'mail',
    autoRetry: true,
    supportContact: false,
  },
}

/**
 * システム・インフラエラーメッセージ (6xxx)
 */
const SYSTEM_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    title: 'システムエラーが発生しました',
    description: 'サーバー内部でエラーが発生しました。',
    action: 'しばらく待ってから再試行してください',
    severity: 'critical',
    icon: 'server',
    autoRetry: true,
    supportContact: true,
  },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    title: 'サービスが一時的に利用できません',
    description: 'メンテナンスまたは一時的な障害が発生しています。',
    action: 'しばらく待ってから再試行してください',
    severity: 'critical',
    icon: 'server',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    title: 'ネットワークエラーが発生しました',
    description: 'ネットワーク接続に問題があります。',
    action: 'インターネット接続を確認してください',
    severity: 'high',
    icon: 'wifi',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.UNEXPECTED_ERROR]: {
    title: '予期しないエラーが発生しました',
    description: '想定外のエラーが発生しました。',
    action: 'ページを再読み込みしてから再試行してください',
    severity: 'high',
    icon: 'alert-triangle',
    autoRetry: false,
    supportContact: true,
  },
}

/**
 * レート制限エラーメッセージ (7xxx)
 */
const RATE_MESSAGES: Record<number, UserMessage> = {
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
    title: 'リクエスト制限に達しました',
    description: '短時間に多くのリクエストが送信されました。',
    action: 'しばらく待ってから再試行してください',
    severity: 'low',
    icon: 'clock',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.REQUEST_TOO_FREQUENT]: {
    title: 'リクエストが頻繁すぎます',
    description: 'リクエストの頻度が高すぎます。',
    action: '少し時間をおいてから再試行してください',
    severity: 'low',
    icon: 'pause',
    autoRetry: true,
    supportContact: false,
  },
  [ERROR_CODES.DAILY_LIMIT_EXCEEDED]: {
    title: '1日の利用制限に達しました',
    description: '本日の利用制限に達しました。',
    action: '明日になってから再試行してください',
    severity: 'medium',
    icon: 'calendar',
    autoRetry: false,
    supportContact: false,
  },
}

/**
 * 全メッセージの統合
 */
const ALL_MESSAGES = {
  ...AUTH_MESSAGES,
  ...VALIDATION_MESSAGES,
  ...DB_MESSAGES,
  ...BIZ_MESSAGES,
  ...EXTERNAL_MESSAGES,
  ...SYSTEM_MESSAGES,
  ...RATE_MESSAGES,
}

/**
 * エラーコードからユーザー向けメッセージを取得
 */
export function getUserMessage(errorCode: ErrorCode): UserMessage {
  const message = ALL_MESSAGES[errorCode]
  if (!message) {
    // フォールバック用の汎用メッセージ
    const category = getErrorCategory(errorCode)
    return {
      title: 'エラーが発生しました',
      description: `${category}関連のエラーが発生しました。`,
      action: 'しばらく待ってから再試行してください',
      severity: 'medium',
      icon: 'alert-circle',
      autoRetry: true,
      supportContact: true,
    }
  }
  return message
}

/**
 * 重要度別のスタイル設定
 */
// Note: これらのスタイルは実際の使用時に @/config/theme のカラーで置き換えてください
export const SEVERITY_STYLES = {
  low: {
    severity: 'low',
    category: 'info',
  },
  medium: {
    severity: 'medium',
    category: 'warning',
  },
  high: {
    severity: 'high',
    category: 'error',
  },
  critical: {
    severity: 'critical',
    category: 'critical',
  },
} as const

/**
 * カテゴリ別のデフォルトアクション
 */
export const CATEGORY_DEFAULT_ACTIONS = {
  AUTH: 'ログインページに移動してください',
  VALIDATION: '入力内容を確認してください',
  DB: 'しばらく待ってから再試行してください',
  BIZ: '条件を確認してください',
  EXTERNAL: 'しばらく待ってから再試行してください',
  SYSTEM: 'ページを再読み込みしてください',
  RATE: 'しばらく待ってから再試行してください',
} as const
