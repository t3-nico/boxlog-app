/**
 * Tag Group Service
 *
 * タググループ管理のビジネスロジック
 * tRPCルーターから呼び出されるサービス層
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

type TagGroup = Database['public']['Tables']['tag_groups']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

/**
 * Tag Group Service エラー
 */
export class TagGroupServiceError extends Error {
  constructor(
    public code:
      | 'FETCH_FAILED'
      | 'CREATE_FAILED'
      | 'UPDATE_FAILED'
      | 'DELETE_FAILED'
      | 'REORDER_FAILED'
      | 'NOT_FOUND'
      | 'DUPLICATE_NAME'
      | 'INVALID_INPUT',
    message: string,
  ) {
    super(message)
    this.name = 'TagGroupServiceError'
  }
}

/**
 * Service入力型
 */
export interface CreateTagGroupInput {
  name: string
  slug?: string
  description?: string | null
  color?: string | null
  sortOrder?: number
}

export interface UpdateTagGroupInput {
  name?: string
  description?: string | null
  color?: string | null
  sortOrder?: number
}

export interface ListTagGroupsOptions {
  userId: string
}

export interface GetTagGroupByIdOptions {
  userId: string
  groupId: string
  withTags?: boolean
}

export interface CreateTagGroupOptions {
  userId: string
  input: CreateTagGroupInput
}

export interface UpdateTagGroupOptions {
  userId: string
  groupId: string
  updates: UpdateTagGroupInput
}

export interface DeleteTagGroupOptions {
  userId: string
  groupId: string
}

export interface ReorderTagGroupsOptions {
  userId: string
  groupIds: string[]
}

/**
 * タググループとタグを含むレスポンス型
 */
export interface TagGroupWithTags extends TagGroup {
  tags: Tag[]
}

/**
 * Tag Group Service ファクトリ
 */
export function createTagGroupService(supabase: SupabaseClient<Database>) {
  return {
    /**
     * タググループ一覧取得
     */
    async list(options: ListTagGroupsOptions): Promise<TagGroup[]> {
      const { userId } = options

      const { data, error } = await supabase
        .from('tag_groups')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        throw new TagGroupServiceError('FETCH_FAILED', `Failed to fetch tag groups: ${error.message}`)
      }

      return data || []
    },

    /**
     * タググループID指定で取得
     */
    async getById(options: GetTagGroupByIdOptions): Promise<TagGroup | TagGroupWithTags> {
      const { userId, groupId, withTags = false } = options

      const { data, error } = await supabase
        .from('tag_groups')
        .select('*')
        .eq('id', groupId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TagGroupServiceError('NOT_FOUND', 'Tag group not found')
        }
        throw new TagGroupServiceError('FETCH_FAILED', `Failed to fetch tag group: ${error.message}`)
      }

      if (!withTags) {
        return data
      }

      // グループ内のタグも取得
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .order('tag_number', { ascending: true })

      if (tagsError) {
        throw new TagGroupServiceError('FETCH_FAILED', `Failed to fetch tags: ${tagsError.message}`)
      }

      return {
        ...data,
        tags: tags || [],
      }
    },

    /**
     * タググループ作成
     */
    async create(options: CreateTagGroupOptions): Promise<TagGroup> {
      const { userId, input } = options

      // バリデーション
      if (!input.name || input.name.trim().length === 0) {
        throw new TagGroupServiceError('INVALID_INPUT', 'Name is required')
      }

      const insertData = {
        user_id: userId,
        name: input.name,
        slug: input.slug || '',
        description: input.description || null,
        color: input.color || null,
        sort_order: input.sortOrder ?? 0,
      }

      const { data, error } = await supabase.from('tag_groups').insert(insertData).select().single()

      if (error) {
        // 重複名チェック（unique制約エラー）
        if (error.code === '23505') {
          throw new TagGroupServiceError('DUPLICATE_NAME', 'Tag group with this name already exists')
        }
        throw new TagGroupServiceError('CREATE_FAILED', `Failed to create tag group: ${error.message}`)
      }

      return data
    },

    /**
     * タググループ更新
     */
    async update(options: UpdateTagGroupOptions): Promise<TagGroup> {
      const { userId, groupId, updates } = options

      // 更新データ構築
      const updateData: Partial<TagGroup> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.color !== undefined) updateData.color = updates.color
      if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder

      const { data, error } = await supabase
        .from('tag_groups')
        .update(updateData)
        .eq('id', groupId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TagGroupServiceError('NOT_FOUND', 'Tag group not found')
        }
        if (error.code === '23505') {
          throw new TagGroupServiceError('DUPLICATE_NAME', 'Tag group with this name already exists')
        }
        throw new TagGroupServiceError('UPDATE_FAILED', `Failed to update tag group: ${error.message}`)
      }

      return data
    },

    /**
     * タググループ削除
     * グループ内のタグのgroup_idはNULLになる（CASCADE設定により）
     */
    async delete(options: DeleteTagGroupOptions): Promise<void> {
      const { userId, groupId } = options

      const { error } = await supabase
        .from('tag_groups')
        .delete()
        .eq('id', groupId)
        .eq('user_id', userId)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TagGroupServiceError('NOT_FOUND', 'Tag group not found')
        }
        throw new TagGroupServiceError('DELETE_FAILED', `Failed to delete tag group: ${error.message}`)
      }
    },

    /**
     * タググループの並び順を一括更新
     */
    async reorder(options: ReorderTagGroupsOptions): Promise<TagGroup[]> {
      const { userId, groupIds } = options

      if (!groupIds || groupIds.length === 0) {
        throw new TagGroupServiceError('INVALID_INPUT', 'At least one group ID is required')
      }

      // 各グループのsort_orderを更新
      const updates = groupIds.map((groupId, index) => {
        return supabase
          .from('tag_groups')
          .update({ sort_order: index })
          .eq('id', groupId)
          .eq('user_id', userId)
          .select()
          .single()
      })

      const results = await Promise.all(updates)

      // エラーチェック
      const errors = results.filter((result) => result.error)
      if (errors.length > 0) {
        throw new TagGroupServiceError(
          'REORDER_FAILED',
          `Failed to reorder tag groups: ${errors[0]!.error!.message}`,
        )
      }

      const updatedGroups = results.map((result) => result.data).filter(Boolean) as TagGroup[]
      return updatedGroups
    },
  }
}
