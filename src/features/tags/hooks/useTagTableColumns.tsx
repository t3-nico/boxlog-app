'use client';

import { Calendar, FileText, Folder, Hash } from 'lucide-react';
import { useMemo } from 'react';

import type { ColumnDef } from '@/components/common/table';
import { TagCellContent } from '@/features/tags/components/table';
import type { TagColumnId } from '@/features/tags/stores/useTagColumnStore';
import type { Tag, TagGroup } from '@/features/tags/types';

interface UseTagTableColumnsParams {
  groups: TagGroup[];
  allTags: Tag[];
  planCounts: Record<string, number>;
  lastUsed: Record<string, string>;
  visibleColumns: { id: string; width: number }[];
  t: (key: string) => string;
}

/**
 * Hook to generate tag table column definitions
 */
export function useTagTableColumns({
  groups,
  allTags,
  planCounts,
  lastUsed,
  visibleColumns,
  t,
}: UseTagTableColumnsParams): ColumnDef<Tag>[] {
  return useMemo(() => {
    const allColumnDefs: ColumnDef<Tag>[] = [
      {
        id: 'id',
        label: 'ID',
        width: 80,
        resizable: true,
        sortKey: 'tag_number',
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="id"
            groups={groups}
            allTags={allTags}
            planCounts={planCounts}
            lastUsed={lastUsed}
          />
        ),
      },
      {
        id: 'name',
        label: t('tags.page.name'),
        width: 200,
        resizable: true,
        sortKey: 'name',
        icon: Hash,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="name"
            groups={groups}
            allTags={allTags}
            planCounts={planCounts}
            lastUsed={lastUsed}
          />
        ),
      },
      {
        id: 'description',
        label: t('tags.page.description'),
        width: 300,
        resizable: true,
        icon: FileText,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="description"
            groups={groups}
            allTags={allTags}
            planCounts={planCounts}
            lastUsed={lastUsed}
          />
        ),
      },
      {
        id: 'group',
        label: t('tags.sidebar.groups'),
        width: 150,
        resizable: true,
        sortKey: 'group',
        icon: Folder,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="group"
            groups={groups}
            allTags={allTags}
            planCounts={planCounts}
            lastUsed={lastUsed}
          />
        ),
      },
      {
        id: 'created_at',
        label: t('tags.page.createdAt'),
        width: 150,
        resizable: true,
        sortKey: 'created_at',
        icon: Calendar,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="created_at"
            groups={groups}
            allTags={allTags}
            planCounts={planCounts}
            lastUsed={lastUsed}
          />
        ),
      },
      {
        id: 'last_used',
        label: t('tags.page.lastUsed'),
        width: 150,
        resizable: true,
        sortKey: 'last_used',
        icon: Calendar,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="last_used"
            groups={groups}
            allTags={allTags}
            planCounts={planCounts}
            lastUsed={lastUsed}
          />
        ),
      },
    ];

    // Filter to visible columns only
    const visibleColumnIds = visibleColumns.filter((c) => c.id !== 'selection').map((c) => c.id);
    return allColumnDefs.filter((col) => visibleColumnIds.includes(col.id as TagColumnId));
  }, [t, groups, allTags, planCounts, lastUsed, visibleColumns]);
}

/**
 * Column settings for visibility toggle
 */
export function getTagColumnSettings(
  t: (key: string) => string,
): { id: TagColumnId; label: string }[] {
  return [
    { id: 'id', label: 'ID' },
    { id: 'description', label: t('tags.page.description') },
    { id: 'group', label: t('tags.sidebar.groups') },
    { id: 'created_at', label: t('tags.page.createdAt') },
    { id: 'last_used', label: t('tags.page.lastUsed') },
  ];
}
