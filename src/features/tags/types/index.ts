// タグシステムの型定義
// Canonical definitions are in @/core/types/tag.
// Re-exported here for backward compatibility.

export type {
  CreateTagInput,
  Tag,
  TagError,
  TagFilter,
  TagMutationResult,
  TagSortField,
  TagSortOptions,
  TagSortOrder,
  TagsResponse,
  UpdateTagInput,
} from '@/core/types/tag';

// タグ選択用（UI コンポーネントで使用）
export interface TagOption {
  value: string;
  label: string;
  color: string | null;
  disabled?: boolean | undefined;
}
