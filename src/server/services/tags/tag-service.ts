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

import type { Database } from '@/lib/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

/** タグ行の型 */
type TagRow = Database['public']['Tables']['tags']['Row']

/** タグ作成入力 */
export interface CreateTagInput {
  name: string
  color?: string
  description?: string
  groupId?: string | null
}

/** タグ更新入力 */
export interface UpdateTagInput {
  name?: string
  color?: string
  description?: string | null
  groupId?: string | null
}

/** タグ一覧取得オプション */
export interface ListTagsOptions {
  userId: string
  sortField?: 'name' | 'created_at' | 'updated_at' | 'tag_number'
  sortOrder?: 'asc' | 'desc'
}

/** タグマージオプション */
export interface MergeTagsOptions {
  userId: string
  sourceTagId: string
  targetTagId: string
  mergeAssociations?: boolean
  deleteSource?: boolean
}

/** タグマージ結果 */
export interface MergeTagsResult {
  success: true
  mergedAssociations: number
  targetTag: TagRow
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
    super(message)
    this.name = 'TagServiceError'
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
    const { userId, sortField = 'name', sortOrder = 'asc' } = options

    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order(sortField, { ascending: sortOrder === 'asc' })

    if (error) {
      throw new TagServiceError('FETCH_FAILED', `Failed to fetch tags: ${error.message}`)
    }

    return data
  }

  /**
   * タグID指定で取得
   *
   * @param options - userId と tagId
   * @returns タグ
   */
  async getById(options: { userId: string; tagId: string }): Promise<TagRow> {
    const { userId, tagId } = options

    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new TagServiceError('NOT_FOUND', `Tag not found: ${tagId}`)
    }

    return data
  }

  /**
   * タグ作成
   *
   * @param options - userId と作成データ
   * @returns 作成されたタグ
   */
  async create(options: { userId: string; input: CreateTagInput }): Promise<TagRow> {
    const { userId, input } = options

    // バリデーション
    if (!input.name || input.name.trim().length === 0) {
      throw new TagServiceError('INVALID_INPUT', 'Tag name is required')
    }

    if (input.name.trim().length > 50) {
      throw new TagServiceError('INVALID_INPUT', 'Tag name must be 50 characters or less')
    }

    // タグデータ作成
    const tagData = {
      user_id: userId,
      name: input.name.trim(),
      color: input.color || '#3B82F6',
      description: input.description?.trim() || null,
      is_active: true,
      group_id: input.groupId || null,
    }

    const { data, error } = await this.supabase.from('tags').insert(tagData).select().single()

    if (error) {
      // 重複エラーの場合
      if (error.code === '23505') {
        throw new TagServiceError('DUPLICATE_NAME', 'Tag with this name already exists')
      }
      throw new TagServiceError('CREATE_FAILED', `Failed to create tag: ${error.message}`)
    }

    return data
  }

  /**
   * タグ更新
   *
   * @param options - userId, tagId と更新データ
   * @returns 更新されたタグ
   */
  async update(options: {
    userId: string
    tagId: string
    updates: UpdateTagInput
  }): Promise<TagRow> {
    const { userId, tagId, updates } = options

    // 所有権チェック
    await this.getById({ userId, tagId })

    // バリデーション
    if (updates.name !== undefined) {
      if (updates.name.trim().length === 0) {
        throw new TagServiceError('INVALID_INPUT', 'Tag name cannot be empty')
      }
      if (updates.name.trim().length > 50) {
        throw new TagServiceError('INVALID_INPUT', 'Tag name must be 50 characters or less')
      }
    }

    // 更新データ準備
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name.trim()
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.description !== undefined) updateData.description = updates.description?.trim() || null
    if (updates.groupId !== undefined) updateData.group_id = updates.groupId

    const { data, error } = await this.supabase
      .from('tags')
      .update(updateData)
      .eq('id', tagId)
      .select()
      .single()

    if (error) {
      throw new TagServiceError('UPDATE_FAILED', `Failed to update tag: ${error.message}`)
    }

    return data
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
      mergeAssociations = true,
      deleteSource = true,
    } = options

    // バリデーション（所有権チェックはRPC内で実行される）
    if (sourceTagId === targetTagId) {
      throw new TagServiceError('SAME_TAG_MERGE', 'Cannot merge a tag with itself')
    }

    try {
      // PL/pgSQL Stored Procedureを呼び出し
      const { data, error } = await this.supabase.rpc('merge_tags', {
        p_user_id: userId,
        p_source_tag_ids: [sourceTagId],
        p_target_tag_id: targetTagId,
      })

      if (error) {
        throw new TagServiceError('MERGE_FAILED', `Failed to merge tags: ${error.message}`)
      }

      // RPC結果を解析
      const result = data as {
        success: boolean
        merged_associations: number
        deleted_tags: number
        target_tag: TagRow
      }

      return {
        success: result.success,
        mergedAssociations: result.merged_associations,
        targetTag: result.target_tag,
      }
    } catch (error) {
      if (error instanceof TagServiceError) {
        throw error
      }
      throw new TagServiceError(
        'MERGE_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  /**
   * タグ削除
   *
   * @param options - userId と tagId
   * @returns 削除されたタグ
   */
  async delete(options: { userId: string; tagId: string }): Promise<TagRow> {
    const { userId, tagId } = options

    // 所有権チェック
    const tag = await this.getById({ userId, tagId })

    // plan_tagsの関連付けを先に削除
    await this.supabase.from('plan_tags').delete().eq('tag_id', tagId)

    // タグ削除
    const { error } = await this.supabase.from('tags').delete().eq('id', tagId)

    if (error) {
      throw new TagServiceError('DELETE_FAILED', `Failed to delete tag: ${error.message}`)
    }

    return tag
  }
}

/**
 * TagService インスタンス作成
 *
 * @param supabase - Supabaseクライアント
 * @returns TagService
 */
export function createTagService(supabase: SupabaseClient<Database>) {
  return new TagService(supabase)
}
