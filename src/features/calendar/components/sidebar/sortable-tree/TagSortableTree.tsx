'use client';

/**
 * タグ用SortableTree
 *
 * dnd-kit公式SortableTreeパターンをタグ向けに実装
 * - 2階層制限（親タグ → 子タグ）
 * - 行全体ドラッグ
 * - 現在のタグUI維持（チェックボックス、色、カウント、メニュー）
 */

import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { Tag } from '@/features/tags/types';

import { SortableTagTreeItem, TagTreeItem } from './components';
import { sortableTreeKeyboardCoordinates } from './keyboardCoordinates';
import type { FlattenedItem, SensorContext, TreeItem, TreeItems } from './types';
import {
  buildTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  setProperty,
} from './utilities';

/** タグ付きTreeItem型 */
interface TagTreeItem extends TreeItem {
  tag: Tag;
}

/** タグ付きFlattenedItem型 */
interface TagFlattenedItem extends FlattenedItem {
  tag: Tag;
}

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

interface TagSortableTreeProps {
  /** タグ一覧 */
  tags: Tag[];
  /** 表示中のタグID */
  visibleTagIds: Set<string>;
  /** タグカウント（tagId -> count） */
  tagCounts: Record<string, number>;
  /** 親タグカウント（親自体 + 子の合計） */
  parentTagCounts: Record<string, number>;
  /** チェック切り替えハンドラー */
  onToggleTag: (tagId: string) => void;
  /** タグ更新ハンドラー */
  onUpdateTag: (
    tagId: string,
    data: { name?: string; color?: string; description?: string | null; parentId?: string | null },
  ) => void;
  /** タグ削除ハンドラー */
  onDeleteTag: (tagId: string) => void;
  /** 子タグ追加ハンドラー */
  onAddChildTag: (parentId: string) => void;
  /** このタグだけ表示 */
  onShowOnlyTag: (tagId: string) => void;
  /** グループのタグだけ表示 */
  onShowOnlyGroupTags: (tagIds: string[]) => void;
  /** マージモーダルを開く */
  onOpenMergeModal: (tagId: string) => void;
  /** 並び替え完了時のコールバック */
  onReorder: (updates: Array<{ id: string; sort_order: number; parent_id: string | null }>) => void;
  /** インデント幅 */
  indentationWidth?: number;
}

/**
 * タグをTreeItems形式に変換（タグ情報を保持）
 */
function tagsToTreeItems(tags: Tag[]): TagTreeItem[] {
  // 親タグ（parent_id === null）を抽出
  const parentTags = tags.filter((t) => t.parent_id === null);

  // 親タグごとにTreeItemを作成
  return parentTags
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((parent) => {
      // 子タグを取得
      const children = tags
        .filter((t) => t.parent_id === parent.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((child) => ({
          id: child.id,
          children: [] as TagTreeItem[],
          tag: child,
        }));

      return {
        id: parent.id,
        children,
        collapsed: false, // 初期状態は展開
        tag: parent,
      };
    });
}

/**
 * flattenTree をタグ情報付きで拡張
 */
function flattenTagTree(
  items: TagTreeItem[],
  parentId: UniqueIdentifier | null = null,
  depth = 0,
): TagFlattenedItem[] {
  return items.reduce<TagFlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTagTree(item.children as TagTreeItem[], item.id, depth + 1),
    ];
  }, []);
}

