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
  useTag,
  useTagUsage,
  useTags,
  useUpdateTag,
  useUpdateTagColor,
} from './use-tags';

// Tag Groups
export {
  tagGroupKeys,
  useCreateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  useTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from './use-tag-groups';

// Tag Group DnD
export { useTagGroupsDnd } from './use-tag-groups-dnd';

// Item Tags (Plan, Task etc.)
export {
  itemTagsKeys,
  useBatchUpdateItemTags,
  useCreateItemTag,
  useDeleteItemTag,
  useItemTags,
  useItemTagsByItem,
  useItemTagsOptimisticUpdate,
  useItemsByTags,
} from './use-item-tags';

// Tag Operations
export { useTagOperations } from './use-tag-operations';

// Tag Stats
export {
  tagStatsKeys,
  useSidebarTags,
  useTagExpandedState,
  useTagStats,
  useTagUsageCounts,
} from './use-tag-stats';

// Realtime
export { useTagRealtime } from './useTagRealtime';

// Table Columns
export { getTagColumnSettings, useTagTableColumns } from './useTagTableColumns';
