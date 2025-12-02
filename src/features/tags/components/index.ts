/**
 * Tags Components - Public API
 *
 * @example
 * ```tsx
 * import { TagsSidebar, TagSelector, TagBadge } from '@/features/tags/components'
 * ```
 */

// Main components
export { TagsSidebar } from './TagsSidebar'
export { TagsSidebarWrapper } from './TagsSidebarWrapper'
export { TagsPageHeader } from './TagsPageHeader'
export { TagsSelectionBar } from './TagsSelectionBar'

// Selection & Display
export { TagSelector } from './tag-selector'
export { TagBadge } from './tag-badge'
export { TagsList } from './tags-list'
export { TagTreeView } from './tag-tree-view'
export { TagFilter, TagChip, TagFilterChips } from './tag-filter'

// Groups
export { TagGroupsSection } from './tag-groups-section'
export type { TagGroupsSectionRef } from './tag-groups-section'
export { SortableGroupItem } from './SortableGroupItem'
export { GroupNameWithTooltip } from './GroupNameWithTooltip'

// Modals & Dialogs
export { TagCreateModal } from './tag-create-modal'
export { TagEditModal } from './tag-edit-modal'
export { TagEditDialog } from './tag-edit-dialog'
export { TagDeleteDialog } from './TagDeleteDialog'
export { TagArchiveDialog } from './TagArchiveDialog'
export { TagManagementModal } from './tag-management-modal'
export { QuickTagCreateModal } from './quick-tag-create-modal'
export { TagGroupCreateModal } from './tag-group-create-modal'
export { TagGroupDeleteDialog } from './tag-group-delete-dialog'

// Actions
export { TagActionMenuItems } from './TagActionMenuItems'
export { TagSelectionActions } from './TagSelectionActions'