export function TagSortableTree({
  tags,
  visibleTagIds,
  tagCounts,
  parentTagCounts,
  onToggleTag,
  onUpdateTag,
  onDeleteTag,
  onAddChildTag,
  onShowOnlyTag,
  onShowOnlyGroupTags,
  onOpenMergeModal,
  onReorder,
  indentationWidth = 16,
}: TagSortableTreeProps) {
  // タグからTreeItemsへ変換
  const defaultItems = useMemo(() => tagsToTreeItems(tags), [tags]);

  const [items, setItems] = useState<TagTreeItem[]>(() => defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  // タグが変更されたらitemsを更新
  useEffect(() => {
    setItems(tagsToTreeItems(tags));
  }, [tags]);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTagTree(items);
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, { children, collapsed, id }) => (collapsed && children.length ? [...acc, id] : acc),
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId != null ? [activeId, ...collapsedItems] : collapsedItems,
    ) as TagFlattenedItem[];
  }, [activeId, items]);

  // 2階層制限: maxDepthLimit = 1
  const MAX_DEPTH_LIMIT = 1;

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
          MAX_DEPTH_LIMIT,
        )
      : null;

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, true, indentationWidth),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px動くまでドラッグ開始しない（クリックを許可）
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);

  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  // 親タグ候補一覧（子タグを持つ親タグのみ）
  const parentTags = useMemo(() => {
    return tags
      .filter((t) => t.parent_id === null)
      .map((t) => ({ id: t.id, name: t.name, color: t.color }));
  }, [tags]);

  // DnD handlers
  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);
    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: TagFlattenedItem[] = JSON.parse(JSON.stringify(flattenTagTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      if (activeTreeItem) {
        clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

        const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
        const newItems = buildTree(sortedItems) as TagTreeItem[];

        setItems(newItems);

        // 並び替えデータを生成してコールバック
        const updates = generateReorderUpdates(sortedItems);
        onReorder(updates);
      }
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    document.body.style.setProperty('cursor', '');
  }

  // 折りたたみハンドラー
  const handleCollapse = useCallback((id: UniqueIdentifier) => {
    setItems((items) => setProperty(items, id, 'collapsed', (value) => !value) as TagTreeItem[]);
  }, []);

  // 並び替えデータを生成
  function generateReorderUpdates(
    flatItems: TagFlattenedItem[],
  ): Array<{ id: string; sort_order: number; parent_id: string | null }> {
    const updates: Array<{ id: string; sort_order: number; parent_id: string | null }> = [];
    const parentGroups = new Map<string | null, TagFlattenedItem[]>();

    // 親IDごとにグループ化
    for (const item of flatItems) {
      const parentId = item.parentId as string | null;
      if (!parentGroups.has(parentId)) {
        parentGroups.set(parentId, []);
      }
      parentGroups.get(parentId)!.push(item);
    }

    // 各グループ内でsort_orderを設定
    for (const [parentId, groupItems] of parentGroups) {
      groupItems.forEach((item, index) => {
        updates.push({
          id: item.id as string,
          sort_order: index,
          parent_id: parentId,
        });
      });
    }

    return updates;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <ul className="m-0 list-none p-0">
          {flattenedItems.map(({ id, children, collapsed, depth, tag }) => {
            const hasChildren = children.length > 0;
            const count =
              depth === 0 && hasChildren
                ? (parentTagCounts[id as string] ?? 0)
                : (tagCounts[id as string] ?? 0);

            return (
              <SortableTagTreeItem
                key={id}
                id={id}
                tag={{
                  id: tag.id,
                  name: tag.name,
                  color: tag.color || '#3B82F6',
                  description: tag.description,
                }}
                depth={id === activeId && projected ? projected.depth : depth}
                indentationWidth={indentationWidth}
                checked={visibleTagIds.has(id as string)}
                count={count}
                collapsed={collapsed ?? false}
                hasChildren={hasChildren}
                indicator
                onToggle={() => onToggleTag(id as string)}
                onCollapse={hasChildren ? () => handleCollapse(id) : undefined}
                onUpdateTag={(data) => onUpdateTag(id as string, data)}
                onDeleteTag={() => onDeleteTag(id as string)}
                onAddChildTag={depth === 0 ? () => onAddChildTag(id as string) : undefined}
                onShowOnlyThis={() => {
                  if (depth === 0 && hasChildren) {
                    // 親タグの場合、自分と子タグを全て表示
                    const childIds = tags.filter((t) => t.parent_id === id).map((t) => t.id);
                    onShowOnlyGroupTags([id as string, ...childIds]);
                  } else {
                    onShowOnlyTag(id as string);
                  }
                }}
                onOpenMergeModal={() => onOpenMergeModal(id as string)}
                parentTags={depth > 0 ? parentTags : undefined}
              />
            );
          })}
        </ul>
        {typeof document !== 'undefined' &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig} modifiers={[adjustTranslate]}>
              {activeId && activeItem ? (
                <TagTreeItem
                  tag={{
                    id: activeItem.tag.id,
                    name: activeItem.tag.name,
                    color: activeItem.tag.color || '#3B82F6',
                    description: activeItem.tag.description,
                  }}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items as TreeItems, activeId) + 1}
                  indentationWidth={indentationWidth}
                  checked={false}
                  count={0}
                />
              ) : null}
            </DragOverlay>,
            document.body,
          )}
      </SortableContext>
    </DndContext>
  );
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
