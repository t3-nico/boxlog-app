'use client';

import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Tag } from '@/core/types/tag';
import { useReorderTags } from '@/hooks/mutations/useTagCrudMutations';
import { getTagDisplayLabel, groupTagsByPrefix } from '@/lib/tag-colon';
import { cn } from '@/lib/utils';

import { FilterItem } from './FilterItem/FilterItem';
import { GroupHeader } from './GroupHeader';

import type { DragEndEvent } from '@dnd-kit/core';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';

/** ドラッグ中はレイアウトアニメーションを無効化 */
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

interface TagFlatListProps {
  tags: Tag[];
  visibleTagIds: Set<string>;
  tagCounts: Record<string, number>;
  onToggleTag: (tagId: string) => void;
  onDeleteTag: (tagId: string, tagName: string) => void;
  onShowOnlyTag: (tagId: string) => void;
  onToggleGroupTags: (tagIds: string[]) => void;
  onShowOnlyGroupTags: (tagIds: string[]) => void;
  getGroupVisibility: (tagIds: string[]) => 'all' | 'none' | 'some';
}

/**
 * タグフラットリスト（DnD並び替え付き）
 *
 * コロン記法のプレフィックスでグルーピング表示
 * - 同じプレフィックスのタグが2つ以上 → グループ化
 * - グループヘッダー + suffix表示
 * - それ以外はフラット表示
 * - ドラッグ&ドロップで並び替え可能
 */
export function TagFlatList({
  tags,
  visibleTagIds,
  tagCounts,
  onToggleTag,
  onDeleteTag,
  onShowOnlyTag,
  onToggleGroupTags,
  onShowOnlyGroupTags,
  getGroupVisibility,
}: TagFlatListProps) {
  const { grouped, ungrouped } = useMemo(() => groupTagsByPrefix(tags), [tags]);
  const groupKeys = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  // 表示順のフラットリスト（DnD用）
  const displayOrder = useMemo(() => {
    const order: Tag[] = [];
    for (const key of groupKeys) {
      const groupTags = grouped.get(key);
      if (groupTags) order.push(...groupTags);
    }
    order.push(...ungrouped);
    return order;
  }, [grouped, ungrouped, groupKeys]);

  const displayIds = useMemo(() => displayOrder.map((t) => t.id), [displayOrder]);

  const reorderMutation = useReorderTags();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      document.body.style.setProperty('cursor', '');

      if (!over || active.id === over.id) return;

      const oldIndex = displayIds.indexOf(active.id as string);
      const newIndex = displayIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(displayIds, oldIndex, newIndex);
      reorderMutation.mutate({
        updates: newOrder.map((id, i) => ({ id, sort_order: i })),
      });
    },
    [displayIds, reorderMutation],
  );

  const activeTag = activeId ? displayOrder.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        setActiveId(active.id as string);
        document.body.style.setProperty('cursor', 'grabbing');
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        document.body.style.setProperty('cursor', '');
      }}
    >
      <SortableContext items={displayIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {/* グループ化されたタグ */}
          {groupKeys.map((prefix) => {
            const groupTags = grouped.get(prefix);
            if (!groupTags) return null;

            const groupTagIds = groupTags.map((t) => t.id);
            const groupVisibility = getGroupVisibility(groupTagIds);
            const groupCount = groupTagIds.reduce((sum, id) => sum + (tagCounts[id] ?? 0), 0);

            return (
              <div key={prefix}>
                <GroupHeader
                  label={prefix}
                  checked={groupVisibility === 'all'}
                  indeterminate={groupVisibility === 'some'}
                  count={groupCount}
                  onCheckedChange={() => onToggleGroupTags(groupTagIds)}
                  onShowOnlyGroup={() => onShowOnlyGroupTags(groupTagIds)}
                />
                {groupTags.map((tag) => (
                  <SortableFilterItem
                    key={tag.id}
                    tag={tag}
                    isInGroup
                    checked={visibleTagIds.has(tag.id)}
                    onCheckedChange={() => onToggleTag(tag.id)}
                    onDeleteTag={() => onDeleteTag(tag.id, tag.name)}
                    onShowOnlyThis={() => onShowOnlyTag(tag.id)}
                    count={tagCounts[tag.id] ?? 0}
                  />
                ))}
              </div>
            );
          })}

          {/* グループ化されないタグ */}
          {ungrouped.map((tag) => (
            <SortableFilterItem
              key={tag.id}
              tag={tag}
              isInGroup={false}
              checked={visibleTagIds.has(tag.id)}
              onCheckedChange={() => onToggleTag(tag.id)}
              onDeleteTag={() => onDeleteTag(tag.id, tag.name)}
              onShowOnlyThis={() => onShowOnlyTag(tag.id)}
              count={tagCounts[tag.id] ?? 0}
            />
          ))}
        </div>
      </SortableContext>
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeTag ? (
              <div className="bg-background border-primary flex h-8 items-center rounded border-2 px-2 text-sm shadow-lg">
                <span
                  className="mr-2 inline-block size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: activeTag.color ?? '#6366f1' }}
                />
                <span className="truncate">{activeTag.name}</span>
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}

interface SortableFilterItemProps {
  tag: Tag;
  isInGroup: boolean;
  checked: boolean;
  onCheckedChange: () => void;
  onDeleteTag: () => void;
  onShowOnlyThis: () => void;
  count: number;
}

function SortableFilterItem({
  tag,
  isInGroup,
  checked,
  onCheckedChange,
  onDeleteTag,
  onShowOnlyThis,
  count,
}: SortableFilterItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag.id,
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-40')}>
      <FilterItem
        label={getTagDisplayLabel(tag.name, isInGroup)}
        tagId={tag.id}
        checkboxColor={tag.color ?? undefined}
        checked={checked}
        onCheckedChange={onCheckedChange}
        onDeleteTag={() => onDeleteTag()}
        onShowOnlyThis={onShowOnlyThis}
        count={count}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
