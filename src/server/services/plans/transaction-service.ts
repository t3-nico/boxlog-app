/**
 * Plan Transaction Service
 *
 * PL/pgSQL Stored Proceduresを使用したトランザクション処理
 * Phase 3: 複数操作のACID保証を実装
 *
 * @description
 * このモジュールは、プラン操作でトランザクション性が必要な場合に使用します。
 * 通常の操作は plan-service.ts を使用してください。
 *
 * @example
 * ```typescript
 * import { PlanTransactionService } from '@/server/services/plans/transaction-service'
 *
 * const service = new PlanTransactionService(supabase)
 * const plan = await service.createWithTags({
 *   userId: 'xxx',
 *   title: 'My Plan',
 *   tagIds: ['tag1', 'tag2'],
 * })
 * ```
 */

import type { ServiceSupabaseClient } from './types'

/** プラン作成（タグ付き）のオプション */
export interface CreatePlanWithTagsOptions {
  userId: string
  title: string
  description?: string
  scheduledDate?: string
  tagIds?: string[]
}

/** プラン更新（タグ付き）のオプション */
export interface UpdatePlanWithTagsOptions {
  userId: string
  planId: string
  title?: string
  description?: string | null
  scheduledDate?: string | null
  tagIds?: string[]
}

/** プラン削除のオプション */
export interface DeletePlanWithCleanupOptions {
  userId: string
  planId: string
}

/**
 * RPC呼び出しの結果型（create_plan_with_tags）
 */
interface CreatePlanWithTagsResult {
  id: string
  user_id: string
  title: string
  description: string | null
  scheduled_date: string | null
  created_at: string
  updated_at: string
  tag_ids: string[]
}

/**
 * RPC呼び出しの結果型（update_plan_with_tags）
 */
interface UpdatePlanWithTagsResult {
  id: string
  user_id: string
  title: string
  description: string | null
  scheduled_date: string | null
  created_at: string
  updated_at: string
  tag_ids: string[] | null
}

/**
 * RPC呼び出しの結果型（delete_plan_with_cleanup）
 */
interface DeletePlanWithCleanupResult {
  success: boolean
  deleted_plan: {
    id: string
    title: string
  }
  deleted_tags_associations: number
}

/**
 * Plan Transaction Service エラー
 */
export class PlanTransactionServiceError extends Error {
  constructor(
    public readonly code:
      | 'CREATE_WITH_TAGS_FAILED'
      | 'UPDATE_WITH_TAGS_FAILED'
      | 'DELETE_WITH_CLEANUP_FAILED'
      | 'RPC_CALL_FAILED',
    message: string,
  ) {
    super(message)
    this.name = 'PlanTransactionServiceError'
  }
}

/**
 * Plan Transaction Service
 */
export class PlanTransactionService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * プラン作成（タグ付き）
   *
   * PL/pgSQL Stored Procedureを使用してトランザクション的にプランを作成します。
   * プラン作成、タグ関連付け、アクティビティ記録が全てアトミックに実行されます。
   *
   * @param options - 作成オプション
   * @returns 作成されたプラン
   */
  async createWithTags(options: CreatePlanWithTagsOptions): Promise<CreatePlanWithTagsResult> {
    const { userId, title, description, scheduledDate, tagIds } = options

    try {
      const { data, error } = await this.supabase.rpc('create_plan_with_tags', {
        p_user_id: userId,
        p_title: title,
        p_description: description || null,
        p_scheduled_date: scheduledDate || null,
        p_tag_ids: tagIds || [],
      })

      if (error) {
        throw new PlanTransactionServiceError(
          'CREATE_WITH_TAGS_FAILED',
          `Failed to create plan with tags: ${error.message}`,
        )
      }

      return data as CreatePlanWithTagsResult
    } catch (error) {
      if (error instanceof PlanTransactionServiceError) {
        throw error
      }
      throw new PlanTransactionServiceError(
        'RPC_CALL_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  /**
   * プラン更新（タグ付き）
   *
   * PL/pgSQL Stored Procedureを使用してトランザクション的にプランを更新します。
   * プラン更新、タグ関連付け更新、アクティビティ記録が全てアトミックに実行されます。
   *
   * @param options - 更新オプション
   * @returns 更新されたプラン
   */
  async updateWithTags(options: UpdatePlanWithTagsOptions): Promise<UpdatePlanWithTagsResult> {
    const { userId, planId, title, description, scheduledDate, tagIds } = options

    try {
      const { data, error } = await this.supabase.rpc('update_plan_with_tags', {
        p_user_id: userId,
        p_plan_id: planId,
        p_title: title || null,
        p_description: description === undefined ? null : description,
        p_scheduled_date: scheduledDate === undefined ? null : scheduledDate,
        p_tag_ids: tagIds || null,
      })

      if (error) {
        throw new PlanTransactionServiceError(
          'UPDATE_WITH_TAGS_FAILED',
          `Failed to update plan with tags: ${error.message}`,
        )
      }

      return data as UpdatePlanWithTagsResult
    } catch (error) {
      if (error instanceof PlanTransactionServiceError) {
        throw error
      }
      throw new PlanTransactionServiceError(
        'RPC_CALL_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  /**
   * プラン削除（クリーンアップ付き）
   *
   * PL/pgSQL Stored Procedureを使用してトランザクション的にプランを削除します。
   * プラン削除、plan_tags削除、アクティビティ記録が全てアトミックに実行されます。
   *
   * @param options - 削除オプション
   * @returns 削除結果
   */
  async deleteWithCleanup(
    options: DeletePlanWithCleanupOptions,
  ): Promise<DeletePlanWithCleanupResult> {
    const { userId, planId } = options

    try {
      const { data, error } = await this.supabase.rpc('delete_plan_with_cleanup', {
        p_user_id: userId,
        p_plan_id: planId,
      })

      if (error) {
        throw new PlanTransactionServiceError(
          'DELETE_WITH_CLEANUP_FAILED',
          `Failed to delete plan with cleanup: ${error.message}`,
        )
      }

      return data as DeletePlanWithCleanupResult
    } catch (error) {
      if (error instanceof PlanTransactionServiceError) {
        throw error
      }
      throw new PlanTransactionServiceError(
        'RPC_CALL_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }
}

/**
 * PlanTransactionService インスタンス作成
 *
 * @param supabase - Supabaseクライアント
 * @returns PlanTransactionService
 */
export function createPlanTransactionService(supabase: ServiceSupabaseClient) {
  return new PlanTransactionService(supabase)
}
