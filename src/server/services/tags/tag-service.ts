/**
 * Tag Service
 *
 * タグCRUD操作のビジネスロジック層
 * REST API実装（src/app/api/tags/route.ts）をtRPC化
 *
 * 主な機能:
 * - タグ一覧取得（ソート対応）
 * - タグ作成
 * - タグ更新（リネーム、色変更、グループ移動）
 * - タグマージ（関連付け移行 + ソース削除）
 * - タグ削除
 */

import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

/** タグ行の型 */
type TagRow = Database['public']['Tables']['tags']['Row'];

/**
 * Tag RPC関数の型定義
 * これらのRPC関数はDBマイグレーションで作成が必要
 */
interface TagRpcFunctions {
  merge_tags: {
    Args: {
      p_user_id: string;
      p_source_tag_ids: string[];
      p_target_tag_id: string;
    };
    Returns: {
      success: boolean;
      merged_associations: number;
      deleted_tags: number;
      target_tag: TagRow;
    };
  };
}

/**
 * 型安全なTag RPC呼び出しヘルパー
 * TODO: DBマイグレーションでRPC関数を作成後、database.types.tsを再生成してこのヘルパーを削除
 */
function callTagRpc<T extends keyof TagRpcFunctions>(
  supabase: SupabaseClient<Database>,
  functionName: T,
  args: TagRpcFunctions[T]['Args'],
): Promise<{ data: TagRpcFunctions[T]['Returns'] | null; error: Error | null }> {
  // DBの型定義にRPC関数が存在しないため、unknownを経由してキャスト
  const rpcCall = supabase.rpc as unknown as (
    fn: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: TagRpcFunctions[T]['Returns'] | null; error: Error | null }>;
  return rpcCall(functionName, args as Record<string, unknown>);
}

/** タグ作成入力 */
export interface CreateTagInput {
  name: string;
  color?: string | undefined;
  description?: string | undefined;
  groupId?: string | null | undefined;
}

/** タグ更新入力 */
export interface UpdateTagInput {
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  groupId?: string | null | undefined;
}

/** タグ一覧取得オプション */
export interface ListTagsOptions {
  userId: string;
  sortField?: 'name' | 'created_at' | 'updated_at' | 'tag_number' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

/** タグマージオプション */
export interface MergeTagsOptions {
  userId: string;
  sourceTagId: string;
  targetTagId: string;
  mergeAssociations?: boolean | undefined;
  deleteSource?: boolean | undefined;
}

/** タグマージ結果 */
export interface MergeTagsResult {
  success: true;
  mergedAssociations: number;
  targetTag: TagRow;
}

/**
 * Tag Service エラー
 */
export class TagServiceError extends Error {
  constructor(
    public readonly code:
      | 'FETCH_FAILED'
      | 'CREATE_FAILED'
      | 'UPDATE_FAILED'
      | 'DELETE_FAILED'
      | 'NOT_FOUND'
      | 'DUPLICATE_NAME'
      | 'INVALID_INPUT'
      | 'MERGE_FAILED'
      | 'SAME_TAG_MERGE'
      | 'TARGET_NOT_FOUND',
    message: string,
  ) {
    super(message);
    this.name = 'TagServiceError';
  }
}

/**
 * Tag Service
 */
export class TagService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * タグ一覧取得
   *
   * @param options - 取得オプション（userId, ソート条件）
   * @returns タグ配列
   */
  async list(options: ListTagsOptions): Promise<TagRow[]> {
    const { userId, sortField = 'name', sortOrder = 'asc' } = options;

    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order(sortField, { ascending: sortOrder === 'asc' });

    if (error) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch tags: ${error.message}`);
    }

    return data;
  }

  /**
   * タグID指定で取得
   *
   * @param options - userId と tagId
   * @returns タグ
   */
  async getById(options: { userId: string; tagId: string }): Promise<TagRow> {
    const { userId, tagId } = options;

    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new TagServiceError('NOT_FOUND', `Tag not found: ${tagId}`);
    }

    return data;
  }

  /**
   * タグ作成
   *
   * @param options - userId と作成データ
   * @returns 作成されたタグ
   */
  async create(options: { userId: string; input: CreateTagInput }): Promise<TagRow> {
    const { userId, input } = options;

    // バリデーション
    if (!input.name || input.name.trim().length === 0) {
      throw new TagServiceError('INVALID_INPUT', 'Tag name is required');
    }

    if (input.name.trim().length > 50) {
      throw new TagServiceError('INVALID_INPUT', 'Tag name must be 50 characters or less');
    }

    // タグデータ作成
    const tagData = {
      user_id: userId,
      name: input.name.trim(),
      color: input.color || '#3B82F6',
      description: input.description?.trim() || null,
      is_active: true,
      group_id: input.groupId || null,
    };

    const { data, error } = await this.supabase.from('tags').insert(tagData).select().single();

    if (error) {
      // 重複エラーの場合
      if (error.code === '23505') {
        throw new TagServiceError('DUPLICATE_NAME', 'Tag with this name already exists');
      }
      throw new TagServiceError('CREATE_FAILED', `Failed to create tag: ${error.message}`);
    }

    return data;
  }

  /**
   * タグ更新
   *
   * @param options - userId, tagId と更新データ
   * @returns 更新されたタグ
   */
  async update(options: {
    userId: string;
    tagId: string;
    updates: UpdateTagInput;
  }): Promise<TagRow> {
    const { userId, tagId, updates } = options;

    // 所有権チェック
    await this.getById({ userId, tagId });

    // バリデーション
    if (updates.name !== undefined) {
      if (updates.name.trim().length === 0) {
        throw new TagServiceError('INVALID_INPUT', 'Tag name cannot be empty');
      }
      if (updates.name.trim().length > 50) {
        throw new TagServiceError('INVALID_INPUT', 'Tag name must be 50 characters or less');
      }
    }

    // 更新データ準備
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.description !== undefined)
      updateData.description = updates.description?.trim() || null;
    if (updates.groupId !== undefined) updateData.group_id = updates.groupId;

    const { data, error } = await this.supabase
      .from('tags')
      .update(updateData)
      .eq('id', tagId)
      .select()
      .single();

    if (error) {
      throw new TagServiceError('UPDATE_FAILED', `Failed to update tag: ${error.message}`);
    }

    return data;
  }

  /**
   * タグマージ（トランザクション対応）
   *
   * PL/pgSQL Stored Procedureを使用してトランザクション的にタグをマージします。
   * ソースタグの関連付けをターゲットタグに移行し、ソースタグを削除します。
   *
   * @param options - マージオプション
   * @returns マージ結果
   */
  async merge(options: MergeTagsOptions): Promise<MergeTagsResult> {
    const {
      userId,
      sourceTagId,
      targetTagId,
      // mergeAssociations and deleteSource are handled by the RPC function
    } = options;

    // バリデーション（所有権チェックはRPC内で実行される）
    if (sourceTagId === targetTagId) {
      throw new TagServiceError('SAME_TAG_MERGE', 'Cannot merge a tag with itself');
    }

    try {
      // Note: RPC関数はDBマイグレーションで作成が必要
      const { data, error } = await callTagRpc(this.supabase, 'merge_tags', {
        p_user_id: userId,
        p_source_tag_ids: [sourceTagId],
        p_target_tag_id: targetTagId,
      });

      if (error) {
        throw new TagServiceError('MERGE_FAILED', `Failed to merge tags: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new TagServiceError('MERGE_FAILED', 'Merge operation failed');
      }

