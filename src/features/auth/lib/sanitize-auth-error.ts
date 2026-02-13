/**
 * Auth エラーメッセージのサニタイズ
 *
 * OWASP ユーザー列挙防止:
 * Supabase の生エラーメッセージには「User already registered」「Email not confirmed」等、
 * アカウントの存在を推測できる情報が含まれる。
 * このユーティリティは全エラーを安全な i18n キーにマッピングする。
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

type AuthContext = 'login' | 'signup' | 'resetPassword' | 'updatePassword' | 'oauth';

/**
 * Supabase の AuthError メッセージを安全な i18n キーに変換
 *
 * 原則:
 * - login: 常に「メールアドレスまたはパスワードが正しくありません」を返す
 * - signup: ユーザーの存在を漏洩しない汎用メッセージを返す
 * - resetPassword: 常に成功メッセージ（Supabase 側で処理済み）
 */
export function getAuthErrorKey(errorMessage: string, context: AuthContext): string {
  const normalizedMessage = errorMessage.toLowerCase();

  // ログイン: 具体的な理由を開示しない（OWASP準拠）
  if (context === 'login') {
    // レート制限系は具体的に伝えてOK（攻撃者にも知らせるべき）
    if (
      normalizedMessage.includes('rate limit') ||
      normalizedMessage.includes('too many requests')
    ) {
      return 'auth.errors.accountLocked';
    }
    // それ以外は全て「メールアドレスまたはパスワードが正しくありません」
    return 'auth.errors.invalidCredentials';
  }

  // サインアップ: ユーザーの存在を漏洩しない
  if (context === 'signup') {
    if (
      normalizedMessage.includes('already registered') ||
      normalizedMessage.includes('already exists') ||
      normalizedMessage.includes('duplicate')
    ) {
      // 「アカウントが既に存在します」とは言わない
      return 'auth.errors.unexpectedError';
    }
    if (normalizedMessage.includes('password') && normalizedMessage.includes('weak')) {
      return 'auth.errors.weakPassword';
    }
    return 'auth.errors.unexpectedError';
  }

  // パスワード更新
  if (context === 'updatePassword') {
    if (normalizedMessage.includes('weak') || normalizedMessage.includes('short')) {
      return 'auth.errors.weakPassword';
    }
    return 'auth.errors.unexpectedError';
  }

  // OAuth, resetPassword, その他
  return 'auth.errors.unexpectedError';
}
