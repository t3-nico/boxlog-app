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
  // Main
  TagsSidebar,
  TagsSidebarWrapper,
  TagsPageHeader,
  TagsSelectionBar,
  // Selection & Display
  TagSelector,
  TagBadge,
  TagsList,
  TagTreeView,
  TagFilter,
  TagChip,
  TagFilterChips,
  // Groups
  TagGroupsSection,
  SortableGroupItem,
  GroupNameWithTooltip,
  // Modals & Dialogs
  TagCreateModal,
  TagEditModal,
  TagEditDialog,
  TagDeleteDialog,
  TagArchiveDialog,
  TagManagementModal,
  QuickTagCreateModal,
  TagGroupCreateModal,
  TagGroupDeleteDialog,
  // Actions
  TagActionMenuItems,
  TagSelectionActions,
} from './components'

export type { TagGroupsSectionRef } from './components'

// Hooks
export {
  // Tags CRUD
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
  // Tag Groups
  useTagGroups,
  useTagGroup,
  useCreateTagGroup,
  useUpdateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  tagGroupKeys,
  // Tag Group DnD
  useTagGroupsDnd,
  // Item Tags
  useItemTags,
  useItemTagsByItem,
  useItemsByTags,
  useCreateItemTag,
  useBatchUpdateItemTags,
  useDeleteItemTag,
  useItemTagsOptimisticUpdate,
  itemTagsKeys,
  // Operations
  useTagOperations,
  // Stats
  useTagStats,
  useTagUsageCounts,
  useSidebarTags,
  useTagExpandedState,
  useTagItemAnimation,
  useTagStatsDebug,
  tagStatsKeys,
  // Realtime
  useTagRealtime,
} from './hooks'

// Stores
export { useTagStore, tagColors, colorCategories } from './stores'

// Constants
export {
  TAG_PRESET_COLORS,
  TAG_COLOR_PALETTE,
  DEFAULT_TAG_COLOR,
  tagIconMapping,
  tagIconCategories,
} from './constants'

export type { TagIconName } from './constants'

// Context
export { TagsPageProvider, useTagsPageContext } from './contexts/TagsPageContext'

// Types
export type {
  Tag,
  TagWithChildren,
  TagGroup,
  TagLevel,
  CreateTagInput,
  UpdateTagInput,
  TagUsage,
  TagUsageStats,
  TagOption,
  TagFilter,
  TagSortField,
  TagSortOrder,
  TagSortOptions,
} from './types'
