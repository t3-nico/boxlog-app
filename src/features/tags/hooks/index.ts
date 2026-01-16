/**
 * Tags Hooks - Public API
 *
 * @example
 * ```tsx
 * import { useTags, useTagGroups, useCreateTag } from '@/features/tags/hooks'
 * ```
 */

// Tags CRUD
export {
  tagKeys,
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useReorderTags,
  useTag,
  useTags,
  useUpdateTag,
  useUpdateTagColor,
} from './useTags';
export type { ReorderTagInput } from './useTags';

// Tag Groups
export {
  tagGroupKeys,
  useCreateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  useTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from './useTagGroups';

// Tag Operations
export { useTagOperations } from './useTagOperations';

// Tags Page Data (パフォーマンス最適化用)
export { useTagsPageData } from './useTagsPageData';

// Realtime
export { useTagRealtime } from './useTagRealtime';
