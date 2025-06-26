// 認証設定の定数
export const AUTH_CONFIG = {
  // パスワード設定
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  
  // セッション設定
  SESSION: {
    TIMEOUT: 3600, // 1時間（秒）
    REFRESH_THRESHOLD: 300, // 5分前にリフレッシュ
  },
  
  // レート制限
  RATE_LIMIT: {
    SIGN_UP: 5, // 1時間あたり5回
    SIGN_IN: 10, // 1時間あたり10回
    PASSWORD_RESET: 3, // 1時間あたり3回
  },
  
  // リダイレクトURL
  REDIRECT_URLS: {
    SIGN_IN: '/calender',
    SIGN_UP: '/calender',
    SIGN_OUT: '/auth',
    PASSWORD_RESET: '/auth/reset-password',
  },
  
  // エラーメッセージ
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
    EMAIL_NOT_CONFIRMED: 'メールアドレスの確認が必要です',
    USER_ALREADY_EXISTS: 'このメールアドレスは既に登録されています',
    WEAK_PASSWORD: 'パスワードが弱すぎます',
    TOO_MANY_REQUESTS: 'リクエストが多すぎます。しばらく待ってから再試行してください',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    UNKNOWN_ERROR: '予期しないエラーが発生しました',
  },
  
  // 成功メッセージ
  SUCCESS_MESSAGES: {
    SIGN_UP: 'アカウントが正常に作成されました。確認メールをチェックしてください。',
    SIGN_IN: 'ログインに成功しました',
    PASSWORD_RESET_SENT: 'パスワードリセットメールを送信しました',
    PASSWORD_UPDATED: 'パスワードが正常に更新されました',
    SIGN_OUT: 'ログアウトしました',
  },
} as const

// パスワード強度チェック関数
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < AUTH_CONFIG.PASSWORD.MIN_LENGTH) {
    errors.push(`パスワードは${AUTH_CONFIG.PASSWORD.MIN_LENGTH}文字以上で入力してください`)
  }
  
  if (AUTH_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('大文字を含めてください')
  }
  
  if (AUTH_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('小文字を含めてください')
  }
  
  if (AUTH_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('数字を含めてください')
  }
  
  if (AUTH_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('特殊文字を含めてください')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// メールアドレス検証関数
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// セッション有効期限チェック関数
export function isSessionExpiringSoon(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = expiresAt - now
  return timeUntilExpiry <= AUTH_CONFIG.SESSION.REFRESH_THRESHOLD
} 