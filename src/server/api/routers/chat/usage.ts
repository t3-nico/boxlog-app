/**
 * Chat Usage Router
 *
 * AI無料枠の利用状況を取得するtRPCルーター。
 */

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createAIUsageService } from '@/server/services/ai';
import { handleServiceError } from '@/server/services/errors';

export const chatUsageRouter = createTRPCRouter({
  /** 今月の無料枠利用状況を取得 */
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const service = createAIUsageService(ctx.supabase);
    try {
      return await service.getUsage(ctx.userId);
    } catch (error) {
      handleServiceError(error);
    }
  }),
});
