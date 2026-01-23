// タグシステムの型定義（親子構造：Tag → Tag）

export interface Tag {
  id: string;
  name: string;
  user_id: string | null;
  color: string | null;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  /** 親タグのID。nullの場合はルートレベル。1階層のみサポート。 */
  parent_id: string | null;
  sort_order?: number | null;
  created_at: string | null;
  updated_at: string | null;
  /** フロントエンド用：子タグの配列（listHierarchyで使用） */
  children?: Tag[] | undefined;
}

/**
 * @deprecated TagGroup は廃止されました。Tag の親子関係を使用してください。
 * 後方互換性のため Tag のエイリアスとして残しています。
 */
export type TagGroup = Tag;

// タグ作成用入力型
export interface CreateTagInput {
  name: string;
  color: string;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
  groupId?: string | null | undefined;
  /** @deprecated use parentId instead */
  group_id?: string | null | undefined;
}

// タグ更新用入力型
export interface UpdateTagInput {
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  is_active?: boolean | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
  groupId?: string | null | undefined;
  /** @deprecated use parentId instead */
  group_id?: string | null | undefined;
  sort_order?: number | undefined;
}

/**
 * @deprecated TagGroup は廃止されました。CreateTagInput を使用して親タグを作成してください。
 */
export interface CreateTagGroupInput {
  name: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  sort_order?: number;
}

/**
 * @deprecated TagGroup は廃止されました。UpdateTagInput を使用してください。
 */
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
  /** 親タグのID */
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
  groupId?: string | null | undefined;
  disabled?: boolean | undefined;
}

// タグフィルター用
export interface TagFilter {
  /** 親タグのIDでフィルタ */
  parent_id?: string | null | undefined;
  /** @deprecated use parent_id instead */
  group_id?: string | null | undefined;
  search?: string | undefined;
  is_active?: boolean | undefined;
}

// タグ並び替え用
export type TagSortField = 'name' | 'created_at' | 'usage_count' | 'sort_order';
export type TagSortOrder = 'asc' | 'desc';

export interface TagSortOptions {
  field: TagSortField;
  order: TagSortOrder;
}

/**
 * 親タグとその子タグを含む型
 * @deprecated Tag.children を使用してください
 */
export interface TagGroupWithTags extends Tag {
  tags: Tag[];
  totalPlans?: number | undefined;
}

/** 子タグを含む親タグ */
export interface TagWithChildren extends Tag {
  children: Tag[];
  /** 親タグとその子タグのプラン総数 */
  totalPlans?: number | undefined;
}

// API レスポンス型
export interface TagsResponse {
  data: Tag[];
  count: number;
  has_more: boolean;
}

/**
 * @deprecated TagGroup は廃止されました。TagsResponse を使用してください。
 */
export interface TagGroupsResponse {
  data: Tag[];
  count: number;
}

/**
 * @deprecated TagWithChildren[] を使用してください。
 */
export interface TagGroupWithTagsResponse {
  data: TagWithChildren[];
  count: number;
}

/** 階層構造のタグレスポンス */
export interface TagHierarchyResponse {
  /** 親タグ（子タグを含む） */
  parentTags: TagWithChildren[];
  /** 親を持たないルートタグ */
  rootTags: Tag[];
  /** 総タグ数 */
  count: number;
}

// エラー型
export interface TagError {
  code: string;
  message: string;
  field?: string | undefined;
}

// タグ作成/更新結果
export interface TagMutationResult {
  success: boolean;
  data?: Tag | undefined;
  error?: TagError | undefined;
}

// バルク操作用
export interface BulkTagOperation {
  action: 'create' | 'update' | 'delete';
  tag_ids?: string[] | undefined;
  data?: Partial<Tag> | undefined;
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
