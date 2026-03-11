/**
 * Tags Feature - Public API
 *
 * タグ機能の統一的なエントリーポイント。
 * 外部からのインポートはこのファイル経由で行う。
 */

// Components
export {
  GlobalTagCreateModal,
  // Modals & Dialogs
  TagCreateModal,
} from './components';
export { TagQuickSelector } from './components/TagQuickSelector';
export { TagRadioItem } from './components/TagRadioItem';

// Hooks
export {
  tagKeys,
  useCreateTag,
  useDeleteTag,
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
export { DEFAULT_TAG_COLOR, TAG_COLOR_PALETTE } from './constants/colors';

// Types
export type {
  CreateTagInput,
  Tag,
  TagFilter,
  TagOption,
  TagSortField,
  TagSortOptions,
  TagSortOrder,
  UpdateTagInput,
} from './types';
