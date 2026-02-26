// タグシステムの型定義（親子構造：Tag → Tag）
// Canonical definitions are in @/core/types/tag.
// Re-exported here for backward compatibility.

export type {
  CreateTagInput,
  Tag,
  TagError,
  TagFilter,
  TagHierarchyResponse,
  TagMutationResult,
  TagOption,
  TagSortField,
  TagSortOptions,
  TagSortOrder,
  TagWithChildren,
  TagsResponse,
  UpdateTagInput,
} from '@/core/types/tag';
