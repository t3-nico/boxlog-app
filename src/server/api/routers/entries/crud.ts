/**
 * Entries CRUD Subrouter
 *
 * Core entry operations: list, getById, create, update, delete
 *
 * @description
 * このルーターはサービス層（EntryService）を使用してビジネスロジックを実行します。
 * ルーターの責務は入力バリデーションとエラーハンドリングのみです。
 */

import { z } from 'zod';

import {
  createEntrySchema,
  entryFilterSchema,
  entryIdSchema,
  getEntryByIdSchema,
  updateEntrySchema,
} from '@/schemas/entries';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createEntryService } from '@/server/services/entries';
import { handleServiceError } from '@/server/services/errors';

export const entriesCrudRouter = createTRPCRouter({
  /**
   * エントリ一覧取得
   */
  list: protectedProcedure.input(entryFilterSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createEntryService(supabase);

    try {
      return await service.list({
        userId,
        ...input,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * エントリをIDで取得
   */
  getById: protectedProcedure.input(getEntryByIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createEntryService(supabase);

    try {
      const options: Parameters<typeof service.getById>[0] = {
        userId,
        entryId: input.id,
      };
      if (input.include?.tags !== undefined) options.includeTags = input.include.tags;

      return await service.getById(options);
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * エントリ作成
   */
  create: protectedProcedure.input(createEntrySchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createEntryService(supabase);

    try {
      return await service.create({
        userId,
        input,
        preventOverlappingEntries: true,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * エントリ更新
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateEntrySchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createEntryService(supabase);

      try {
        return await service.update({
          userId,
          entryId: input.id,
          input: input.data,
          preventOverlappingEntries: true,
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * エントリ削除
   */
  delete: protectedProcedure.input(entryIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createEntryService(supabase);

    try {
      return await service.delete({
        userId,
        entryId: input.id,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),
});
