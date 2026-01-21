/**
 * Tag Service
 *
 * タグCRUD操作のビジネスロジック層
 *
 * 主な機能:
 * - タグ一覧取得（ソート対応）
 * - タグ作成
 * - タグ更新（リネーム、色変更、親タグ移動）
 * - タグマージ（関連付け移行 + ソース削除）
 * - タグ削除
 * - 階層構造取得（親タグと子タグ）
 *
 * キャッシュ戦略:
 * - unstable_cache()によるサーバーサイドキャッシュ（5分TTL）
 * - TanStack Queryのクライアントキャッシュと相互補完
 * - mutation時にrevalidateTag()で無効化
 */

import type { Tag, TagWithChildren } from '@/features/tags/types';
import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createCachedParentTagsFetcher, createCachedTagsFetcher } from '@/lib/cache';

/** DB タグ行の型（マイグレーション前は group_id、後は parent_id） */
type DbTagRow = Database['public']['Tables']['tags']['Row'];

/**
 * DBのタグ行をフロントエンド用の Tag 型に変換
 * マイグレーション前: group_id → parent_id
 * マイグレーション後: parent_id をそのまま使用
 */
function transformDbTag(dbTag: DbTagRow): Tag {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyTag = dbTag as any;

  return {
    id: dbTag.id,
    name: dbTag.name,
    user_id: dbTag.user_id,
    color: dbTag.color,
    description: dbTag.description,
    icon: dbTag.icon,
    is_active: dbTag.is_active,
    // マイグレーション後は parent_id を直接使用、前は group_id を使用
    parent_id: anyTag.parent_id ?? anyTag.group_id ?? null,
    // sort_order はマイグレーション後に追加予定、今は null を許容
    sort_order: anyTag.sort_order ?? null,
    created_at: dbTag.created_at,
    updated_at: dbTag.updated_at,
  };
}

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
      target_tag: DbTagRow;
    };
  };
}

/**
 * 型安全なTag RPC呼び出しヘルパー
 */
async function callTagRpc<T extends keyof TagRpcFunctions>(
  supabase: SupabaseClient<Database>,
  functionName: T,
  args: TagRpcFunctions[T]['Args'],
): Promise<{ data: TagRpcFunctions[T]['Returns'] | null; error: Error | null }> {
  // supabase.rpc は直接呼び出す（型キャストで対応）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (supabase.rpc as any)(functionName, args);
  return {
    data: result.data as TagRpcFunctions[T]['Returns'] | null,
    error: result.error,
  };
}

/** タグ作成入力 */
export interface CreateTagInput {
  name: string;
  color?: string | undefined;
  description?: string | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
  groupId?: string | null | undefined;
}

/** タグ更新入力 */
export interface UpdateTagInput {
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
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
  targetTag: Tag;
}

