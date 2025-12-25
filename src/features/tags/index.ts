/**
 * Tags Feature - Public API
 *
 * タグ機能の統一的なエントリーポイント。
 * 外部からのインポートはこのファイル経由で行う。
 *
 * @example
 * ```tsx
 * // ✅ 推奨: バレルファイル経由
 * import { TagsSidebar, useTags, useTagStore } from '@/features/tags'
 *
 * // ❌ 非推奨: 深いパス指定
 * import { TagsSidebar } from '@/features/tags/components/TagsSidebar'
 * import { useTags } from '@/features/tags/hooks/use-tags'
 * ```
 */

// Components
export {
  GroupNameWithTooltip,
  QuickTagCreateModal,
  SortableGroupItem,
  // Actions
  TagActionMenuItems,
  TagArchiveDialog,
  TagBadge,
  TagChip,
  // Modals & Dialogs
  TagCreateModal,
  TagDeleteDialog,
  TagEditDialog,
  TagEditModal,
  TagFilterChips,
  TagFilter as TagFilterComponent,
  TagGroupCreateModal,
  TagGroupDeleteDialog,
  // Groups
  TagGroupsSection,
  TagManagementModal,
  TagSelectionActions,
  // Selection & Display
  TagSelector,
  TagTreeView,
  TagsList,
  TagsSelectionBar,
  // Main
  TagsSidebar,
  TagsSidebarWrapper,
} from './components';

export type { TagGroupsSectionRef } from './components';

// Hooks
export {
  itemTagsKeys,
  tagGroupKeys,
  tagKeys,
  tagStatsKeys,
  useBatchUpdateItemTags,
  useCreateItemTag,
  useCreateTag,
  useCreateTagGroup,
  useDeleteItemTag,
  useDeleteTag,
  useDeleteTagGroup,
  // Item Tags
  useItemTags,
  useItemTagsByItem,
  useItemTagsOptimisticUpdate,
  useItemsByTags,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useReorderTagGroups,
  useSidebarTags,
  useTag,
  useTagExpandedState,
  useTagGroup,
  // Tag Groups
  useTagGroups,
  // Tag Group DnD
  useTagGroupsDnd,
  // Operations
  useTagOperations,
  // Realtime
  useTagRealtime,
  // Stats
  useTagStats,
  useTagUsageCounts,
  // Tags CRUD
  useTags,
  useUpdateTag,
  useUpdateTagColor,
  useUpdateTagGroup,
} from './hooks';

// Stores
export { colorCategories, tagColors, useTagStore } from './stores';

// Constants
export {
  DEFAULT_TAG_COLOR,
  TAG_COLOR_PALETTE,
  TAG_PRESET_COLORS,
  tagIconCategories,
  tagIconMapping,
} from './constants';

export type { TagIconName } from './constants';

// Context
export { TagsPageProvider, useTagsPageContext } from './contexts/TagsPageContext';

// Types
export type {
  CreateTagInput,
  Tag,
  TagFilter,
  TagGroup,
  TagOption,
  TagSortField,
  TagSortOptions,
  TagSortOrder,
  TagUsage,
  TagUsageStats,
  TagWithChildren,
  UpdateTagInput,
} from './types';
