/**
 * Tags Components - Public API
 *
 * @example
 * ```tsx
 * import { TagSelector, TagBadge, TagsPageClient } from '@/features/tags/components'
 * ```
 */

// Main components
export { TagsSelectionBar } from './TagsSelectionBar';

// Selection & Display
export { TagBadge } from './tag-badge';
export { TagChip, TagFilter, TagFilterChips } from './tag-filter';
export { TagSelector } from './tag-selector';
export { TagTreeView } from './tag-tree-view';
export { TagsList } from './tags-list';

// Groups
export { GroupNameWithTooltip } from './GroupNameWithTooltip';
export { SortableGroupItem } from './SortableGroupItem';
export { TagGroupsSection } from './tag-groups-section';
export type { TagGroupsSectionRef } from './tag-groups-section';

// Modals & Dialogs
export { GlobalTagCreateModal } from './GlobalTagCreateModal';
export { QuickTagCreateModal } from './quick-tag-create-modal';
export { TagCreateModal } from './tag-create-modal';
export { TagEditDialog } from './tag-edit-dialog';
export { TagEditModal } from './tag-edit-modal';
export { TagGroupCreateModal } from './tag-group-create-modal';
export { TagGroupDeleteDialog } from './tag-group-delete-dialog';
export { TagManagementModal } from './tag-management-modal';
export { TagArchiveDialog } from './TagArchiveDialog';
export { TagDeleteDialog } from './TagDeleteDialog';
export { TagsDialogs } from './TagsDialogs';

// Actions
export { TagActionMenuItems } from './TagActionMenuItems';
export { TagSelectionActions } from './TagSelectionActions';

// Filter Bar
export { TagsFilterBar } from './TagsFilterBar';
export { TagsSettingsContent } from './TagsSettingsContent';
