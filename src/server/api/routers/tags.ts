/**
 * Tags tRPC Router
 *
 * タグ管理のtRPCエンドポイント
 * REST API（src/app/api/tags/route.ts）をtRPC化
 *
 * エンドポイント:
 * - tags.list: タグ一覧取得（フラット）
 * - tags.listHierarchy: 階層構造でタグ取得
 * - tags.listParentTags: 親タグ一覧取得
 * - tags.getById: タグID指定で取得
 * - tags.create: タグ作成
 * - tags.update: タグ更新
 * - tags.merge: タグマージ
 * - tags.delete: タグ削除
 * - tags.reorder: タグ並び替え（sort_order, parent_id更新）
 */

import { z } from 'zod';

import { invalidateUserTagsCache } from '@/lib/cache';
import { handleServiceError } from '@/server/services/errors';
import { createTagService } from '@/server/services/tags/tag-service';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * Tags Router
 */
export const tagsRouter = createTRPCRouter({
  /**
   * タグ一覧取得
   */
  list: protectedProcedure
    .input(
      z
        .object({
          sortField: z.enum(['name', 'created_at', 'updated_at', 'tag_number']).default('name'),
          sortOrder: z.enum(['asc', 'desc']).default('asc'),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        const tags = await service.list({
          userId: ctx.userId!,
          sortField: input?.sortField,
          sortOrder: input?.sortOrder,
        });

        return {
          data: tags,
          count: tags.length,
        };
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * 階層構造でタグ取得
   * 親タグとその子タグをネスト構造で返す
   */
  listHierarchy: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = createTagService(ctx.supabase);
      return await service.listHierarchy({
        userId: ctx.userId!,
      });
    } catch (error) {
      return handleServiceError(error);
    }
  }),

  /**
   * 親タグ一覧取得（ドロップダウン用）
   * parent_id = null のタグのみ
   */
  listParentTags: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = createTagService(ctx.supabase);
      const tags = await service.listParentTags({
        userId: ctx.userId!,
      });
      return {
        data: tags,
        count: tags.length,
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }),

  /**
   * タグID指定で取得
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        const tag = await service.getById({
          userId: ctx.userId!,
          tagId: input.id,
        });

        return tag;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タグ作成
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        description: z.string().optional(),
        /** 親タグID */
        parentId: z.string().uuid().nullable().optional(),
        /** @deprecated use parentId instead */
        groupId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        // parentId を優先、後方互換のため groupId もサポート
        const parentId = input.parentId ?? input.groupId;
        const tag = await service.create({
          userId: ctx.userId!,
          input: {
            name: input.name,
            color: input.color,
            description: input.description,
            parentId,
          },
        });

        // サーバーサイドキャッシュを無効化（次のリクエストで最新データ取得）
        await invalidateUserTagsCache(ctx.userId!);

        return tag;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タグ更新
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(50).optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        description: z.string().nullable().optional(),
        /** 親タグID */
        parentId: z.string().uuid().nullable().optional(),
        /** @deprecated use parentId instead */
        groupId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        // parentId を優先、後方互換のため groupId もサポート
        const parentId = input.parentId !== undefined ? input.parentId : input.groupId;
        const tag = await service.update({
          userId: ctx.userId!,
          tagId: input.id,
          updates: {
            name: input.name,
            color: input.color,
            description: input.description,
            parentId,
          },
        });

        // サーバーサイドキャッシュを無効化
        await invalidateUserTagsCache(ctx.userId!);

        return tag;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タグマージ
   *
   * ソースタグの関連付けをターゲットタグに移行し、
   * オプションでソースタグを削除します。
   */
  merge: protectedProcedure
    .input(
      z.object({
        sourceTagId: z.string().uuid(),
        targetTagId: z.string().uuid(),
        mergeAssociations: z.boolean().default(true),
        deleteSource: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        const result = await service.merge({
          userId: ctx.userId!,
          sourceTagId: input.sourceTagId,
          targetTagId: input.targetTagId,
          mergeAssociations: input.mergeAssociations,
          deleteSource: input.deleteSource,
        });

        // サーバーサイドキャッシュを無効化
        await invalidateUserTagsCache(ctx.userId!);

        return result;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タグ削除
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        const deletedTag = await service.delete({
          userId: ctx.userId!,
          tagId: input.id,
        });

        // サーバーサイドキャッシュを無効化
        await invalidateUserTagsCache(ctx.userId!);

        return deletedTag;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タグ並び替え（バッチ更新）
   */
  reorder: protectedProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            id: z.string().uuid(),
            sort_order: z.number().int(),
            parent_id: z.string().uuid().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase);
        const result = await service.reorder({
          userId: ctx.userId!,
          updates: input.updates,
        });

        // サーバーサイドキャッシュを無効化
        await invalidateUserTagsCache(ctx.userId!);

        return result;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * タグ使用統計取得
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = createTagService(ctx.supabase);
      const stats = await service.getStats({
        userId: ctx.userId!,
      });

      return {
        data: stats,
        count: stats.length,
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }),
});
