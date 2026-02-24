/**
 * Tags Feature - Public API
 *
 * タグ機能の統一的なエントリーポイント。
 * 外部からのインポートはこのファイル経由で行う。
 *
 * @example
 * ```tsx
 * // ✅ 推奨: バレルファイル経由
 * import { TagBadge, useTags } from '@/features/tags'
 *
 * // ❌ 非推奨: 深いパス指定
 * import { TagBadge } from '@/features/tags/components/tag-badge'
 * import { useTags } from '@/features/tags/hooks'
 * ```
 */

// Components
export {
  GlobalTagCreateModal,
  TagBadge,
  // Modals & Dialogs
  TagCreateModal,
} from './components';

// Hooks
export {
  tagKeys,
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useOptimisticTagUpdate,
  useRenameTag,
  useTag,
  // Operations
  useTagOperations,
  // Realtime
  useTagRealtime,
  // Tags CRUD
  useTags,
  useUpdateTag,
  useUpdateTagColor,
} from './hooks';

// Constants - Colors
export { DEFAULT_TAG_COLOR, TAG_COLOR_PALETTE, TAG_PRESET_COLORS } from './constants/colors';

// Types
export type {
  CreateTagInput,
  Tag,
  TagFilter,
  TagOption,
  TagSortField,
  TagSortOptions,
  TagSortOrder,
  TagWithChildren,
  UpdateTagInput,
} from './types';
