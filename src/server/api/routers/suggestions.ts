/**
 * Suggestions Router
 *
 * 最近のエントリからタイトル+タグのサジェストを提供
 */

import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { handleServiceError } from '@/server/services/errors';
import { createSuggestionService } from '@/server/services/suggestions';

export const suggestionsRouter = createTRPCRouter({
  /**
   * 最近のユニークなタイトル+タグ組み合わせを取得
   */
  recentTitles: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          limit: z.number().min(1).max(30).default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createSuggestionService(supabase);

      try {
        return await service.recentTitles({
          userId,
          ...input,
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),
});
