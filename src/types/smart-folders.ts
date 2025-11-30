// Smart Folders システムの型定義

// ルールのフィールド種別
export type SmartFolderRuleField =
  | 'tag'
  | 'created_date'
  | 'updated_date'
  | 'status'
  | 'priority'
  | 'is_favorite'
  | 'due_date'
  | 'title'
  | 'description'

// ルールの演算子
export type SmartFolderRuleOperator =
  | 'contains' // 含む
  | 'not_contains' // 含まない
  | 'equals' // 等しい
  | 'not_equals' // 等しくない
  | 'greater_than' // より大きい
  | 'less_than' // より小さい
  | 'greater_equal' // 以上
  | 'less_equal' // 以下
  | 'starts_with' // で始まる
  | 'ends_with' // で終わる
  | 'is_empty' // 空である
  | 'is_not_empty' // 空でない

// ルールのロジック演算子
export type SmartFolderRuleLogic = 'AND' | 'OR'

// ルールの値の型
export type SmartFolderRuleValue = string | number | boolean | Date | null

// スマートフォルダのルール
export interface SmartFolderRule {
  field: SmartFolderRuleField
  operator: SmartFolderRuleOperator
  value: SmartFolderRuleValue
  logic: SmartFolderRuleLogic
}

// スマートフォルダ（データベース形式）
export interface SmartFolderRow {
  id: string
  name: string
  description: string | null
  user_id: string
  rules: SmartFolderRule[]
  is_active: boolean
  order_index: number
  icon: string | null
  color: string
  is_system: boolean
  created_at: string
  updated_at: string
}

// スマートフォルダ（アプリケーション形式）
export interface SmartFolder {
  id: string
  name: string
  description?: string | undefined
  userId: string
  rules: SmartFolderRule[]
  isActive: boolean
  orderIndex: number
  icon?: string | undefined
  color: string
  isSystem: boolean
  createdAt: Date
  updatedAt: Date

  // 計算されるプロパティ
  taskCount?: number | undefined
}

// スマートフォルダ作成用の型
export interface CreateSmartFolderInput {
  name: string
  description?: string | undefined
  rules: SmartFolderRule[]
  icon?: string | undefined
  color?: string | undefined
  orderIndex?: number | undefined
}

// スマートフォルダ更新用の型
export interface UpdateSmartFolderInput {
  name?: string | undefined
  description?: string | undefined
  rules?: SmartFolderRule[] | undefined
  isActive?: boolean | undefined
  icon?: string | undefined
  color?: string | undefined
  orderIndex?: number | undefined
}

// ルール構築用のヘルパー型
export interface RuleBuilder {
  field: SmartFolderRuleField
  operator: SmartFolderRuleOperator
  value: SmartFolderRuleValue
}

// フィルタリング結果
export interface SmartFolderFilterResult<T = unknown> {
  items: T[]
  totalCount: number
  folderId: string
}

// プリセットルール
export interface PresetRule {
  id: string
  name: string
  description: string
  rules: SmartFolderRule[]
  icon: string
  color: string
}

// ルール評価用のコンテキスト
export interface RuleEvaluationContext {
  item: unknown
  now: Date
  userTimeZone: string
}

// スマートフォルダの統計情報
export interface SmartFolderStats {
  totalFolders: number
  activeFolders: number
  systemFolders: number
  userFolders: number
  totalTasks: number
  averageTasksPerFolder: number
}

// エクスポート用の型
export type SmartFolderExport = Omit<SmartFolder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'taskCount'>

// インポート用の型
export type SmartFolderImport = Omit<SmartFolderExport, 'isSystem'>

// データベースとアプリケーション形式の変換用ヘルパー
export const convertSmartFolderRowToSmartFolder = (row: SmartFolderRow): SmartFolder => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  userId: row.user_id,
  rules: row.rules,
  isActive: row.is_active,
  orderIndex: row.order_index,
  icon: row.icon || undefined,
  color: row.color,
  isSystem: row.is_system,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export const convertSmartFolderToSmartFolderRow = (folder: Partial<SmartFolder>): Partial<SmartFolderRow> => {
  const result: Partial<SmartFolderRow> = {}

  if (folder.id !== undefined) result.id = folder.id
  if (folder.name !== undefined) result.name = folder.name
  if (folder.description !== undefined) result.description = folder.description ?? null
  if (folder.userId !== undefined) result.user_id = folder.userId
  if (folder.rules !== undefined) result.rules = folder.rules
  if (folder.isActive !== undefined) result.is_active = folder.isActive
  if (folder.orderIndex !== undefined) result.order_index = folder.orderIndex
  if (folder.icon !== undefined) result.icon = folder.icon ?? null
  if (folder.color !== undefined) result.color = folder.color
  if (folder.isSystem !== undefined) result.is_system = folder.isSystem
  if (folder.createdAt !== undefined) result.created_at = folder.createdAt.toISOString()
  if (folder.updatedAt !== undefined) result.updated_at = folder.updatedAt.toISOString()

  return result
}
