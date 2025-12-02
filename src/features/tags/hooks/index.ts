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
  useTags,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useMoveTag,
  useRenameTag,
  useUpdateTagColor,
  useOptimisticTagUpdate,
  tagKeys,
} from './use-tags'

// Tag Groups
export {
  useTagGroups,
  useTagGroup,
  useCreateTagGroup,
  useUpdateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  tagGroupKeys,
} from './use-tag-groups'

// Tag Group DnD
export { useTagGroupsDnd } from './use-tag-groups-dnd'

// Item Tags (Plan, Task etc.)
export {
  useItemTags,
  useItemTagsByItem,
  useItemsByTags,
  useCreateItemTag,
  useBatchUpdateItemTags,
  useDeleteItemTag,
  useItemTagsOptimisticUpdate,
  itemTagsKeys,
} from './use-item-tags'

// Tag Operations
export { useTagOperations } from './use-tag-operations'

// Tag Stats
export {
  useTagStats,
  useTagUsageCounts,
  useSidebarTags,
  useTagExpandedState,
  useTagItemAnimation,
  useTagStatsDebug,
  tagStatsKeys,
} from './use-tag-stats'

// Realtime
export { useTagRealtime } from './useTagRealtime'
