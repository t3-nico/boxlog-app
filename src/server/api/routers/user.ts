/**
 * User tRPC Router
 *
 * ユーザー管理のtRPCエンドポイント
 * REST API（src/app/api/user/*）をtRPC化
 *
 * エンドポイント:
 * - user.deleteAccount: アカウント即時削除
 * - user.exportData: ユーザーデータエクスポート
 */

import { z } from 'zod';

import { handleServiceError } from '@/server/services/errors';
import { createUserService, UserServiceError } from '@/server/services/user/user-service';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * User Router
 */
export const userRouter = createTRPCRouter({
  /**
   * アカウント即時削除
   * auth.users 削除 → CASCADE DELETE で全データ削除
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
