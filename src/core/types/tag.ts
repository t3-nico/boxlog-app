// Core Tag type definitions
// Extracted from features/tags/types for cross-feature usage

export interface Tag {
  id: string;
  name: string;
  user_id: string | null;
  color: string | null;
  description: string | null;
  is_active: boolean;
  /** 親タグのID。nullの場合はルートレベル。1階層のみサポート。 */
  parent_id: string | null;
  sort_order?: number | null;
  created_at: string | null;
  updated_at: string | null;
  /** フロントエンド用：子タグの配列（listHierarchyで使用） */
  children?: Tag[] | undefined;
}

// タグ作成用入力型
export interface CreateTagInput {
  name: string;
  color: string;
  description?: string | null | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
}

// タグ更新用入力型
export interface UpdateTagInput {
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  is_active?: boolean | undefined;
  /** 親タグのID */
  parentId?: string | null | undefined;
  sort_order?: number | undefined;
}

// タグ選択用（UI コンポーネントで使用）
export interface TagOption {
  value: string;
  label: string;
  color: string | null;
  /** 親タグのID */
  parentId?: string | null | undefined;
  disabled?: boolean | undefined;
}

// タグフィルター用
export interface TagFilter {
  /** 親タグのIDでフィルタ */
  parent_id?: string | null | undefined;
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
