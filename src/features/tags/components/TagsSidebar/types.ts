/**
 * TagsSidebar 型定義
 */

/** グループソートの種類 */
export type GroupSortType =
  | 'manual'
  | 'nameAsc'
  | 'nameDesc'
  | 'createdAsc'
  | 'createdDesc'
  | 'tagCountDesc'
  | 'tagCountAsc';

export interface TagsSidebarProps {
  onAllTagsClick: () => void;
  isLoading?: boolean | undefined;
  activeTagsCount?: number | undefined;
  archivedTagsCount?: number | undefined;
  externalIsCreating?: boolean | undefined;
}

export const SORT_OPTIONS = [
  'manual',
  'nameAsc',
  'nameDesc',
  'createdAsc',
  'createdDesc',
  'tagCountDesc',
  'tagCountAsc',
] as const;
