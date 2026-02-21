/**
 * Templates tRPC Router
 *
 * プランテンプレート管理のtRPCエンドポイント
 *
 * エンドポイント:
 * - templates.list: テンプレート一覧取得
 * - templates.getById: テンプレートID指定で取得
 * - templates.create: テンプレート作成
 * - templates.update: テンプレート更新
 * - templates.delete: テンプレート削除
 * - templates.incrementUseCount: 使用回数インクリメント
 */

import { z } from 'zod';

import { handleServiceError } from '@/server/services/errors';
import { createTemplateService } from '@/server/services/templates/template-service';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * Templates Router
 */
export const templatesRouter = createTRPCRouter({
  /**
   * テンプレート一覧取得
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = createTemplateService(ctx.supabase);
      const templates = await service.list({
        userId: ctx.userId!,
      });

      return {
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }),

  /**
   * テンプレートID指定で取得
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = createTemplateService(ctx.supabase);
        return await service.getById({
          userId: ctx.userId!,
          templateId: input.id,
        });
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * テンプレート作成
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().nullable().optional(),
        title_pattern: z.string().min(1).max(200),
        plan_description: z.string().nullable().optional(),
        duration_minutes: z.number().int().positive().nullable().optional(),
        reminder_minutes: z.number().int().min(0).nullable().optional(),
        tag_ids: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTemplateService(ctx.supabase);
        return await service.create({
          userId: ctx.userId!,
          input: {
            name: input.name,
            description: input.description,
            title_pattern: input.title_pattern,
            plan_description: input.plan_description,
            duration_minutes: input.duration_minutes,
            reminder_minutes: input.reminder_minutes,
            tag_ids: input.tag_ids,
          },
        });
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * テンプレート更新
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().nullable().optional(),
        title_pattern: z.string().min(1).max(200).optional(),
        plan_description: z.string().nullable().optional(),
        duration_minutes: z.number().int().positive().nullable().optional(),
        reminder_minutes: z.number().int().min(0).nullable().optional(),
        tag_ids: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTemplateService(ctx.supabase);
        return await service.update({
          userId: ctx.userId!,
          templateId: input.id,
          updates: {
            name: input.name,
            description: input.description,
            title_pattern: input.title_pattern,
            plan_description: input.plan_description,
            duration_minutes: input.duration_minutes,
            reminder_minutes: input.reminder_minutes,
            tag_ids: input.tag_ids,
          },
        });
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * テンプレート削除
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTemplateService(ctx.supabase);
        return await service.delete({
          userId: ctx.userId!,
          templateId: input.id,
        });
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * 使用回数インクリメント
   */
  incrementUseCount: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTemplateService(ctx.supabase);
        return await service.incrementUseCount({
          userId: ctx.userId!,
          templateId: input.id,
        });
      } catch (error) {
        return handleServiceError(error);
      }
    }),
});
