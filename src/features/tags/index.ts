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
  // Modals & Dialogs
  TagCreateModal,
  TagEditDialog,
  TagSelectionActions,
  // Selection & Display
  TagSelector,
  TagsList,
  TagsSelectionBar,
} from './components';

// Hooks
export {
  tagGroupKeys,
  tagKeys,
  useCreateTag,
  useCreateTagGroup,
  useDeleteTag,
  useDeleteTagGroup,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useReorderTagGroups,
  useTag,
  useTagGroup,
  // Tag Groups
  useTagGroups,
  // Operations
  useTagOperations,
  // Realtime
  useTagRealtime,
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
