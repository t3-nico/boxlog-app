// Smart Folders システムのZodバリデーションスキーマ

import { z } from 'zod'

// ルールフィールドのスキーマ
export const smartFolderRuleFieldSchema = z.enum([
  'tag',
  'created_date',
  'updated_date',
  'status',
  'priority',
  'is_favorite',
  'due_date',
  'title',
  'description'
])

// ルール演算子のスキーマ
export const smartFolderRuleOperatorSchema = z.enum([
  'contains',
  'not_contains',
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'greater_equal',
  'less_equal',
  'starts_with',
  'ends_with',
  'is_empty',
  'is_not_empty'
])

// ルールロジックのスキーマ
export const smartFolderRuleLogicSchema = z.enum(['AND', 'OR'])

// ルール値のスキーマ（ユニオン型）
export const smartFolderRuleValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.date(),
  z.null()
])

// スマートフォルダルールのスキーマ
export const smartFolderRuleSchema = z.object({
  field: smartFolderRuleFieldSchema,
  operator: smartFolderRuleOperatorSchema,
  value: smartFolderRuleValueSchema,
  logic: smartFolderRuleLogicSchema
})

// スマートフォルダ作成用のスキーマ
export const createSmartFolderSchema = z.object({
  name: z.string()
    .min(1, 'フォルダ名は必須です')
    .max(100, 'フォルダ名は100文字以内で入力してください'),
  description: z.string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  rules: z.array(smartFolderRuleSchema)
    .max(20, 'ルールは20個まで設定できます'),
  icon: z.string()
    .max(10, 'アイコンは10文字以内で入力してください')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, '色は16進数形式（#RRGGBB）で入力してください')
    .optional()
    .default('#3B82F6'),
  orderIndex: z.number()
    .int()
    .min(0)
    .optional()
    .default(0)
})

// スマートフォルダ更新用のスキーマ
export const updateSmartFolderSchema = z.object({
  name: z.string()
    .min(1, 'フォルダ名は必須です')
    .max(100, 'フォルダ名は100文字以内で入力してください')
    .optional(),
  description: z.string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  rules: z.array(smartFolderRuleSchema)
    .max(20, 'ルールは20個まで設定できます')
    .optional(),
  isActive: z.boolean().optional(),
  icon: z.string()
    .max(10, 'アイコンは10文字以内で入力してください')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, '色は16進数形式（#RRGGBB）で入力してください')
    .optional(),
  orderIndex: z.number()
    .int()
    .min(0)
    .optional()
})

// スマートフォルダ（データベース形式）のスキーマ
export const smartFolderRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  user_id: z.string().uuid(),
  rules: z.array(smartFolderRuleSchema),
  is_active: z.boolean(),
  order_index: z.number(),
  icon: z.string().nullable(),
  color: z.string(),
  is_system: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
})

// スマートフォルダ（アプリケーション形式）のスキーマ
export const smartFolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  userId: z.string().uuid(),
  rules: z.array(smartFolderRuleSchema),
  isActive: z.boolean(),
  orderIndex: z.number(),
  icon: z.string().optional(),
  color: z.string(),
  isSystem: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taskCount: z.number().optional()
})

// ルール構築用のスキーマ
export const ruleBuilderSchema = z.object({
  field: smartFolderRuleFieldSchema,
  operator: smartFolderRuleOperatorSchema,
  value: smartFolderRuleValueSchema
})

// フィルタリング結果のスキーマ
export const smartFolderFilterResultSchema = z.object({
  items: z.array(z.unknown()),
  totalCount: z.number(),
  folderId: z.string().uuid()
})

// プリセットルールのスキーマ
export const presetRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rules: z.array(smartFolderRuleSchema),
  icon: z.string(),
  color: z.string()
})

// エクスポート用のスキーマ
export const smartFolderExportSchema = smartFolderSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  taskCount: true
})

// インポート用のスキーマ
export const smartFolderImportSchema = smartFolderExportSchema.omit({
  isSystem: true
})

// バルク操作用のスキーマ
export const bulkUpdateSmartFoldersSchema = z.object({
  folderIds: z.array(z.string().uuid()).min(1, '少なくとも1つのフォルダを選択してください'),
  updates: updateSmartFolderSchema
})

export const bulkDeleteSmartFoldersSchema = z.object({
  folderIds: z.array(z.string().uuid()).min(1, '少なくとも1つのフォルダを選択してください')
})

// 並び替え用のスキーマ
export const reorderSmartFoldersSchema = z.object({
  folderOrders: z.array(z.object({
    id: z.string().uuid(),
    orderIndex: z.number().int().min(0)
  })).min(1, '少なくとも1つのフォルダが必要です')
})

// 検索用のスキーマ
export const searchSmartFoldersSchema = z.object({
  query: z.string().optional(),
  isActive: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'order_index']).optional().default('order_index'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

// ルール評価用のスキーマ
export const evaluateRulesSchema = z.object({
  rules: z.array(smartFolderRuleSchema),
  item: z.unknown(),
  context: z.object({
    now: z.date().optional(),
    userTimeZone: z.string().optional()
  }).optional()
})

// 統計情報のスキーマ
export const smartFolderStatsSchema = z.object({
  totalFolders: z.number(),
  activeFolders: z.number(),
  systemFolders: z.number(),
  userFolders: z.number(),
  totalTasks: z.number(),
  averageTasksPerFolder: z.number()
})

// バリデーション関数のエクスポート
export type CreateSmartFolderInput = z.infer<typeof createSmartFolderSchema>
export type UpdateSmartFolderInput = z.infer<typeof updateSmartFolderSchema>
export type SmartFolderRule = z.infer<typeof smartFolderRuleSchema>
export type SmartFolder = z.infer<typeof smartFolderSchema>
export type SmartFolderRow = z.infer<typeof smartFolderRowSchema>
export type RuleBuilder = z.infer<typeof ruleBuilderSchema>
export type PresetRule = z.infer<typeof presetRuleSchema>
export type SmartFolderExport = z.infer<typeof smartFolderExportSchema>
export type SmartFolderImport = z.infer<typeof smartFolderImportSchema>
export type SearchSmartFoldersInput = z.infer<typeof searchSmartFoldersSchema>
export type SmartFolderStats = z.infer<typeof smartFolderStatsSchema>