/** タグ並び替え更新 */
export interface ReorderTagUpdate {
  id: string;
  sort_order: number;
  parent_id: string | null;
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
      | 'TARGET_NOT_FOUND'
      | 'HIERARCHY_ERROR',
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
   * デフォルトソート（sort_order, name）の場合はサーバーサイドキャッシュを使用。
   * カスタムソートの場合は直接DBクエリを実行。
   *
   * @param options - 取得オプション（userId, ソート条件）
   * @returns タグ配列
   */
  async list(options: ListTagsOptions): Promise<Tag[]> {
    const { userId, sortField, sortOrder } = options;

    // デフォルトソートの場合はキャッシュを使用（最も一般的なケース）
    // カレンダーサイドバーなど頻繁にアクセスされる箇所で効果的
    const useCache = !sortField && !sortOrder;

    if (useCache) {
      const getCachedTags = createCachedTagsFetcher(this.supabase, userId);
      const data = await getCachedTags();
      return data.map(transformDbTag);
    }

    // カスタムソートの場合は直接クエリ
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order(sortField ?? 'name', { ascending: (sortOrder ?? 'asc') === 'asc' });

    if (error) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch tags: ${error.message}`);
    }

    return data.map(transformDbTag);
  }

  /**
   * 階層構造でタグ一覧取得
   *
   * @param options - userId
   * @returns 親タグ（子タグを含む）とルートタグの配列
   */
  async listHierarchy(options: { userId: string }): Promise<{
    parentTags: TagWithChildren[];
    rootTags: Tag[];
  }> {
    const { userId } = options;

    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch tags: ${error.message}`);
    }

    const tags = data.map(transformDbTag);

    // 親タグ（子を持つタグ）を特定
    const parentIds = new Set(tags.filter((t) => t.parent_id).map((t) => t.parent_id!));

    // 親タグと子タグを分類
    const parentTags: TagWithChildren[] = [];
    const rootTags: Tag[] = [];

    tags.forEach((tag) => {
      if (parentIds.has(tag.id)) {
        // このタグは子を持つ親タグ
        const children = tags.filter((t) => t.parent_id === tag.id);
        parentTags.push({
          ...tag,
          children,
        });
      } else if (!tag.parent_id) {
        // 親を持たず、子も持たないルートタグ
        rootTags.push(tag);
      }
      // parent_id を持つタグは parentTags の children に含まれる
    });

    return { parentTags, rootTags };
  }

  /**
   * 親タグのみ取得（ドロップダウン用）
   *
   * サーバーサイドキャッシュを使用してパフォーマンスを最適化。
   *
   * @param options - userId
   * @returns 親タグの配列（子を持つタグ、または子を持つ可能性のあるルートタグ）
   */
  async listParentTags(options: { userId: string }): Promise<Tag[]> {
    const { userId } = options;

    // キャッシュを使用（parent_id = null のタグのみをキャッシュ）
    const getCachedParentTags = createCachedParentTagsFetcher(this.supabase, userId);
    const data = await getCachedParentTags();

    return data.map(transformDbTag);
  }

  /**
   * タグID指定で取得
   *
   * @param options - userId と tagId
   * @returns タグ
   */
  async getById(options: { userId: string; tagId: string }): Promise<Tag> {
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

    return transformDbTag(data);
  }

  /**
   * タグ作成
   *
   * @param options - userId と作成データ
   * @returns 作成されたタグ
   */
  async create(options: { userId: string; input: CreateTagInput }): Promise<Tag> {
    const { userId, input } = options;

    // バリデーション
    if (!input.name || input.name.trim().length === 0) {
      throw new TagServiceError('INVALID_INPUT', 'Tag name is required');
    }

    if (input.name.trim().length > 50) {
      throw new TagServiceError('INVALID_INPUT', 'Tag name must be 50 characters or less');
    }

    // parentId または groupId を使用（parentId を優先）
    const parentId = input.parentId ?? input.groupId ?? null;

    // 親タグの階層チェック（1階層のみ許可）
    if (parentId) {
      const parentTag = await this.getById({ userId, tagId: parentId });
      if (parentTag.parent_id) {
        throw new TagServiceError(
          'HIERARCHY_ERROR',
          'Maximum nesting depth is 1 level. Parent tag cannot be a child of another tag.',
        );
      }
    }

    // 新規タグを先頭に表示するため、既存の兄弟タグのsort_orderをインクリメント
    let siblingsUpdateQuery = this.supabase
      .from('tags')
      .select('id, sort_order')
      .eq('user_id', userId);

    // parent_idがnullの場合は.is()、それ以外は.eq()を使用
    siblingsUpdateQuery = parentId
      ? siblingsUpdateQuery.eq('parent_id', parentId)
      : siblingsUpdateQuery.is('parent_id', null);

    const { data: siblings } = await siblingsUpdateQuery;

    // 既存の兄弟タグのsort_orderを+1インクリメント
    if (siblings && siblings.length > 0) {
      const incrementPromises = siblings.map((sibling) =>
        this.supabase
          .from('tags')
          .update({ sort_order: (sibling.sort_order ?? 0) + 1 })
          .eq('id', sibling.id),
      );
      await Promise.all(incrementPromises);
    }

    // タグデータ作成（sort_order = 0で先頭に追加）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tagData: any = {
      user_id: userId,
      name: input.name.trim(),
      color: input.color || '#3B82F6',
      description: input.description?.trim() || null,
      is_active: true,
      parent_id: parentId,
      sort_order: 0,
    };

    const { data, error } = await this.supabase.from('tags').insert(tagData).select().single();

    if (error) {
      if (error.code === '23505') {
        throw new TagServiceError('DUPLICATE_NAME', 'Tag with this name already exists');
      }
      throw new TagServiceError('CREATE_FAILED', `Failed to create tag: ${error.message}`);
    }

    return transformDbTag(data);
  }

  /**
   * タグ更新
   *
   * @param options - userId, tagId と更新データ
   * @returns 更新されたタグ
   */
  async update(options: { userId: string; tagId: string; updates: UpdateTagInput }): Promise<Tag> {
    const { userId, tagId, updates } = options;

    // 所有権チェック（エラーが発生すれば NOT_FOUND になる）
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

    // parentId または groupId を使用（parentId を優先）
    const parentId = updates.parentId !== undefined ? updates.parentId : updates.groupId;

    // 親タグの階層チェック
    if (parentId !== undefined && parentId !== null) {
      const parentTag = await this.getById({ userId, tagId: parentId });
      if (parentTag.parent_id) {
        throw new TagServiceError(
          'HIERARCHY_ERROR',
          'Maximum nesting depth is 1 level. Parent tag cannot be a child of another tag.',
        );
      }

      // このタグが子を持っているかチェック
      const { data: children } = await this.supabase
        .from('tags')
        .select('id')
        .eq('parent_id', tagId)
        .limit(1);

      if (children && children.length > 0) {
        throw new TagServiceError(
          'HIERARCHY_ERROR',
          'Cannot move a tag with children to be a child of another tag.',
        );
      }
    }

    // 更新データ準備
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.description !== undefined)
      updateData.description = updates.description?.trim() || null;
    if (parentId !== undefined) updateData.parent_id = parentId;

    const { data, error } = await this.supabase
      .from('tags')
      .update(updateData)
      .eq('id', tagId)
      .select()
      .single();

    if (error) {
      throw new TagServiceError('UPDATE_FAILED', `Failed to update tag: ${error.message}`);
    }

    return transformDbTag(data);
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
    const { userId, sourceTagId, targetTagId } = options;

    if (sourceTagId === targetTagId) {
      throw new TagServiceError('SAME_TAG_MERGE', 'Cannot merge a tag with itself');
    }

    try {
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
        targetTag: transformDbTag(data.target_tag),
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
  async delete(options: { userId: string; tagId: string }): Promise<Tag> {
    const { userId, tagId } = options;

    // 所有権チェック
    const tag = await this.getById({ userId, tagId });

    // 子タグの parent_id を null に更新
    await this.supabase.from('tags').update({ parent_id: null }).eq('parent_id', tagId);

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
   * タグ並び替え（バッチ更新）
   *
   * sort_orderとparent_idをバッチ更新します。
   * 楽観的更新との併用を想定。
   *
   * @param options - userId と更新配列
   * @returns 更新されたタグ数
   */
  async reorder(options: {
    userId: string;
    updates: ReorderTagUpdate[];
  }): Promise<{ count: number }> {
    const { userId, updates } = options;

    if (updates.length === 0) {
      return { count: 0 };
    }

    // 所有権チェック: 更新対象のタグがすべてユーザーのものか確認
    const tagIds = updates.map((u) => u.id);
    const { data: existingTags, error: fetchError } = await this.supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .in('id', tagIds);

    if (fetchError) {
      throw new TagServiceError('FETCH_FAILED', `Failed to verify tags: ${fetchError.message}`);
    }

    const existingIds = new Set(existingTags?.map((t) => t.id) || []);
    const invalidIds = tagIds.filter((id) => !existingIds.has(id));
    if (invalidIds.length > 0) {
      throw new TagServiceError('NOT_FOUND', `Tags not found: ${invalidIds.join(', ')}`);
    }

    // バッチ更新（並列実行）
    const updatePromises = updates.map((update) =>
      this.supabase
        .from('tags')
        .update({
          sort_order: update.sort_order,
          parent_id: update.parent_id,
        })
        .eq('id', update.id)
        .eq('user_id', userId),
    );

    const results = await Promise.all(updatePromises);

    // エラーチェック
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      const firstError = errors[0];
      throw new TagServiceError(
        'UPDATE_FAILED',
        `Failed to reorder tags: ${firstError?.error?.message ?? 'Unknown error'}`,
      );
    }

    return { count: updates.length };
  }

  /**
   * タグ使用統計取得
   *
   * @param options - userId
   * @returns タグ統計の配列
   */
  async getStats(options: { userId: string }): Promise<TagStatsRow[]> {
    const { userId } = options;

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

    const tagIds = tags.map((t) => t.id);
    const { data: planTagCounts, error: countError } = await this.supabase
      .from('plan_tags')
      .select('tag_id')
      .in('tag_id', tagIds);

    if (countError) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch counts: ${countError.message}`);
    }

    const countMap = new Map<string, number>();
    planTagCounts?.forEach((pt) => {
      countMap.set(pt.tag_id, (countMap.get(pt.tag_id) || 0) + 1);
    });

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

    const statsData: TagStatsRow[] = tags.map((tag) => {
      const planCount = countMap.get(tag.id) || 0;
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        plan_count: planCount,
        total_count: planCount,
        last_used_at: lastUsedMap.get(tag.id) || null,
      };
    });

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
