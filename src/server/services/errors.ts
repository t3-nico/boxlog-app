/**
 * サービス層の共通エラーハンドリング
 *
 * すべてのサービスエラーをTRPCエラーに変換するための統一ヘルパー
 */

import { TRPCError } from '@trpc/server'

/**
 * サービスエラーの基底クラス
 *
 * 各サービス（PlanService, NotificationService等）はこのクラスを継承して
 * 独自のエラークラスを作成する
 */
export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

/**
 * エラーコードとTRPCエラーコードのマッピング
 */
const ERROR_CODE_MAP: Record<
  string,
  'INTERNAL_SERVER_ERROR' | 'NOT_FOUND' | 'BAD_REQUEST' | 'FORBIDDEN' | 'UNAUTHORIZED'
> = {
  // 共通エラー
  FETCH_FAILED: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CREATE_FAILED: 'INTERNAL_SERVER_ERROR',
  UPDATE_FAILED: 'INTERNAL_SERVER_ERROR',
  DELETE_FAILED: 'INTERNAL_SERVER_ERROR',
  VALIDATION_FAILED: 'BAD_REQUEST',

  // 認証・認可エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // ドメイン固有エラー
  TAG_FILTER_FAILED: 'INTERNAL_SERVER_ERROR',
  NOTIFICATION_SEND_FAILED: 'INTERNAL_SERVER_ERROR',
  PROFILE_UPDATE_FAILED: 'INTERNAL_SERVER_ERROR',
}

/**
 * サービスエラーをTRPCエラーに変換
 *
 * @param error - キャッチしたエラー
 * @throws TRPCError - 常にスローされる（戻り値はnever）
 *
 * @example
 * ```typescript
 * try {
 *   return await service.list({ userId })
 * } catch (error) {
 *   handleServiceError(error)
 * }
 * ```
 */
export function handleServiceError(error: unknown): never {
  // ServiceError（またはその派生クラス）の場合
  if (error instanceof ServiceError) {
    const trpcCode = ERROR_CODE_MAP[error.code] ?? 'INTERNAL_SERVER_ERROR'

    throw new TRPCError({
      code: trpcCode,
      message: error.message,
      cause: error,
    })
  }

  // TRPCError の場合はそのまま再スロー
  if (error instanceof TRPCError) {
    throw error
  }

  // その他のエラー
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    cause: error,
  })
}

/**
 * カスタムエラーコードを追加する場合のヘルパー
 *
 * @param code - 新しいエラーコード
 * @param trpcCode - 対応するTRPCエラーコード
 */
export function registerErrorCode(
  code: string,
  trpcCode: 'INTERNAL_SERVER_ERROR' | 'NOT_FOUND' | 'BAD_REQUEST' | 'FORBIDDEN' | 'UNAUTHORIZED'
): void {
  ERROR_CODE_MAP[code] = trpcCode
}
