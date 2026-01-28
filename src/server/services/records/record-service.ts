/**
 * Records Service
 *
 * Record（作業ログ）のビジネスロジックを集約したサービス層
 *
 * @description
 * このモジュールは、Record操作のビジネスロジックをtRPCルーターから分離し、
 * テスト可能性と再利用性を向上させます。
 *
 * @example
 * ```typescript
 * import { RecordService } from '@/server/services/records'
 *
 * const service = new RecordService(supabase)
 * const records = await service.list({ userId: 'xxx' })
 * ```
 */

import { removeUndefinedFields } from '@/server/api/routers/plans/utils';

import type {
  BulkDeleteRecordsOptions,
  CreateRecordOptions,
  DeleteRecordOptions,
  DuplicateRecordOptions,
  GetRecordByIdOptions,
  ListRecordsByPlanOptions,
  ListRecordsOptions,
  RecordRow,
  RecordWithPlanAndTags,
  ServiceSupabaseClient,
  UpdateRecordOptions,
} from './types';

/**
 * Recordサービスクラス
 */
export class RecordService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * Record一覧を取得（タグID付き）
   */
  async list(options: ListRecordsOptions): Promise<RecordWithPlanAndTags[]> {
    const {
      userId,
      plan_id,
      worked_at_from,
      worked_at_to,
      fulfillment_score_min,
      fulfillment_score_max,
      sortBy = 'worked_at',
      sortOrder = 'desc',
      limit,
      offset,
    } = options;

    // レコードとPlanを取得
    let query = this.supabase
      .from('records')
      .select(
        `
        *,
        plans:plan_id (
          id,
          title,
          status
        )
      `,
      )
      .eq('user_id', userId);

    // Planフィルター
    if (plan_id) {
      query = query.eq('plan_id', plan_id);
    }

    // 日付範囲フィルター
    if (worked_at_from) {
      query = query.gte('worked_at', worked_at_from);
    }
    if (worked_at_to) {
      query = query.lte('worked_at', worked_at_to);
    }

    // 充実度フィルター
    if (fulfillment_score_min !== undefined) {
      query = query.gte('fulfillment_score', fulfillment_score_min);
    }
    if (fulfillment_score_max !== undefined) {
      query = query.lte('fulfillment_score', fulfillment_score_max);
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
      throw new RecordServiceError('FETCH_FAILED', `Failed to fetch records: ${error.message}`);
    }

    const records = data ?? [];
    if (records.length === 0) {
      return [];
    }

    // TagIDsを一括取得
    const recordIds = records.map((r) => r.id);
    const tagIdsMap = await this.getTagIdsForRecords(recordIds, userId);

    // plansのネスト構造とtagIdsをフォーマット
    return records.map((record) => {
      const { plans, ...recordData } = record;
      return {
        ...recordData,
        plan: plans ?? null,
        tagIds: tagIdsMap.get(record.id) ?? [],
      };
    });
  }

  /**
   * RecordをIDで取得（タグID付き）
   */
  async getById(options: GetRecordByIdOptions): Promise<RecordWithPlanAndTags> {
    const { userId, recordId, includePlan } = options;

    // 常にplansを含めてクエリ（型推論を安定させるため）
    const { data, error } = await this.supabase
      .from('records')
      .select(
        `
        *,
        plans:plan_id (
          id,
          title,
          status
        )
      `,
      )
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new RecordServiceError('NOT_FOUND', `Record not found: ${error.message}`);
    }

    // TagIDsを取得
    const tagIdsMap = await this.getTagIdsForRecords([recordId], userId);

    const { plans, ...rest } = data;

    return {
      ...rest,
      plan: includePlan ? (plans ?? null) : null,
      tagIds: tagIdsMap.get(recordId) ?? [],
    };
  }

  /**
   * Recordを作成（タグも同時に設定可能）
   */
  async create(options: CreateRecordOptions): Promise<RecordRow & { tagIds: string[] }> {
    const { userId, input } = options;
    const { tagIds, ...recordInput } = input;

    // Plan存在確認（plan_idがある場合のみ）
    if (recordInput.plan_id) {
      await this.verifyPlanOwnership(recordInput.plan_id, userId);
    }

    const insertData = {
      user_id: userId,
      ...removeUndefinedFields(recordInput),
    };

    const { data, error } = await this.supabase
      .from('records')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      throw new RecordServiceError('CREATE_FAILED', `Failed to create record: ${error.message}`);
    }

    // タグを設定（指定がある場合）
    if (tagIds && tagIds.length > 0) {
      await this.setRecordTags(data.id, userId, tagIds);
    }

    return { ...data, tagIds: tagIds ?? [] };
  }

  /**
   * Recordを更新
   *
   * Note: plan_id は作成後に変更不可（スキーマで除外済み）
   */
  async update(options: UpdateRecordOptions): Promise<RecordRow> {
    const { userId, recordId, input } = options;

    const updateData = removeUndefinedFields(input);

    const { data, error } = await this.supabase
      .from('records')
      .update(updateData as never)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new RecordServiceError('UPDATE_FAILED', `Failed to update record: ${error.message}`);
    }

    return data;
  }

  /**
   * Recordを削除
   */
  async delete(options: DeleteRecordOptions): Promise<{ success: boolean }> {
    const { userId, recordId } = options;

    const { error } = await this.supabase
      .from('records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) {
      throw new RecordServiceError('DELETE_FAILED', `Failed to delete record: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Recordを複製（最近のエントリ複製機能）
   */
  async duplicate(options: DuplicateRecordOptions): Promise<RecordRow> {
    const { userId, recordId, workedAt } = options;

    // 元のRecordを取得
    const { data: original, error: fetchError } = await this.supabase
      .from('records')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !original) {
      throw new RecordServiceError('NOT_FOUND', 'Original record not found');
    }

    // 新しいRecordを作成（worked_atを変更）
    const today = new Date().toISOString().split('T')[0];
    // title は DB カラムが追加されるまで undefined の可能性あり
    const originalWithTitle = original as typeof original & { title?: string | null };
    const newRecord = {
      user_id: userId,
      plan_id: original.plan_id,
      title: originalWithTitle.title ?? null,
      worked_at: workedAt ?? today,
      start_time: original.start_time,
      end_time: original.end_time,
      duration_minutes: original.duration_minutes,
      fulfillment_score: original.fulfillment_score,
      note: original.note,
    };

    const { data, error } = await this.supabase
      .from('records')
      .insert(newRecord as never)
      .select()
      .single();

    if (error) {
      throw new RecordServiceError(
        'DUPLICATE_FAILED',
        `Failed to duplicate record: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Recordを一括削除
   */
  async bulkDelete(options: BulkDeleteRecordsOptions): Promise<{ deletedCount: number }> {
    const { userId, recordIds } = options;

    const { error, count } = await this.supabase
      .from('records')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .in('id', recordIds);

    if (error) {
      throw new RecordServiceError(
        'BULK_DELETE_FAILED',
        `Failed to bulk delete records: ${error.message}`,
      );
    }

    return { deletedCount: count ?? 0 };
  }

  /**
   * PlanのRecord一覧を取得
   */
  async listByPlan(options: ListRecordsByPlanOptions): Promise<RecordRow[]> {
    const { userId, planId, sortBy = 'worked_at', sortOrder = 'desc', limit } = options;

    let query = this.supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new RecordServiceError(
        'FETCH_FAILED',
        `Failed to fetch records by plan: ${error.message}`,
      );
    }

    return data ?? [];
  }

  /**
   * 最近のRecordを取得（複製用、タグID付き）
   */
  async getRecentRecords(userId: string, limit: number = 5): Promise<RecordWithPlanAndTags[]> {
    const { data, error } = await this.supabase
      .from('records')
      .select(
        `
        *,
        plans:plan_id (
          id,
          title,
          status
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new RecordServiceError(
        'FETCH_FAILED',
        `Failed to fetch recent records: ${error.message}`,
      );
    }

    const records = data ?? [];
    if (records.length === 0) {
      return [];
    }

    // TagIDsを一括取得
    const recordIds = records.map((r) => r.id);
    const tagIdsMap = await this.getTagIdsForRecords(recordIds, userId);

    return records.map((record) => {
      const { plans, ...recordData } = record;
      return {
        ...recordData,
        plan: plans ?? null,
        tagIds: tagIdsMap.get(record.id) ?? [],
      };
    });
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * 複数のRecordに対するタグIDを一括取得
   */
  private async getTagIdsForRecords(
    recordIds: string[],
    userId: string,
  ): Promise<Map<string, string[]>> {
    if (recordIds.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from('record_tags')
      .select('record_id, tag_id')
      .in('record_id', recordIds)
      .eq('user_id', userId);

    if (error) {
      throw new RecordServiceError(
        'FETCH_TAGS_FAILED',
        `Failed to fetch record tags: ${error.message}`,
      );
    }

    // record_id -> tagIds のマップを作成
    const map = new Map<string, string[]>();
    for (const row of data ?? []) {
      const existing = map.get(row.record_id) ?? [];
      existing.push(row.tag_id);
      map.set(row.record_id, existing);
    }
    return map;
  }

  /**
   * Recordにタグを設定（既存タグをすべて置換）
   */
  private async setRecordTags(recordId: string, userId: string, tagIds: string[]): Promise<void> {
    // 既存の関連をすべて削除
    await this.supabase
      .from('record_tags')
      .delete()
      .eq('record_id', recordId)
      .eq('user_id', userId);

    // 新しい関連を追加
    if (tagIds.length > 0) {
      const recordTagsToInsert = tagIds.map((tagId) => ({
        user_id: userId,
        record_id: recordId,
        tag_id: tagId,
      }));

      const { error } = await this.supabase.from('record_tags').insert(recordTagsToInsert);

      if (error) {
        throw new RecordServiceError(
          'SET_TAGS_FAILED',
          `Failed to set record tags: ${error.message}`,
        );
      }
    }
  }

  /**
   * Planの所有権を確認
   */
  private async verifyPlanOwnership(planId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new RecordServiceError('PLAN_NOT_FOUND', 'Plan not found or access denied');
    }
  }
}

/**
 * Recordサービスエラー
 */
export class RecordServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'RecordServiceError';
  }
}

/**
 * サービスインスタンスを作成（ファクトリ関数）
 */
export function createRecordService(supabase: ServiceSupabaseClient): RecordService {
  return new RecordService(supabase);
}
