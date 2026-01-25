/**
 * Tags Hooks - Public API
 *
 * @example
 * ```tsx
 * import { useTags, useTagGroups, useCreateTag } from '@/features/tags/hooks'
 * ```
 */

// Tags Query Keys
export { tagKeys } from './tagQueryKeys';

// Tags Query Hooks
export { useTag, useTags } from './useTagsQuery';

// Tags Mutation Hooks
export {
  useCreateTag,
  useDeleteTag,
  useMergeTag,
  useMoveTag,
  useRenameTag,
  useReorderTags,
  useUpdateTag,
  useUpdateTagColor,
} from './useTagsMutations';
export type { ReorderTagInput } from './useTagsMutations';

// Tags Optimistic Helpers (Legacy)
export { useOptimisticTagUpdate } from './useTagsOptimistic';

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

// Realtime
export { useTagRealtime } from './useTagRealtime';
