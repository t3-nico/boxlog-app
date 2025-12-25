/**
 * 不明なエラーからメッセージを抽出するヘルパー
 *
 * catch ブロックで受け取る unknown 型のエラーを安全に文字列に変換
 *
 * @example
 * try {
 *   await someAsyncOperation()
 * } catch (error) {
 *   const message = getErrorMessage(error)
 *   toast.error(message)
 * }
 */
export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
}

/**
 * エラーオブジェクトを正規化
 *
 * 不明な型のエラーを Error インスタンスに変換
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error));
}

/**
 * API レスポンス用のエラーメッセージ取得
 *
 * 内部エラーの詳細を隠蔽し、ユーザー向けメッセージを返す
 */
export function getApiErrorMessage(error: unknown, fallback = 'Internal server error'): string {
  // 開発環境では詳細を返す
  if (process.env.NODE_ENV === 'development') {
    return getErrorMessage(error, fallback);
  }
  // 本番環境では汎用メッセージ
  return fallback;
}
