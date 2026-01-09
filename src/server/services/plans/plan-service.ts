/**
 * Plans Service
 *
 * プランのビジネスロジックを集約したサービス層
 *
 * @description
 * このモジュールは、プラン操作のビジネスロジックをtRPCルーターから分離し、
 * テスト可能性と再利用性を向上させます。
 *
 * @example
 * ```typescript
 * import { PlanService } from '@/server/services/plans'
 *
 * const service = new PlanService(supabase)
 * const plans = await service.list({ userId: 'xxx' })
 * ```
 */

import {
  normalizeDateTimeConsistency,
  removeUndefinedFields,
} from '@/server/api/routers/plans/utils';

import type {
  CreatePlanOptions,
  DeletePlanOptions,
  GetPlanByIdOptions,
  ListPlansOptions,
  PlanRow,
  PlanWithTags,
  ServiceSupabaseClient,
  UpdatePlanOptions,
} from './types';

/**
 * プランサービスクラス
 */
export class PlanService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * プラン一覧を取得
   */
  async list(options: ListPlansOptions): Promise<PlanWithTags[]> {
    const {
      userId,
      tagId,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit,
      offset,
    } = options;

    let query = this.supabase
      .from('plans')
      .select(
        `
        *,
        plan_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `,
      )
      .eq('user_id', userId);

    // タグフィルター
    if (tagId) {
      const planIds = await this.getPlanIdsByTagId(tagId);
      if (planIds.length === 0) {
        return [];
      }
      query = query.in('id', planIds);
    }

    // ステータスフィルター
    if (status) {
      query = query.eq('status', status);
    }

    // 検索フィルター
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // ソート
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // ページネーション
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit ?? 100) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new PlanServiceError('FETCH_FAILED', `Failed to fetch plans: ${error.message}`);
    }

    // plan_tags のネスト構造を tags 配列にフォーマット
    return (data as unknown as PlanWithTags[]).map((plan) => this.formatPlanWithTags(plan));
  }

  /**
   * プランをIDで取得
   */
  async getById(options: GetPlanByIdOptions): Promise<PlanWithTags> {
    const { userId, planId, includeTags } = options;

    if (includeTags) {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*, plan_tags(tag_id, tags(*))')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new PlanServiceError('NOT_FOUND', `Plan not found: ${error.message}`);
      }

      return this.formatPlanWithTags(data as unknown as PlanWithTags);
    }

    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new PlanServiceError('NOT_FOUND', `Plan not found: ${error.message}`);
    }

    return data as PlanWithTags;
  }

  /**
   * 時間重複をチェック
   * @returns 重複しているプランのIDリスト（空なら重複なし）
   */
  async checkTimeOverlap(options: {
    userId: string;
    startTime: string;
    endTime: string;
    excludePlanId?: string;
  }): Promise<string[]> {
    const { userId, startTime, endTime, excludePlanId } = options;

    // 時間重複条件: 既存の開始時刻 < 新規の終了時刻 AND 既存の終了時刻 > 新規の開始時刻
    let query = this.supabase
      .from('plans')
      .select('id')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .lt('start_time', endTime)
      .gt('end_time', startTime);

    // 自分自身を除外（更新時）
    if (excludePlanId) {
      query = query.neq('id', excludePlanId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Time overlap check failed:', error);
      return [];
    }

    return data?.map((row) => row.id) ?? [];
  }

  /**
   * プランを作成
   */
  async create(options: CreatePlanOptions): Promise<PlanRow> {
    const { userId, input, preventOverlappingPlans } = options;

    // 日時の正規化
    const normalizedInput = this.normalizeDateTimeFields(input);

    // 重複チェック（設定がONで、時間指定がある場合）
    if (preventOverlappingPlans && normalizedInput.start_time && normalizedInput.end_time) {
      const overlappingIds = await this.checkTimeOverlap({
        userId,
        startTime: normalizedInput.start_time as string,
        endTime: normalizedInput.end_time as string,
      });

      if (overlappingIds.length > 0) {
        throw new PlanServiceError(
          'TIME_OVERLAP',
          `この時間帯には既に予定があります（${overlappingIds.length}件）`,
        );
      }
    }

    const insertData = {
      user_id: userId,
      plan_number: '', // トリガーで自動生成
      ...removeUndefinedFields(normalizedInput),
    };

    const { data, error } = await this.supabase
      .from('plans')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      throw new PlanServiceError('CREATE_FAILED', `Failed to create plan: ${error.message}`);
    }

    // アクティビティ記録
    await this.recordActivity(data.id, userId, 'created');

    return data;
  }

  /**
   * プランを更新
   */
  async update(options: UpdatePlanOptions): Promise<PlanRow> {
    const { userId, planId, input, preventOverlappingPlans } = options;

    // 既存データを取得
    const oldData = await this.getExistingPlan(planId, userId);

    // 日時の正規化（既存データとマージ）
    const normalizedInput = this.normalizeDateTimeFieldsForUpdate(input, oldData);

    // 重複チェック（設定がONで、時間が変更される場合）
    const finalStartTime =
      (normalizedInput as { start_time?: string }).start_time ?? oldData?.start_time;
    const finalEndTime = (normalizedInput as { end_time?: string }).end_time ?? oldData?.end_time;

    if (preventOverlappingPlans && finalStartTime && finalEndTime) {
      const overlappingIds = await this.checkTimeOverlap({
        userId,
        startTime: finalStartTime,
        endTime: finalEndTime,
        excludePlanId: planId, // 自分自身は除外
      });

      if (overlappingIds.length > 0) {
        throw new PlanServiceError(
          'TIME_OVERLAP',
          `この時間帯には既に予定があります（${overlappingIds.length}件）`,
        );
      }
    }

    const updateData = removeUndefinedFields(normalizedInput) as Record<string, unknown>;

    // completed_at の自動設定（status 変更時）
    const inputWithStatus = input as { status?: string };
    if (inputWithStatus.status === 'done' && oldData?.status !== 'done') {
      // open → done: 完了時刻を記録
      updateData.completed_at = new Date().toISOString();
    } else if (inputWithStatus.status === 'open' && oldData?.status === 'done') {
      // done → open: 完了時刻をクリア
      updateData.completed_at = null;
    }

    const { data, error } = await this.supabase
      .from('plans')
      .update(updateData)
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new PlanServiceError('UPDATE_FAILED', `Failed to update plan: ${error.message}`);
    }

    // 変更追跡
    if (oldData) {
      await this.trackChanges(planId, userId, oldData, data);
    }

    return data;
  }

  /**
   * プランを削除
   */
  async delete(options: DeletePlanOptions): Promise<{ success: boolean }> {
    const { userId, planId } = options;

    // プラン情報を取得（アクティビティ記録用）
    const { data: plan } = await this.supabase
      .from('plans')
      .select('title')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    // アクティビティ記録（削除前）
    await this.supabase.from('plan_activities').insert({
      plan_id: planId,
      user_id: userId,
      action_type: 'deleted',
      field_name: 'title',
      old_value: plan?.title || '',
    });

    const { error } = await this.supabase
      .from('plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId);

    if (error) {
      throw new PlanServiceError('DELETE_FAILED', `Failed to delete plan: ${error.message}`);
    }

    return { success: true };
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * タグIDに関連するプランIDを取得
   */
  private async getPlanIdsByTagId(tagId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('plan_tags')
      .select('plan_id')
      .eq('tag_id', tagId);

    if (error) {
      throw new PlanServiceError(
        'TAG_FILTER_FAILED',
        `Failed to apply tag filter: ${error.message}`,
      );
    }

    return data.map((row) => row.plan_id);
  }

  /**
   * プランとタグデータをフォーマット
   */
  private formatPlanWithTags(plan: PlanWithTags): PlanWithTags {
    const tags =
      plan.plan_tags?.map((pt) => pt.tags).filter((t): t is NonNullable<typeof t> => t !== null) ??
      [];
    const { plan_tags: _, ...planData } = plan;
    return { ...planData, tags } as PlanWithTags;
  }

  /**
   * 日時フィールドを正規化
   */
  private normalizeDateTimeFields<T extends Record<string, unknown>>(input: T): T {
    const dateTimeData: {
      due_date?: string | null;
      start_time?: string | null;
      end_time?: string | null;
    } = {};

    const typedInput = input as {
      due_date?: string | null;
      start_time?: string | null;
      end_time?: string | null;
    };
    if (typedInput.due_date !== undefined) dateTimeData.due_date = typedInput.due_date;
    if (typedInput.start_time !== undefined) dateTimeData.start_time = typedInput.start_time;
    if (typedInput.end_time !== undefined) dateTimeData.end_time = typedInput.end_time;

    normalizeDateTimeConsistency(dateTimeData);

    return {
      ...input,
      ...dateTimeData,
    };
  }

  /**
   * 更新時の日時フィールドを正規化（既存データとマージ）
   */
  private normalizeDateTimeFieldsForUpdate<T extends Record<string, unknown>>(
    input: T,
    existingData: PlanRow | null,
  ): T {
    const typedInput = input as {
      due_date?: string | null;
      start_time?: string | null;
      end_time?: string | null;
    };
    const hasDateTimeUpdate = !!(
      typedInput.due_date ||
      typedInput.start_time ||
      typedInput.end_time
    );

    if (!hasDateTimeUpdate || !existingData) {
      return input;
    }

    const mergedData: {
      due_date?: string | null;
      start_time?: string | null;
      end_time?: string | null;
    } = {};

    const dueDateValue = typedInput.due_date ?? existingData.due_date;
    if (dueDateValue) mergedData.due_date = dueDateValue;

    const startTimeValue = typedInput.start_time ?? existingData.start_time;
    if (startTimeValue !== undefined) mergedData.start_time = startTimeValue;

    const endTimeValue = typedInput.end_time ?? existingData.end_time;
    if (endTimeValue !== undefined) mergedData.end_time = endTimeValue;

    normalizeDateTimeConsistency(mergedData);

    const result = { ...input } as Record<string, unknown>;

    if (typedInput.start_time !== undefined || typedInput.end_time !== undefined) {
      if (mergedData.due_date !== undefined) result.due_date = mergedData.due_date;
      if (mergedData.start_time !== undefined) result.start_time = mergedData.start_time;
      if (mergedData.end_time !== undefined) result.end_time = mergedData.end_time;
    } else if (typedInput.due_date !== undefined) {
      if (mergedData.due_date !== undefined) result.due_date = mergedData.due_date;
    }

    return result as T;
  }

  /**
   * 既存プランを取得
   */
  private async getExistingPlan(planId: string, userId: string): Promise<PlanRow | null> {
    const { data } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    return data;
  }

  /**
   * アクティビティを記録
   */
  private async recordActivity(planId: string, userId: string, actionType: string): Promise<void> {
    await this.supabase.from('plan_activities').insert({
      plan_id: planId,
      user_id: userId,
      action_type: actionType,
    });
  }

  /**
   * 変更を追跡
   */
  private async trackChanges(
    planId: string,
    userId: string,
    oldData: PlanRow,
    newData: PlanRow,
  ): Promise<void> {
    const { trackPlanChanges } = await import('@/server/utils/activity-tracker');
    await trackPlanChanges(this.supabase, planId, userId, oldData, newData);
  }
}

/**
 * プランサービスエラー
 */
export class PlanServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PlanServiceError';
  }
}

/**
 * サービスインスタンスを作成（ファクトリ関数）
 */
export function createPlanService(supabase: ServiceSupabaseClient): PlanService {
  return new PlanService(supabase);
}
