// タグシステムの型定義（フラット構造：グループ → タグ）

export interface Tag {
  id: string;
  name: string;
  user_id: string | null;
  color: string | null;
  tag_number: number;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  group_id: string | null;
  sort_order?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// タググループ
export interface TagGroup {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  group_number: number;
  description: string | null;
  color: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// タグ作成用入力型
export interface CreateTagInput {
  name: string;
  color: string;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  group_id?: string | null | undefined;
}

// タグ更新用入力型
export interface UpdateTagInput {
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  is_active?: boolean | undefined;
  group_id?: string | null | undefined;
  sort_order?: number | undefined;
}

// タググループ作成用入力型
export interface CreateTagGroupInput {
  name: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  sort_order?: number;
}

// タググループ更新用入力型
export interface UpdateTagGroupInput {
  name?: string;
  description?: string | null;
  color?: string | null;
  sort_order?: number;
}

// タグ使用状況
export interface TagUsage {
  planCount: number;
  eventCount: number;
  taskCount: number;
  totalCount: number;
}

// タグ関連付け
export type EntityType = 'task' | 'event' | 'record';

export interface TagAssociation {
  id: string;
  tag_id: string;
  entity_type: EntityType;
  entity_id: string;
  user_id: string;
  created_at: Date;
}

// タグ関連付け作成用
export interface CreateTagAssociationInput {
  tag_id: string;
  entity_type: EntityType;
  entity_id: string;
}

// タグ使用統計
export interface TagUsageStats {
  id: string;
  name: string;
  color: string | null;
  usage_count: number;
  task_count: number;
  event_count: number;
  record_count: number;
  last_used_at: Date | null;
}

// タグ選択用（UI コンポーネントで使用）
export interface TagOption {
  value: string;
  label: string;
  color: string | null;
  groupId?: string | null;
  disabled?: boolean;
}

// タグフィルター用
export interface TagFilter {
  group_id?: string | null;
  search?: string;
  is_active?: boolean;
}

// タグ並び替え用
export type TagSortField = 'name' | 'created_at' | 'usage_count' | 'sort_order';
export type TagSortOrder = 'asc' | 'desc';

export interface TagSortOptions {
  field: TagSortField;
  order: TagSortOrder;
}

// グループに所属するタグを含むグループ型
export interface TagGroupWithTags extends TagGroup {
  tags: Tag[];
  totalPlans?: number;
}

// API レスポンス型
export interface TagsResponse {
  data: Tag[];
  count: number;
  has_more: boolean;
}

export interface TagGroupsResponse {
  data: TagGroup[];
  count: number;
}

export interface TagGroupWithTagsResponse {
  data: TagGroupWithTags[];
  count: number;
}

// エラー型
export interface TagError {
  code: string;
  message: string;
  field?: string;
}

// タグ作成/更新結果
export interface TagMutationResult {
  success: boolean;
  data?: Tag;
  error?: TagError;
}

// バルク操作用
export interface BulkTagOperation {
  action: 'create' | 'update' | 'delete';
  tag_ids?: string[];
  data?: Partial<Tag>;
}

export interface BulkTagResult {
  success: boolean;
  processed: number;
  errors: TagError[];
}

// タグインポート/エクスポート用
export interface TagExportData {
  tags: Tag[];
  associations: TagAssociation[];
  exported_at: Date;
  user_id: string;
}

export interface TagImportOptions {
  merge_existing: boolean;
  preserve_ids: boolean;
  update_existing: boolean;
}

export interface TagImportResult {
  success: boolean;
  imported_count: number;
  skipped_count: number;
  errors: TagError[];
}

// タグ検索結果
export interface TagSearchResult {
  tag: Tag;
  matches: {
    name: boolean;
    description: boolean;
  };
  score: number;
}

// タグ提案用
export interface TagSuggestion {
  tag: Tag;
  reason: 'frequently_used' | 'similar_context';
  confidence: number;
}

// タグ統計情報
export interface TagStatistics {
  total_tags: number;
  most_used_tags: TagUsageStats[];
  recent_tags: Tag[];
  inactive_tags: Tag[];
}

// タグバリデーション結果
export interface TagValidationResult {
  valid: boolean;
  errors: TagError[];
  warnings: string[];
}

// タグマージ用
export interface TagMergeOptions {
  source_tag_id: string;
  target_tag_id: string;
  merge_associations: boolean;
  delete_source: boolean;
}

export interface TagMergeResult {
  success: boolean;
  merged_associations: number;
  errors: TagError[];
}

// 後方互換性のための型エイリアス（段階的に削除予定）
/** @deprecated フラット構造に移行。Tagを直接使用してください */
export type TagWithChildren = Tag;
