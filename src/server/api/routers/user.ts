/**
 * User tRPC Router
 *
 * ユーザー管理のtRPCエンドポイント
 * REST API（src/app/api/user/*）をtRPC化
 *
 * エンドポイント:
 * - user.deleteAccount: アカウント削除リクエスト（論理削除）
 * - user.exportData: ユーザーデータエクスポート
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createUserService, UserServiceError } from '@/server/services/user/user-service';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * エラーハンドリングヘルパー
 */
function handleServiceError(error: unknown): never {
  if (error instanceof UserServiceError) {
    const codeMap: Record<
      UserServiceError['code'],
      'BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_SERVER_ERROR'
    > = {
      DELETE_FAILED: 'INTERNAL_SERVER_ERROR',
      EXPORT_FAILED: 'INTERNAL_SERVER_ERROR',
      UNAUTHORIZED: 'UNAUTHORIZED',
      INVALID_PASSWORD: 'UNAUTHORIZED',
      INVALID_INPUT: 'BAD_REQUEST',
    };

    throw new TRPCError({
      code: codeMap[error.code],
      message: error.message,
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}

/**
 * User Router
 */
export const userRouter = createTRPCRouter({
  /**
   * アカウント削除リクエスト（論理削除）
   * GDPR "Right to be Forgotten" 準拠
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z.string().min(1),
        confirmText: z.literal('DELETE'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // ユーザー情報取得
        const {
          data: { user },
          error: authError,
        } = await ctx.supabase.auth.getUser();

        if (authError || !user || !user.email) {
          throw new UserServiceError('UNAUTHORIZED', 'Authentication required');
        }

        const service = createUserService(ctx.supabase);
        const result = await service.deleteAccount({
          userId: ctx.userId!,
          userEmail: user.email,
          password: input.password,
          confirmText: input.confirmText,
        });

        return result;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * ユーザーデータエクスポート
   * GDPR "Right to Data Portability" 準拠
   */
  exportData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = createUserService(ctx.supabase);
      const result = await service.exportData({
        userId: ctx.userId!,
      });

      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }),
});
