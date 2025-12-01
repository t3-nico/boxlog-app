// タグシステムの型定義（Level 0, 1, 2 の3階層）

export type TagLevel = 0 | 1 | 2

export interface Tag {
  id: string
  name: string
  parent_id: string | null
  user_id: string
  color: string
  level: TagLevel
  path: string
  tag_number: number
  description: string | null
  icon: string | null
  is_active: boolean
  group_id: string | null
  created_at: Date
  updated_at: Date
}

// タググループ
export interface TagGroup {
  id: string
  user_id: string
  name: string
  slug: string
  group_number: number
  description: string | null
  color: string | null
  sort_order: number
  created_at: Date
  updated_at: Date
}

// 子タグを含む階層構造
export interface TagWithChildren extends Tag {
  children: TagWithChildren[]
  parent?: Tag | null
}

// 階層表示用（breadcrumb等で使用）
export interface TagHierarchy {
  id: string
  name: string
  level: TagLevel
  path: string
  color: string
  hierarchy_names: string[]
  hierarchy_ids: string[]
  depth: number
  root_name: string
  level1_name: string | null
}

// タグ作成用入力型
export interface CreateTagInput {
  name: string
  color: string
  description?: string | null | undefined
  icon?: string | null | undefined
  parent_id?: string | null | undefined
  level: TagLevel
  group_id?: string | null | undefined
}

// タグ更新用入力型
export interface UpdateTagInput {
  name?: string | undefined
  color?: string | undefined
  description?: string | null | undefined
  icon?: string | null | undefined
  parent_id?: string | null | undefined
  level?: TagLevel | undefined
  is_active?: boolean | undefined
  group_id?: string | null | undefined
}

// タググループ作成用入力型
export interface CreateTagGroupInput {
  name: string
  slug?: string
  description?: string | null
  color?: string | null
  sort_order?: number
}

// タググループ更新用入力型
export interface UpdateTagGroupInput {
  name?: string
  description?: string | null
  color?: string | null
  sort_order?: number
}

// タグ使用状況
export interface TagUsage {
  planCount: number
  eventCount: number
  taskCount: number
  totalCount: number
}

// タグ関連付け
export type EntityType = 'task' | 'event' | 'record'

export interface TagAssociation {
  id: string
  tag_id: string
  entity_type: EntityType
  entity_id: string
  user_id: string
  created_at: Date
}

// タグ関連付け作成用
export interface CreateTagAssociationInput {
  tag_id: string
  entity_type: EntityType
  entity_id: string
}

// タグ使用統計
export interface TagUsageStats {
  id: string
  name: string
  path: string
  level: TagLevel
  color: string
  usage_count: number
  task_count: number
  event_count: number
  record_count: number
  last_used_at: Date | null
}

// タグ選択用（UI コンポーネントで使用）
export interface TagOption {
  value: string
  label: string
  path: string
  level: TagLevel
  color: string
  disabled?: boolean
}

// タグツリー表示用
export interface TagTreeNode {
  tag: Tag
  children: TagTreeNode[]
  isExpanded?: boolean
  hasChildren: boolean
  depth: number
}

// タグフィルター用
export interface TagFilter {
  levels?: TagLevel[]
  parent_id?: string | null
  search?: string
  is_active?: boolean
  include_children?: boolean
}

// タグ並び替え用
export type TagSortField = 'name' | 'created_at' | 'usage_count' | 'level'
export type TagSortOrder = 'asc' | 'desc'

export interface TagSortOptions {
  field: TagSortField
  order: TagSortOrder
}

// グループに所属するタグを含むグループ型
export interface TagGroupWithTags extends TagGroup {
  tags: Tag[]
  totalPlans?: number
}

// API レスポンス型
export interface TagsResponse {
  data: Tag[]
  count: number
  has_more: boolean
}

export interface TagWithChildrenResponse {
  data: TagWithChildren[]
  count: number
}

export interface TagHierarchyResponse {
  data: TagHierarchy[]
  count: number
}

export interface TagGroupsResponse {
  data: TagGroup[]
  count: number
}

export interface TagGroupWithTagsResponse {
  data: TagGroupWithTags[]
  count: number
}

// エラー型
export interface TagError {
  code: string
  message: string
  field?: string
}

// タグ作成/更新結果
export interface TagMutationResult {
  success: boolean
  data?: Tag
  error?: TagError
}

// バルク操作用
export interface BulkTagOperation {
  action: 'create' | 'update' | 'delete' | 'move'
  tag_ids?: string[]
  data?: Partial<Tag>
  new_parent_id?: string | null
}

export interface BulkTagResult {
  success: boolean
  processed: number
  errors: TagError[]
}

// タグインポート/エクスポート用
export interface TagExportData {
  tags: Tag[]
  associations: TagAssociation[]
  exported_at: Date
  user_id: string
}

export interface TagImportOptions {
  merge_existing: boolean
  preserve_ids: boolean
  update_existing: boolean
}

export interface TagImportResult {
  success: boolean
  imported_count: number
  skipped_count: number
  errors: TagError[]
}

// タグ検索結果
export interface TagSearchResult {
  tag: Tag
  matches: {
    name: boolean
    description: boolean
    path: boolean
  }
  score: number
}

// タグ提案用
export interface TagSuggestion {
  tag: Tag
  reason: 'frequently_used' | 'similar_context' | 'hierarchy_completion'
  confidence: number
}

// タグ統計情報
export interface TagStatistics {
  total_tags: number
  tags_by_level: Record<TagLevel, number>
  most_used_tags: TagUsageStats[]
  recent_tags: Tag[]
  inactive_tags: Tag[]
  orphaned_tags: Tag[]
}

// タグバリデーション結果
export interface TagValidationResult {
  valid: boolean
  errors: TagError[]
  warnings: string[]
}

// タグマージ用
export interface TagMergeOptions {
  source_tag_id: string
  target_tag_id: string
  merge_associations: boolean
  delete_source: boolean
}

export interface TagMergeResult {
  success: boolean
  merged_associations: number
  errors: TagError[]
}
