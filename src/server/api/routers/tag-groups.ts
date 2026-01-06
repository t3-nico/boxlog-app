/**
 * Tag Groups tRPC Router
 *
 * タググループ管理のtRPCエンドポイント
 * REST API（src/app/api/tag-groups/route.ts）をtRPC化
 *
 * エンドポイント:
 * - tagGroups.list: タググループ一覧取得
 * - tagGroups.getById: グループID指定で取得
 * - tagGroups.create: グループ作成
 * - tagGroups.update: グループ更新
 * - tagGroups.delete: グループ削除
 * - tagGroups.reorder: グループ並び順一括更新
 */

import { z } from 'zod';

import { handleServiceError } from '@/server/services/errors';
import { createTagGroupService } from '@/server/services/tag-groups/tag-group-service';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * Tag Groups Router
 */
export const tagGroupsRouter = createTRPCRouter({
  /**
   * タググループ一覧取得
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = createTagGroupService(ctx.supabase);
      const tagGroups = await service.list({
        userId: ctx.userId!,
      });

      return {
        data: tagGroups,
        count: tagGroups.length,
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }),

  /**
   * タググループID指定で取得
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        withTags: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = createTagGroupService(ctx.supabase);
        const tagGroup = await service.getById({
          userId: ctx.userId!,
          groupId: input.id,
          withTags: input.withTags,
        });

        return tagGroup;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タググループ作成
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        slug: z.string().optional(),
        description: z.string().nullable().optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .nullable()
          .optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagGroupService(ctx.supabase);
        const tagGroup = await service.create({
          userId: ctx.userId!,
          input: {
            name: input.name,
            slug: input.slug,
            description: input.description,
            color: input.color,
            sortOrder: input.sortOrder,
          },
        });

        return tagGroup;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タググループ更新
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(50).optional(),
        description: z.string().nullable().optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .nullable()
          .optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagGroupService(ctx.supabase);
        const tagGroup = await service.update({
          userId: ctx.userId!,
          groupId: input.id,
          updates: {
            name: input.name,
            description: input.description,
            color: input.color,
            sortOrder: input.sortOrder,
          },
        });

        return tagGroup;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タググループ削除
   * グループ内のタグのgroup_idはNULLになる
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagGroupService(ctx.supabase);
        await service.delete({
          userId: ctx.userId!,
          groupId: input.id,
        });

        return { success: true };
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タググループの並び順を一括更新
   */
  reorder: protectedProcedure
    .input(
      z.object({
        groupIds: z.array(z.string().uuid()).min(1, 'At least one group ID is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagGroupService(ctx.supabase);
        const updatedGroups = await service.reorder({
          userId: ctx.userId!,
          groupIds: input.groupIds,
        });

        return {
          data: updatedGroups,
          count: updatedGroups.length,
        };
      } catch (error) {
        return handleServiceError(error);
      }
    }),
});
