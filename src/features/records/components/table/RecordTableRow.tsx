'use client';

import { FolderOpen, Smile } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { TagSelectCombobox } from '@/features/plans/components/shared/TagSelectCombobox';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { useTableColumnStore, useTableSelectionStore } from '@/features/table';
import { useTagsMap } from '@/features/tags/hooks/useTagsMap';
import { cn } from '@/lib/utils';

import type { RecordItem } from '../../hooks/useRecordData';
import { useRecordMutations } from '../../hooks/useRecordMutations';
import { useRecordTags } from '../../hooks/useRecordTags';
import { useRecordInspectorStore } from '../../stores/useRecordInspectorStore';

interface RecordTableRowProps {
  item: RecordItem;
}

/**
 * 時間をフォーマット（分 → 時間:分）
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}分`;
  }
  return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
}

/**
 * 充実度スコアを色付き絵文字で表示
 */
function FulfillmentScore({ score }: { score: number | null }) {
  if (!score) return <span className="text-muted-foreground">-</span>;

  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-lime-500',
    'text-green-500',
  ];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Smile
          key={i}
          className={cn('size-4', i < score ? colors[score - 1] : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}

/**
 * Record テーブル行コンポーネント
 *
 * PlanTableRow と同様のパターンで動的列管理に対応
 */
export function RecordTableRow({ item }: RecordTableRowProps) {
  const locale = useLocale();
  const { deleteRecord, duplicateRecord } = useRecordMutations();
  const { setRecordTags } = useRecordTags();
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const openInspector = useRecordInspectorStore((state) => state.openInspector);
  const { isSelected, setSelectedIds, getSelectedIds } = useTableSelectionStore();
  const { getVisibleColumns } = useTableColumnStore();
  const { formatDate: formatDateWithSettings } = useDateFormat();
  const { getTagsByIds } = useTagsMap();

  const selected = isSelected(item.id);
  const isInspectorSelected = selectedRecordId === item.id;
  const visibleColumns = getVisibleColumns();

  // タイトル: Record自身のtitle、なければPlanのtitle、それもなければ(タイトルなし)
  const displayTitle = item.title || item.plan?.title || null;

  // タグを取得
  const tags = getTagsByIds(item.tagIds ?? []);

  const handleRowClick = () => {
    openInspector(item.id);
  };

  const handleDelete = async () => {
    if (!window.confirm('このRecordを削除しますか？')) return;
    await deleteRecord.mutateAsync({ id: item.id });
  };

  const handleDuplicate = async () => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    await duplicateRecord.mutateAsync({ id: item.id, worked_at: today });
  };

  const handleCheckboxChange = () => {
    if (selected) {
      const newSelection = Array.from(getSelectedIds()).filter((id) => id !== item.id);
      setSelectedIds(newSelection);
    } else {
      const newSelection = [...Array.from(getSelectedIds()), item.id];
      setSelectedIds(newSelection);
    }
  };

  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      await setRecordTags(item.id, newTagIds);
    },
    [item.id, setRecordTags],
  );

  // 列IDをキーにセルをレンダリング
  const renderCell = (columnId: string) => {
    const column = visibleColumns.find((col) => col.id === columnId);
    const style = column
      ? { width: `${column.width}px`, minWidth: `${column.width}px`, maxWidth: `${column.width}px` }
      : undefined;

    switch (columnId) {
      case 'selection':
        return (
          <TableCell key={columnId} onClick={(e) => e.stopPropagation()} style={style}>
            <Checkbox checked={selected} onCheckedChange={handleCheckboxChange} />
          </TableCell>
        );

      case 'title':
        return (
          <TableCell key={columnId} className="font-normal" style={style}>
            <div className="group flex cursor-pointer items-center overflow-hidden">
              <span
                className={cn(
                  'min-w-0 truncate group-hover:underline',
                  !displayTitle && 'text-muted-foreground',
                )}
              >
                {displayTitle || '(タイトルなし)'}
              </span>
            </div>
          </TableCell>
        );

      case 'plan':
        return (
          <TableCell key={columnId} onClick={(e) => e.stopPropagation()} style={style}>
            {item.plan ? (
              <Link
                href={`/${locale}/plan?selected=${item.plan.id}`}
                className="bg-surface-container hover:bg-state-hover inline-flex max-w-full items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors"
              >
                <FolderOpen className="size-3 shrink-0" />
                <span className="truncate">{item.plan.title}</span>
              </Link>
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            )}
          </TableCell>
        );

      case 'tags':
        return (
          <TableCell
            key={columnId}
            onClick={(e) => e.stopPropagation()}
            className="group hover:bg-state-hover cursor-pointer transition-colors"
            style={style}
          >
            <TagSelectCombobox selectedTagIds={item.tagIds ?? []} onTagsChange={handleTagsChange}>
              <div className="flex gap-1 overflow-hidden">
                {tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="shrink-0 text-xs font-normal"
                    style={tag.color ? { borderColor: tag.color } : undefined}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    +{tags.length - 2}
                  </Badge>
                )}
                {tags.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
              </div>
            </TagSelectCombobox>
          </TableCell>
        );

      case 'worked_at':
        return (
          <TableCell key={columnId} className="font-medium" style={style}>
            {item.worked_at}
          </TableCell>
        );

      case 'duration_minutes':
        return (
          <TableCell key={columnId} className="tabular-nums" style={style}>
            {formatDuration(item.duration_minutes)}
          </TableCell>
        );

      case 'fulfillment_score':
        return (
          <TableCell key={columnId} style={style}>
            <FulfillmentScore score={item.fulfillment_score} />
          </TableCell>
        );

      case 'created_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
            {formatDateWithSettings(new Date(item.created_at))}
          </TableCell>
        );

      case 'updated_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
            {formatDateWithSettings(new Date(item.updated_at))}
          </TableCell>
        );

      default:
        return null;
    }
  };

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <TableRow
          className={cn(
            'hover:bg-state-hover h-12 cursor-pointer transition-colors',
            isInspectorSelected && 'bg-state-selected',
            selected && 'bg-primary-state-selected hover:bg-state-dragged',
          )}
          onClick={handleRowClick}
          onContextMenu={() => {
            if (!selected) {
              setSelectedIds([item.id]);
            }
          }}
        >
          {visibleColumns.map((column) => renderCell(column.id))}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openInspector(item.id)}>編集</ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>今日の日付で複製</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          削除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
