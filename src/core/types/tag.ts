// Core Tag type definitions
// Extracted from features/tags/types for cross-feature usage

import type { TagColorName } from '@/lib/tag-colors';

export interface Tag {
  id: string;
  /** タグ名。コロン記法で2階層を表現（例: "開発:api"） */
  name: string;
  user_id: string | null;
  color: string | null;
  is_active: boolean;
  sort_order?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// タグ作成用入力型
export interface CreateTagInput {
  name: string;
  color: TagColorName;
}

// タグ更新用入力型
export interface UpdateTagInput {
  name?: string | undefined;
  color?: TagColorName | undefined;
  is_active?: boolean | undefined;
  sort_order?: number | undefined;
}

// タグフィルター用
export interface TagFilter {
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

// API レスポンス型
export interface TagsResponse {
  data: Tag[];
  count: number;
  has_more: boolean;
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
