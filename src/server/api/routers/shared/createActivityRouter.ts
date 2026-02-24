/**
 * Activity Router Factory
 *
 * Plan/Record共通のアクティビティ履歴管理ルーターを生成
 */

import { TRPCError } from '@trpc/server';
import type { AnyZodObject } from 'zod';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { protectedProcedure as ProtectedProcedureImpl } from '@/server/api/trpc';
import { createTRPCRouter } from '@/server/api/trpc';

/** protectedProcedure の型（ファクトリで受け取る用） */
type ProtectedProcedure = typeof ProtectedProcedureImpl;

/**
 * Activity Router Factory Options
 */
export interface CreateActivityRouterOptions<
  TListInput extends { limit: number; offset: number; order: 'asc' | 'desc' },
> {
  /** エンティティ名（例: 'plan', 'record'） */
  entityName: string;
  /** エンティティIDフィールド名（例: 'plan_id', 'record_id'） */
  entityIdField: keyof TListInput & string;
  /** エンティティテーブル名（例: 'plans', 'records'） */
  entityTable: string;
  /** アクティビティテーブル名（例: 'plan_activities', 'record_activities'） */
  activitiesTable: string;
  /** list用Zodスキーマ */
  listSchema: AnyZodObject;
  /** create用Zodスキーマ（省略可） */
  createSchema?: AnyZodObject;
  /** protectedProcedure */
  protectedProcedure: ProtectedProcedure;
}

/**
 * Activity Router Factory
 *
 * @template TListInput list入力の型
 * @param options ルーター設定
 * @returns tRPCルーター
 *
 * @example
 * ```typescript
 * export const activitiesRouter = createActivityRouter<GetPlanActivitiesInput>({
 *   entityName: 'Plan',
 *   entityIdField: 'plan_id',
 *   entityTable: 'plans',
 *   activitiesTable: 'plan_activities',
 *   listSchema: getPlanActivitiesSchema,
 *   protectedProcedure,
 * });
 * ```
 */
export function createActivityRouter<
  TListInput extends { limit: number; offset: number; order: 'asc' | 'desc' },
>(options: CreateActivityRouterOptions<TListInput>) {
  const {
    entityName,
    entityIdField,
    entityTable,
    activitiesTable,
    listSchema,
    createSchema,
    protectedProcedure,
  } = options;

  // tRPC動的ルーター構築: AnyZodObjectからの型推論は制限されるため、
  // ハンドラ内で手動キャストし、ルーター辞書は unknown 経由で渡す
  const router: Record<string, unknown> = {
    /**
     * Get activity list
     */
    list: protectedProcedure.input(listSchema).query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const typedInput = input as TListInput;
      const entityId = typedInput[entityIdField] as string;
      const { limit, offset, order } = typedInput;

      // Verify entity ownership
      const { data: entity, error: entityError } = await (supabase as SupabaseClient)
        .from(entityTable)
        .select('id')
        .eq('id', entityId)
        .eq('user_id', userId)
        .single();

      if (entityError || !entity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `${entityName} not found or access denied`,
        });
      }

      // Get activities (order: desc=newest first, asc=oldest first)
      // 動的テーブル名・カラム名のため untyped SupabaseClient にキャスト
      const { data: activities, error } = await (supabase as SupabaseClient)
        .from(activitiesTable)
        .select('*')
        .eq(entityIdField, entityId as never)
        .order('created_at', { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch activities: ${error.message}`,
        });
      }

      return activities ?? [];
    }),
  };

  // createスキーマが提供されている場合、create procedureを追加
  if (createSchema) {
    router.create = protectedProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const typedInput = input as Record<string, unknown>;
      const entityId = typedInput[entityIdField] as string;

      // Verify entity ownership
      const { data: entity, error: entityError } = await (supabase as SupabaseClient)
        .from(entityTable)
        .select('id')
        .eq('id', entityId)
        .eq('user_id', userId)
        .single();

      if (entityError || !entity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `${entityName} not found or access denied`,
        });
      }

      // Create activity (remove undefined)
      const activityData: Record<string, unknown> = {
        [entityIdField]: entityId,
        user_id: userId,
      };

      // 他のフィールドをコピー（undefinedを除外）
      for (const [key, value] of Object.entries(typedInput)) {
        if (key !== entityIdField && value !== undefined) {
          activityData[key] = value;
        }
      }

      const { data: activity, error } = await (supabase as SupabaseClient)
        .from(activitiesTable)
        .insert(activityData as never)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create activity: ${error.message}`,
        });
      }

      return activity;
    });
  }

  // Record<string, unknown> → CreateRouterOptions のキャストが必要
  // tRPCの動的ルーター構築では避けられない制約
  return createTRPCRouter(router as Parameters<typeof createTRPCRouter>[0]);
}
