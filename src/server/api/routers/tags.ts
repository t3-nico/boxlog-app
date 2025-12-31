/**
 * Tags tRPC Router
 *
 * タグ管理のtRPCエンドポイント
 * REST API（src/app/api/tags/route.ts）をtRPC化
 *
 * エンドポイント:
 * - tags.list: タグ一覧取得
 * - tags.getById: タグID指定で取得
 * - tags.create: タグ作成
 * - tags.update: タグ更新
 * - tags.merge: タグマージ
 * - tags.delete: タグ削除
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  createTagService,
  TagServiceError,
  type CreateTagInput,
  type UpdateTagInput,
} from '@/server/services/tags/tag-service'

/**
 * エラーハンドリングヘルパー
 */
function handleServiceError(error: unknown): never {
  if (error instanceof TagServiceError) {
    const codeMap: Record<TagServiceError['code'], 'BAD_REQUEST' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR'> = {
      'FETCH_FAILED': 'INTERNAL_SERVER_ERROR',
      'CREATE_FAILED': 'INTERNAL_SERVER_ERROR',
      'UPDATE_FAILED': 'INTERNAL_SERVER_ERROR',
      'DELETE_FAILED': 'INTERNAL_SERVER_ERROR',
      'NOT_FOUND': 'NOT_FOUND',
      'DUPLICATE_NAME': 'BAD_REQUEST',
      'INVALID_INPUT': 'BAD_REQUEST',
      'MERGE_FAILED': 'INTERNAL_SERVER_ERROR',
      'SAME_TAG_MERGE': 'BAD_REQUEST',
      'TARGET_NOT_FOUND': 'NOT_FOUND',
    }

    throw new TRPCError({
      code: codeMap[error.code],
      message: error.message,
    })
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  })
}

/**
 * Tags Router
 */
export const tagsRouter = createTRPCRouter({
  /**
   * タグ一覧取得
   */
  list: protectedProcedure
    .input(
      z.object({
        sortField: z.enum(['name', 'created_at', 'updated_at', 'tag_number']).default('name'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase)
        const tags = await service.list({
          userId: ctx.userId!,
          sortField: input?.sortField,
          sortOrder: input?.sortOrder,
        })

        return {
          data: tags,
          count: tags.length,
        }
      } catch (error) {
        return handleServiceError(error)
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
        const service = createTagService(ctx.supabase)
        const tag = await service.getById({
          userId: ctx.userId!,
          tagId: input.id,
        })

        return tag
      } catch (error) {
        return handleServiceError(error)
      }
    }),

  /**
   * タグ作成
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: z.string().optional(),
        groupId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase)
        const tag = await service.create({
          userId: ctx.userId!,
          input: {
            name: input.name,
            color: input.color,
            description: input.description,
            groupId: input.groupId,
          },
        })

        return tag
      } catch (error) {
        return handleServiceError(error)
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
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: z.string().nullable().optional(),
        groupId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createTagService(ctx.supabase)
        const tag = await service.update({
          userId: ctx.userId!,
          tagId: input.id,
          updates: {
            name: input.name,
            color: input.color,
            description: input.description,
            groupId: input.groupId,
          },
        })

        return tag
      } catch (error) {
        return handleServiceError(error)
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
        const service = createTagService(ctx.supabase)
        const result = await service.merge({
          userId: ctx.userId!,
          sourceTagId: input.sourceTagId,
          targetTagId: input.targetTagId,
          mergeAssociations: input.mergeAssociations,
          deleteSource: input.deleteSource,
        })

        return result
      } catch (error) {
        return handleServiceError(error)
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
        const service = createTagService(ctx.supabase)
        const deletedTag = await service.delete({
          userId: ctx.userId!,
          tagId: input.id,
        })

        return deletedTag
      } catch (error) {
        return handleServiceError(error)
      }
    }),
})