      return {
        success: true,
        mergedAssociations: data.merged_associations,
        targetTag: data.target_tag,
      };
    } catch (error) {
      if (error instanceof TagServiceError) {
        throw error;
      }
      throw new TagServiceError(
        'MERGE_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * タグ削除
   *
   * @param options - userId と tagId
   * @returns 削除されたタグ
   */
  async delete(options: { userId: string; tagId: string }): Promise<TagRow> {
    const { userId, tagId } = options;

    // 所有権チェック
    const tag = await this.getById({ userId, tagId });

    // plan_tagsの関連付けを先に削除
    await this.supabase.from('plan_tags').delete().eq('tag_id', tagId);

    // タグ削除
    const { error } = await this.supabase.from('tags').delete().eq('id', tagId);

    if (error) {
      throw new TagServiceError('DELETE_FAILED', `Failed to delete tag: ${error.message}`);
    }

    return tag;
  }

  /**
   * タグ使用統計取得
   *
   * @param options - userId
   * @returns タグ統計の配列
   */
  async getStats(options: { userId: string }): Promise<TagStatsRow[]> {
    const { userId } = options;

    // ユーザーの全タグを取得（アクティブなもののみ）
    const { data: tags, error: tagsError } = await this.supabase
      .from('tags')
      .select('id, name, color')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (tagsError) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch tags: ${tagsError.message}`);
    }

    if (!tags || tags.length === 0) {
      return [];
    }

    // 各タグのプラン紐付け数を取得
    const tagIds = tags.map((t) => t.id);
    const { data: planTagCounts, error: countError } = await this.supabase
      .from('plan_tags')
      .select('tag_id')
      .in('tag_id', tagIds);

    if (countError) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch counts: ${countError.message}`);
    }

    // タグIDごとのカウントを集計
    const countMap = new Map<string, number>();
    planTagCounts?.forEach((pt) => {
      countMap.set(pt.tag_id, (countMap.get(pt.tag_id) || 0) + 1);
    });

    // 最終使用日を取得（最新のplan_tags作成日）
    const { data: lastUsedData } = await this.supabase
      .from('plan_tags')
      .select('tag_id, created_at')
      .in('tag_id', tagIds)
      .order('created_at', { ascending: false });

    const lastUsedMap = new Map<string, string | null>();
    lastUsedData?.forEach((pt) => {
      if (!lastUsedMap.has(pt.tag_id) && pt.created_at) {
        lastUsedMap.set(pt.tag_id, pt.created_at);
      }
    });

    // レスポンスデータを構築
    const statsData: TagStatsRow[] = tags.map((tag) => {
      const planCount = countMap.get(tag.id) || 0;
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        plan_count: planCount,
        total_count: planCount, // 現在はプランのみ
        last_used_at: lastUsedMap.get(tag.id) || null,
      };
    });

    // 使用数でソート（多い順）
    statsData.sort((a, b) => b.total_count - a.total_count);

    return statsData;
  }
}

/** タグ統計の型 */
export interface TagStatsRow {
  id: string;
  name: string;
  color: string | null;
  plan_count: number;
  total_count: number;
  last_used_at: string | null;
}

/**
 * TagService インスタンス作成
 *
 * @param supabase - Supabaseクライアント
 * @returns TagService
 */
export function createTagService(supabase: SupabaseClient<Database>) {
  return new TagService(supabase);
}
