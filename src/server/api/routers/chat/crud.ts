/**
 * Chat CRUD Router
 *
 * AIチャット会話のCRUD操作を提供するtRPCルーター。
 */

import {
  conversationIdSchema,
  createConversationSchema,
  listConversationsSchema,
  updateConversationSchema,
} from '@/schemas/chat';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createChatService } from '@/server/services/chat';
import { handleServiceError } from '@/server/services/errors';

import type { UIMessage } from 'ai';

export const chatCrudRouter = createTRPCRouter({
  /** 会話一覧取得（サマリーのみ） */
  list: protectedProcedure.input(listConversationsSchema).query(async ({ ctx, input }) => {
    const service = createChatService(ctx.supabase);
    try {
      return await service.list({
        userId: ctx.userId,
        ...input,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /** 会話詳細取得（メッセージ付き） */
  getById: protectedProcedure.input(conversationIdSchema).query(async ({ ctx, input }) => {
    const service = createChatService(ctx.supabase);
    try {
      return await service.getById({
        userId: ctx.userId,
        conversationId: input.conversationId,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /** 最新の会話を取得 */
  getMostRecent: protectedProcedure.query(async ({ ctx }) => {
    const service = createChatService(ctx.supabase);
    try {
      return await service.getMostRecent(ctx.userId);
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /** 会話作成 */
  create: protectedProcedure.input(createConversationSchema).mutation(async ({ ctx, input }) => {
    const service = createChatService(ctx.supabase);
    try {
      return await service.create({
        userId: ctx.userId,
        input: {
          title: input.title,
          messages: input.messages as unknown as UIMessage[],
        },
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /** 会話メッセージ保存 */
  save: protectedProcedure.input(updateConversationSchema).mutation(async ({ ctx, input }) => {
    const service = createChatService(ctx.supabase);
    try {
      return await service.update({
        userId: ctx.userId,
        conversationId: input.conversationId,
        title: input.title,
        messages: input.messages as unknown as UIMessage[],
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /** 会話削除 */
  delete: protectedProcedure.input(conversationIdSchema).mutation(async ({ ctx, input }) => {
    const service = createChatService(ctx.supabase);
    try {
      return await service.delete({
        userId: ctx.userId,
        conversationId: input.conversationId,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),
});
