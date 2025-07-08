// タグシステム用Zodバリデーションスキーマ

import { z } from 'zod'
import type { TagLevel, EntityType } from '@/types/tags'

// 基本的なバリデーション定数
const TAG_NAME_MIN_LENGTH = 1
const TAG_NAME_MAX_LENGTH = 50
const TAG_DESCRIPTION_MAX_LENGTH = 200
const TAG_PATH_MAX_LENGTH = 150

// 色のバリデーション（HEX形式）
const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #3B82F6)')
  .default('#6B7280')

// タグレベルのバリデーション
const tagLevelSchema = z
  .number()
  .int()
  .min(0, 'Tag level must be 0, 1, or 2')
  .max(2, 'Tag level must be 0, 1, or 2') as z.ZodType<TagLevel>

// エンティティタイプのバリデーション
const entityTypeSchema = z.enum(['task', 'event', 'record']) as z.ZodType<EntityType>

// UUIDのバリデーション
const uuidSchema = z
  .string()
  .uuid('Must be a valid UUID')

// タグ名のバリデーション
const tagNameSchema = z
  .string()
  .min(TAG_NAME_MIN_LENGTH, `Tag name must be at least ${TAG_NAME_MIN_LENGTH} character`)
  .max(TAG_NAME_MAX_LENGTH, `Tag name must be at most ${TAG_NAME_MAX_LENGTH} characters`)
  .trim()
  .refine(
    (name) => !name.includes('/'),
    'Tag name cannot contain forward slashes'
  )
  .refine(
    (name) => !name.startsWith('#'),
    'Tag name cannot start with #'
  )
  .refine(
    (name) => !/^\s|\s$/.test(name),
    'Tag name cannot start or end with whitespace'
  )

// タグ作成用スキーマ
export const createTagSchema = z.object({
  name: tagNameSchema,
  parent_id: uuidSchema.nullable().optional(),
  color: colorSchema.optional(),
  description: z
    .string()
    .max(TAG_DESCRIPTION_MAX_LENGTH, `Description must be at most ${TAG_DESCRIPTION_MAX_LENGTH} characters`)
    .trim()
    .nullable()
    .optional()
}).refine(
  (data) => {
    // 親IDが指定されている場合の追加検証は実際のAPIで行う
    return true
  },
  {
    message: 'Invalid parent tag relationship'
  }
)

// タグ更新用スキーマ
export const updateTagSchema = z.object({
  name: tagNameSchema.optional(),
  color: colorSchema.optional(),
  description: z
    .string()
    .max(TAG_DESCRIPTION_MAX_LENGTH, `Description must be at most ${TAG_DESCRIPTION_MAX_LENGTH} characters`)
    .trim()
    .nullable()
    .optional(),
  is_active: z.boolean().optional()
})

// タグ関連付け作成用スキーマ
export const createTagAssociationSchema = z.object({
  tag_id: uuidSchema,
  entity_type: entityTypeSchema,
  entity_id: uuidSchema
})

// タグフィルター用スキーマ
export const tagFilterSchema = z.object({
  levels: z.array(tagLevelSchema).optional(),
  parent_id: uuidSchema.nullable().optional(),
  search: z.string().trim().optional(),
  is_active: z.boolean().optional(),
  include_children: z.boolean().default(false).optional()
})

// タグ並び替え用スキーマ
export const tagSortSchema = z.object({
  field: z.enum(['name', 'created_at', 'usage_count', 'level']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc')
})

// ページネーション用スキーマ
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional()
})

// タグ検索用スキーマ
export const tagSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').trim(),
  levels: z.array(tagLevelSchema).optional(),
  include_inactive: z.boolean().default(false),
  exact_match: z.boolean().default(false)
})

// バルク操作用スキーマ
export const bulkTagOperationSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'move']),
  tag_ids: z.array(uuidSchema).optional(),
  data: z.object({
    name: tagNameSchema.optional(),
    color: colorSchema.optional(),
    description: z.string().max(TAG_DESCRIPTION_MAX_LENGTH).nullable().optional(),
    is_active: z.boolean().optional()
  }).optional(),
  new_parent_id: uuidSchema.nullable().optional()
}).refine(
  (data) => {
    if (data.action === 'delete' || data.action === 'move') {
      return data.tag_ids && data.tag_ids.length > 0
    }
    if (data.action === 'update') {
      return data.tag_ids && data.tag_ids.length > 0 && data.data
    }
    if (data.action === 'create') {
      return data.data && data.data.name
    }
    return false
  },
  {
    message: 'Invalid bulk operation parameters'
  }
)

// タグインポート用スキーマ
export const tagImportSchema = z.object({
  tags: z.array(z.object({
    name: tagNameSchema,
    parent_path: z.string().optional(), // 親タグのパス（例: "#work/projecta"）
    color: colorSchema.optional(),
    description: z.string().max(TAG_DESCRIPTION_MAX_LENGTH).nullable().optional()
  })),
  options: z.object({
    merge_existing: z.boolean().default(true),
    preserve_ids: z.boolean().default(false),
    update_existing: z.boolean().default(false)
  }).optional()
})

// タグマージ用スキーマ
export const tagMergeSchema = z.object({
  source_tag_id: uuidSchema,
  target_tag_id: uuidSchema,
  merge_associations: z.boolean().default(true),
  delete_source: z.boolean().default(true)
}).refine(
  (data) => data.source_tag_id !== data.target_tag_id,
  {
    message: 'Source and target tags must be different'
  }
)

// API レスポンス用スキーマ
export const tagResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  parent_id: uuidSchema.nullable(),
  user_id: uuidSchema,
  color: z.string(),
  level: tagLevelSchema,
  path: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
})

export const tagWithChildrenSchema: z.ZodType<any> = tagResponseSchema.extend({
  children: z.lazy(() => z.array(tagWithChildrenSchema)),
  parent: tagResponseSchema.nullable().optional()
})

export const tagHierarchySchema = z.object({
  id: uuidSchema,
  name: z.string(),
  level: tagLevelSchema,
  path: z.string(),
  color: z.string(),
  hierarchy_names: z.array(z.string()),
  hierarchy_ids: z.array(uuidSchema),
  depth: z.number().int(),
  root_name: z.string(),
  level1_name: z.string().nullable(),
  level2_name: z.string().nullable()
})

// カスタムバリデーション関数
export const validateTagHierarchy = (tags: any[], parentId: string | null): boolean => {
  if (!parentId) return true // ルートレベルは常に有効
  
  const parent = tags.find(tag => tag.id === parentId)
  if (!parent) return false
  
  return parent.level < 2 // 親のレベルが2未満である必要がある
}

export const validateTagPath = (path: string): boolean => {
  if (!path.startsWith('#')) return false
  
  const parts = path.slice(1).split('/')
  if (parts.length > 3) return false // 最大3階層
  
  return parts.every(part => part.trim().length > 0)
}

export const validateTagName = (name: string, existingNames: string[] = []): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  try {
    tagNameSchema.parse(name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message))
    }
  }
  
  if (existingNames.includes(name.trim())) {
    errors.push('Tag name already exists')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// エクスポート用の型アサーション
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CreateTagAssociationInput = z.infer<typeof createTagAssociationSchema>
export type TagFilterInput = z.infer<typeof tagFilterSchema>
export type TagSortInput = z.infer<typeof tagSortSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type TagSearchInput = z.infer<typeof tagSearchSchema>
export type BulkTagOperationInput = z.infer<typeof bulkTagOperationSchema>
export type TagImportInput = z.infer<typeof tagImportSchema>
export type TagMergeInput = z.infer<typeof tagMergeSchema>