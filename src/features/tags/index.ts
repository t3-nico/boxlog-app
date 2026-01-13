/**
 * Tags Feature - Public API
 *
 * タグ機能の統一的なエントリーポイント。
 * 外部からのインポートはこのファイル経由で行う。
 *
 * @example
 * ```tsx
 * // ✅ 推奨: バレルファイル経由
 * import { TagSelector, useTags, useTagStore } from '@/features/tags'
 *
 * // ❌ 非推奨: 深いパス指定
 * import { TagSelector } from '@/features/tags/components/tag-selector'
 * import { useTags } from '@/features/tags/hooks/useTags'
 * ```
 */

// Components
export {
  GroupNameWithTooltip,
  QuickTagCreateModal,
  // Actions
  TagActionMenuItems,
  TagArchiveDialog,
  TagBadge,
  TagChip,
  // Modals & Dialogs
  TagCreateModal,
  TagEditDialog,
  TagEditModal,
  TagFilterChips,
  TagFilter as TagFilterComponent,
  TagManagementModal,
  TagSelectionActions,
  // Selection & Display
  TagSelector,
  TagTreeView,
  TagsList,
  TagsSelectionBar,
} from './components';

// Hooks
export {
  tagGroupKeys,
  tagKeys,
  tagStatsKeys,
  useCreateTag,
  useCreateTagGroup,
  useDeleteTag,
  useDeleteTagGroup,
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
export { colorCategories, tagColors, useTagStore } from './stores/useTagStore';

// Constants - Colors
export { DEFAULT_TAG_COLOR, TAG_COLOR_PALETTE, TAG_PRESET_COLORS } from './constants/colors';

// Constants - Icons
export { tagIconCategories, tagIconMapping } from './constants/icons';

export type { TagIconName } from './constants/icons';

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
