'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight,
  FolderUp,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { useCalendarFilterStore, type ItemType } from '../../stores/useCalendarFilterStore';

import { SidebarSection } from '@/features/navigation/components/sidebar/SidebarSection';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useDeleteTag, useReorderTags, useTags, useUpdateTag } from '@/features/tags/hooks/useTags';
import { useTagCreateModalStore } from '@/features/tags/stores/useTagCreateModalStore';
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverTooltip } from '@/components/ui/tooltip';
import { api } from '@/lib/trpc';

/** Planのデフォルト色 */
const PLAN_COLOR = '#3b82f6'; // blue-500
/** Recordのデフォルト色 */
const RECORD_COLOR = '#10b981'; // emerald-500

/**
 * カレンダーフィルターリスト
 *
 * Googleカレンダーの「マイカレンダー」のようなUI
 * - 種類: Plan / Record
 * - タグ: グループ別に階層表示
 */
/** ドラッグ中のアイテム情報 */
interface DragItem {
  id: string;
  type: 'group' | 'tag';
  name: string;
  color: string;
  parentId: string | null;
}

export function CalendarFilterList() {
  const t = useTranslations();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: groups, isLoading: groupsLoading } = useTagGroups();
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = tagStats?.counts ?? {};
  const deleteTagMutation = useDeleteTag();
  const reorderTagsMutation = useReorderTags();

  // DnD state
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const {
    visibleTypes,
    visibleTagIds,
    showUntagged,
    toggleType,
    toggleTag,
    toggleUntagged,
    toggleGroupTags,
    getGroupVisibility,
    initializeWithTags,
  } = useCalendarFilterStore();

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags]);

  // タグをグループ別に整理
  const groupedTags = useMemo(() => {
    if (!tags) return { grouped: [], ungrouped: [] };

    const grouped = (groups || []).map((group) => ({
      group,
      tags: tags.filter((tag) => tag.parent_id === group.id),
    }));

    // 子タグを持つ親タグのIDセット（グループヘッダーとして表示される）
    const parentIdsWithChildren = new Set(
      grouped.filter(({ tags: groupTags }) => groupTags.length > 0).map(({ group }) => group.id),
    );

    // ungrouped: 子を持たないルートタグのみ（親タグとして表示されているものは除外）
    const ungrouped = tags.filter((tag) => !tag.parent_id && !parentIdsWithChildren.has(tag.id));

    return { grouped, ungrouped };
  }, [tags, groups]);

  const isLoading = tagsLoading || groupsLoading;

  // TagCreateModal
  const openCreateModal = useTagCreateModalStore((state) => state.openModal);

  // 削除確認ダイアログの状態
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 子タグ追加ハンドラー（親タグがプリセットされた作成モーダルを開く）
  const handleAddChildTag = (parentId: string) => {
    openCreateModal(parentId);
  };

  // 親タグ削除ハンドラー（確認ダイアログを表示）
  const handleDeleteParentTag = (groupId: string) => {
    setDeleteTargetId(groupId);
  };

  // 削除確認後のハンドラー
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    await deleteTagMutation.mutateAsync({ id: deleteTargetId });
    setDeleteTargetId(null);
  };

  // DnD: ソート可能なグループIDリスト
  const sortableGroupIds = useMemo(() => {
    return groupedTags.grouped.filter(({ tags: t }) => t.length > 0).map(({ group }) => group.id);
  }, [groupedTags.grouped]);

  // DnD: ドラッグ開始
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const id = active.id as string;

      // グループ（親タグ）かタグかを判別
      const group = groups?.find((g) => g.id === id);
      if (group) {
        setActiveItem({
          id: group.id,
          type: 'group',
          name: group.name,
          color: group.color || '#3B82F6',
          parentId: null,
        });
        return;
      }

      const tag = tags?.find((t) => t.id === id);
      if (tag) {
        setActiveItem({
          id: tag.id,
          type: 'tag',
          name: tag.name,
          color: tag.color || '#3B82F6',
          parentId: tag.parent_id,
        });
      }
    },
    [groups, tags],
  );

  // DnD: ドラッグ終了
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveItem(null);

      if (!over || active.id === over.id) return;
      if (!tags || !groups) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // アクティブアイテムがグループかタグか
      const isActiveGroup = groups.some((g) => g.id === activeId);
      const isOverGroup = groups.some((g) => g.id === overId);

      if (isActiveGroup && isOverGroup) {
        // グループ同士の並び替え
        const oldIndex = sortableGroupIds.indexOf(activeId);
        const newIndex = sortableGroupIds.indexOf(overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(sortableGroupIds, oldIndex, newIndex);
          const updates = newOrder.map((id, index) => ({
            id,
            sort_order: index,
            parent_id: null,
          }));
          reorderTagsMutation.mutate({ updates });
        }
      } else if (!isActiveGroup) {
        // タグの移動（グループ内並び替え or グループ間移動）
        const activeTag = tags.find((t) => t.id === activeId);
        if (!activeTag) return;

        // ドロップ先がグループヘッダーの場合、そのグループに移動
        if (isOverGroup) {
          const newParentId = overId;
          if (activeTag.parent_id !== newParentId) {
            // 別グループへの移動
            const siblingTags = tags.filter((t) => t.parent_id === newParentId);
            const updates = [
              {
                id: activeId,
                sort_order: siblingTags.length,
                parent_id: newParentId,
              },
            ];
            reorderTagsMutation.mutate({ updates });
          }
        } else {
          // ドロップ先がタグの場合
          const overTag = tags.find((t) => t.id === overId);
          if (!overTag) return;

          const targetParentId = overTag.parent_id;

          if (activeTag.parent_id === targetParentId) {
            // 同じグループ内での並び替え
            const siblingTags = tags
              .filter((t) => t.parent_id === targetParentId)
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

            const oldIndex = siblingTags.findIndex((t) => t.id === activeId);
            const newIndex = siblingTags.findIndex((t) => t.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
              const newOrder = arrayMove(siblingTags, oldIndex, newIndex);
              const updates = newOrder.map((tag, index) => ({
                id: tag.id,
                sort_order: index,
                parent_id: targetParentId,
              }));
              reorderTagsMutation.mutate({ updates });
            }
          } else {
            // グループ間移動（タグの位置に挿入）
            const targetSiblings = tags
              .filter((t) => t.parent_id === targetParentId)
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

            const insertIndex = targetSiblings.findIndex((t) => t.id === overId);
            const newSiblings = [...targetSiblings];
            newSiblings.splice(insertIndex, 0, activeTag);

            const updates = newSiblings.map((tag, index) => ({
              id: tag.id,
              sort_order: index,
              parent_id: targetParentId,
            }));
            reorderTagsMutation.mutate({ updates });
          }
        }
      }
    },
    [tags, groups, sortableGroupIds, reorderTagsMutation],
  );

  return (
    <>
      <div className="w-full min-w-0 space-y-2 overflow-hidden p-2">
        {/* 種類（Plan / Record） */}
        <SidebarSection title={t('calendar.filter.type')} defaultOpen className="space-y-1 py-1">
          <FilterItem
            label="Plan"
            checkboxColor={PLAN_COLOR}
            checked={visibleTypes.plan}
            onCheckedChange={() => toggleType('plan' as ItemType)}
          />
          <FilterItem
            label="Record"
            checkboxColor={RECORD_COLOR}
            checked={visibleTypes.record}
            onCheckedChange={() => toggleType('record' as ItemType)}
            disabled
            disabledReason={t('calendar.filter.comingSoon')}
          />
        </SidebarSection>

        {/* タグ */}
        <SidebarSection
          title={t('calendar.filter.tags')}
          defaultOpen
          className="space-y-1 py-1"
          action={<CreateTagButton />}
        >
          {isLoading ? (
            <div className="space-y-1 py-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : tags && tags.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableGroupIds} strategy={verticalListSortingStrategy}>
                {/* グループ別タグ */}
                {groupedTags.grouped.map(
                  ({ group, tags: groupTags }) =>
                    groupTags.length > 0 && (
                      <SortableTagGroup
                        key={group.id}
                        groupId={group.id}
                        groupName={group.name}
                        groupColor={group.color || undefined}
                        tags={groupTags.map((tg) => ({
                          id: tg.id,
                          name: tg.name,
                          color: tg.color || '#3B82F6',
                          description: tg.description,
                        }))}
                        visibleTagIds={visibleTagIds}
                        onToggleTag={toggleTag}
                        onToggleGroup={() => toggleGroupTags(groupTags.map((tg) => tg.id))}
                        groupVisibility={getGroupVisibility(groupTags.map((tg) => tg.id))}
                        tagPlanCounts={tagPlanCounts}
                        onAddChildTag={handleAddChildTag}
                        onDeleteGroup={handleDeleteParentTag}
                        parentTags={groups?.map((g) => ({
                          id: g.id,
                          name: g.name,
                          color: g.color,
                        }))}
                        onDeleteTag={handleDeleteParentTag}
                      />
                    ),
                )}
              </SortableContext>

              {/* グループなしタグ */}
              {groupedTags.ungrouped.length > 0 && (
                <SortableContext
                  items={groupedTags.ungrouped.map((tg) => tg.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TagGroupSection
                    groupName={t('calendar.filter.ungrouped')}
                    tags={groupedTags.ungrouped.map((tg) => ({
                      id: tg.id,
                      name: tg.name,
                      color: tg.color || '#3B82F6',
                      description: tg.description,
                    }))}
                    visibleTagIds={visibleTagIds}
                    onToggleTag={toggleTag}
                    onToggleGroup={() => toggleGroupTags(groupedTags.ungrouped.map((tg) => tg.id))}
                    groupVisibility={getGroupVisibility(groupedTags.ungrouped.map((tg) => tg.id))}
                    tagPlanCounts={tagPlanCounts}
                    parentTags={groups?.map((g) => ({ id: g.id, name: g.name, color: g.color }))}
                    onDeleteTag={handleDeleteParentTag}
                  />
                </SortableContext>
              )}

              {/* タグなし */}
              <FilterItem
                label={t('calendar.filter.untagged')}
                checked={showUntagged}
                onCheckedChange={toggleUntagged}
              />

              {/* ドラッグオーバーレイ */}
              <DragOverlay>
                {activeItem && (
                  <div className="bg-surface border-border flex items-center gap-2 rounded-md border px-2 py-1 text-sm shadow-lg">
                    <div
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: activeItem.color }}
                    />
                    <span className="truncate">{activeItem.name}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="text-muted-foreground px-2 py-2 text-xs">
              {t('calendar.filter.noTags')}
            </div>
          )}
        </SidebarSection>
      </div>

      {/* 親タグ削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title={t('calendar.filter.deleteParentTag.title')}
        description={t('calendar.filter.deleteParentTag.description')}
      />
    </>
  );
}

/** タググループセクション Props */
interface TagGroupSectionProps {
  groupName: string;
  groupId?: string | undefined;
  groupColor?: string | undefined;
  tags: Array<{ id: string; name: string; color: string; description?: string | null }>;
  visibleTagIds: Set<string>;
  onToggleTag: (tagId: string) => void;
  onToggleGroup: () => void;
  groupVisibility: 'all' | 'none' | 'some';
  tagPlanCounts: Record<string, number>;
  onAddChildTag?: ((groupId: string) => void) | undefined;
  onDeleteGroup?: ((groupId: string) => void) | undefined;
  /** DnDハンドル用props（行全体をドラッグ可能に） */
  dragHandleProps?: React.HTMLAttributes<HTMLElement> | undefined;
  /** 親タグ候補一覧（子タグの親変更メニュー用） */
  parentTags?: Array<{ id: string; name: string; color?: string | null }> | undefined;
  /** 子タグ削除ハンドラー */
  onDeleteTag?: ((tagId: string) => void) | undefined;
}

/** ソート可能なタググループ（DnDラッパー） */
function SortableTagGroup(props: Omit<TagGroupSectionProps, 'dragHandleProps'>) {
  const { groupId } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: groupId || '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TagGroupSection {...props} dragHandleProps={listeners} />
    </div>
  );
}

/** タググループセクション */
function TagGroupSection({
  groupName,
  groupId,
  groupColor,
  tags,
  visibleTagIds,
  onToggleTag,
  onToggleGroup,
  groupVisibility,
  tagPlanCounts,
  onAddChildTag,
  onDeleteGroup,
  dragHandleProps,
  parentTags,
  onDeleteTag,
}: TagGroupSectionProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();

  // インライン編集状態
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(groupName);
  const inputRef = useRef<HTMLInputElement>(null);

  // 楽観的更新用の色（即座にUIに反映）
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? groupColor ?? '#3B82F6';

  // メニュー開閉状態（ボタンクリック・右クリック共通）
  const [menuOpen, setMenuOpen] = useState(false);

  // 編集開始時にフォーカス（カーソルを先頭に）
  useEffect(() => {
    if (!isEditing) return;
    // DropdownMenuが閉じた後にフォーカスを当てる
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, 0);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isEditing]);

  // 名前変更開始
  const handleStartRename = useCallback(() => {
    setEditName(groupName);
    setIsEditing(true);
  }, [groupName]);

  // 名前保存
  const handleSaveName = useCallback(async () => {
    if (!groupId || !editName.trim()) {
      setIsEditing(false);
      return;
    }
    if (editName.trim() === groupName) {
      setIsEditing(false);
      return;
    }
    await updateTagMutation.mutateAsync({
      id: groupId,
      data: { name: editName.trim() },
    });
    setIsEditing(false);
  }, [groupId, editName, groupName, updateTagMutation]);

  // キーボード操作
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveName();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [handleSaveName],
  );

  // カラー変更（楽観的更新）
  const handleColorChange = useCallback(
    async (color: string) => {
      if (!groupId) return;
      // 即座にUIに反映
      setOptimisticColor(color);
      try {
        await updateTagMutation.mutateAsync({
          id: groupId,
          data: { color },
        });
      } catch {
        // 失敗時は元に戻す
        setOptimisticColor(null);
      }
    },
    [groupId, updateTagMutation],
  );

  // サーバーからの色が更新されたら楽観的更新をクリア
  useEffect(() => {
    if (groupColor && optimisticColor && groupColor === optimisticColor) {
      setOptimisticColor(null);
    }
  }, [groupColor, optimisticColor]);

  const groupCheckboxStyle = {
    borderColor: displayColor,
    backgroundColor: groupVisibility === 'all' ? displayColor : 'transparent',
  } as React.CSSProperties;

  // 右クリックでメニューを開く
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!groupId || (!onAddChildTag && !onDeleteGroup)) return;
      e.preventDefault();
      setMenuOpen(true);
    },
    [groupId, onAddChildTag, onDeleteGroup],
  );

  // メニュー項目をレンダリング
  const menuItems = (
    <>
      {/* 名前を変更 */}
      <DropdownMenuItem onClick={handleStartRename}>
        <Pencil className="mr-2 size-4" />
        {t('calendar.filter.rename')}
      </DropdownMenuItem>
      {/* カラーを変更（サブメニュー） */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Palette className="mr-2 size-4" />
          {t('calendar.filter.changeColor')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="p-2">
          <ColorPalettePicker selectedColor={displayColor} onColorSelect={handleColorChange} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      {onAddChildTag && groupId && (
        <DropdownMenuItem onClick={() => onAddChildTag(groupId)}>
          <Plus className="mr-2 size-4" />
          {t('calendar.filter.addChildTag')}
        </DropdownMenuItem>
      )}
      {onDeleteGroup && groupId && (
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteGroup(groupId)}
        >
          <Trash2 className="mr-2 size-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      )}
    </>
  );

  // 行のコンテンツ
  const rowContent = (
    <div
      className={cn(
        'group hover:bg-state-hover flex w-full min-w-0 items-center rounded transition-colors',
        dragHandleProps && 'cursor-grab active:cursor-grabbing',
      )}
      onContextMenu={handleContextMenu}
      {...(dragHandleProps || {})}
    >
      {/* グループチェックボックス */}
      <Checkbox
        checked={groupVisibility === 'some' ? 'indeterminate' : groupVisibility === 'all'}
        onCheckedChange={onToggleGroup}
        className="ml-2 size-4"
        style={groupCheckboxStyle}
      />
      {/* 折りたたみトリガー / インライン編集 */}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="border-border bg-background focus-visible:ring-ring h-auto flex-1 rounded px-2 py-1 text-sm font-medium shadow-none focus-visible:ring-1"
        />
      ) : (
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center overflow-hidden px-2 py-1 text-sm font-medium">
          <span className="min-w-0 truncate">{groupName}</span>
        </CollapsibleTrigger>
      )}
      {/* アクションメニュー（ホバーで表示 / 右クリック共通） */}
      {groupId && (onAddChildTag || onDeleteGroup) && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {/* 折りたたみアイコン */}
      <CollapsibleTrigger className="flex size-6 shrink-0 items-center justify-center">
        <ChevronRight className="size-4 transition-transform [[data-state=open]>&]:rotate-90" />
      </CollapsibleTrigger>
    </div>
  );

  // 子タグのIDリスト（SortableContext用）
  const childTagIds = useMemo(() => tags.map((tag) => tag.id), [tags]);

  // 子タグ一覧
  const childContent = (
    <CollapsibleContent>
      <SortableContext items={childTagIds} strategy={verticalListSortingStrategy}>
        <div className="w-full min-w-0 space-y-1 overflow-hidden pl-4">
          {tags.map((tag) => (
            <SortableFilterItem
              key={tag.id}
              id={tag.id}
              label={tag.name}
              tagId={tag.id}
              description={tag.description}
              checkboxColor={tag.color || undefined}
              checked={visibleTagIds.has(tag.id)}
              onCheckedChange={() => onToggleTag(tag.id)}
              count={tagPlanCounts[tag.id] ?? 0}
              parentId={groupId}
              parentTags={parentTags}
              onDeleteTag={onDeleteTag}
            />
          ))}
        </div>
      </SortableContext>
    </CollapsibleContent>
  );

  return (
    <Collapsible defaultOpen className="w-full min-w-0">
      {rowContent}
      {childContent}
    </Collapsible>
  );
}

interface FilterItemProps {
  label: string;
  /** タグID（クリックでInspector表示用） */
  tagId?: string | undefined;
  /** タグの説明（ツールチップで表示） */
  description?: string | null | undefined;
  /** チェックボックスの色（hex値） */
  checkboxColor?: string | undefined;
  icon?: React.ReactNode;
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
  disabledReason?: string;
  /** 右端に表示するカウント数 */
  count?: number | undefined;
  /** DnDハンドル用props（行全体をドラッグ可能に） */
  dragHandleProps?: React.HTMLAttributes<HTMLElement> | undefined;
  /** 現在の親タグID */
  parentId?: string | null | undefined;
  /** 親タグ候補一覧（親タグ変更メニュー用） */
  parentTags?: Array<{ id: string; name: string; color?: string | null }> | undefined;
  /** 削除ハンドラー */
  onDeleteTag?: ((tagId: string) => void) | undefined;
}

/** ソート可能なフィルターアイテム（DnDラッパー） */
function SortableFilterItem(props: FilterItemProps & { id: string }) {
  const { id, ...rest } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <FilterItem {...rest} dragHandleProps={listeners} />
    </div>
  );
}

function FilterItem({
  label,
  tagId,
  description,
  checkboxColor,
  icon,
  checked,
  onCheckedChange,
  disabled = false,
  disabledReason,
  count,
  dragHandleProps,
  parentId,
  parentTags,
  onDeleteTag,
}: FilterItemProps) {
  const t = useTranslations();
  const { openInspector } = useTagInspectorStore();
  const updateTagMutation = useUpdateTag();

  // インライン編集状態
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  // 楽観的更新用の色
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? checkboxColor ?? '#3B82F6';

  // メニュー開閉状態
  const [menuOpen, setMenuOpen] = useState(false);

  // 編集開始時にフォーカス
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, 0);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isEditing]);

  // サーバーからの色が更新されたら楽観的更新をクリア
  useEffect(() => {
    if (checkboxColor && optimisticColor && checkboxColor === optimisticColor) {
      setOptimisticColor(null);
    }
  }, [checkboxColor, optimisticColor]);

  // 名前変更開始
  const handleStartRename = useCallback(() => {
    setEditName(label);
    setIsEditing(true);
  }, [label]);

  // 名前保存
  const handleSaveName = useCallback(async () => {
    if (!tagId || !editName.trim()) {
      setIsEditing(false);
      return;
    }
    if (editName.trim() === label) {
      setIsEditing(false);
      return;
    }
    await updateTagMutation.mutateAsync({
      id: tagId,
      data: { name: editName.trim() },
    });
    setIsEditing(false);
  }, [tagId, editName, label, updateTagMutation]);

  // キーボード操作
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveName();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [handleSaveName],
  );

  // カラー変更（楽観的更新）
  const handleColorChange = useCallback(
    async (color: string) => {
      if (!tagId) return;
      setOptimisticColor(color);
      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { color },
        });
      } catch {
        setOptimisticColor(null);
      }
    },
    [tagId, updateTagMutation],
  );

  // 親タグ変更
  const handleChangeParent = useCallback(
    async (newParentId: string | null) => {
      if (!tagId) return;
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: { parentId: newParentId },
      });
    },
    [tagId, updateTagMutation],
  );

  // 名前クリックでInspectorを開く
  const handleNameClick = useCallback(
    (e: React.MouseEvent) => {
      if (tagId && !disabled && !isEditing) {
        e.preventDefault();
        e.stopPropagation();
        openInspector(tagId);
      }
    },
    [tagId, disabled, isEditing, openInspector],
  );

  // 右クリックでメニューを開く
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!tagId || disabled) return;
      e.preventDefault();
      setMenuOpen(true);
    },
    [tagId, disabled],
  );

  // チェックボックスのカスタムスタイル
  const checkboxStyle = {
    borderColor: displayColor,
    backgroundColor: checked ? displayColor : 'transparent',
  } as React.CSSProperties;

  // メニュー項目
  const menuItems = tagId && (
    <>
      {/* 名前を変更 */}
      <DropdownMenuItem onClick={handleStartRename}>
        <Pencil className="mr-2 size-4" />
        {t('calendar.filter.rename')}
      </DropdownMenuItem>
      {/* カラーを変更 */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Palette className="mr-2 size-4" />
          {t('calendar.filter.changeColor')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="p-2">
          <ColorPalettePicker selectedColor={displayColor} onColorSelect={handleColorChange} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      {/* 親タグを変更 */}
      {parentTags && parentTags.length > 0 && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderUp className="mr-2 size-4" />
            {t('calendar.filter.changeParent')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => handleChangeParent(null)}
              className={cn(!parentId && 'bg-state-selected')}
            >
              {t('calendar.filter.noParent')}
            </DropdownMenuItem>
            {parentTags.map((parent) => (
              <DropdownMenuItem
                key={parent.id}
                onClick={() => handleChangeParent(parent.id)}
                className={cn(parentId === parent.id && 'bg-state-selected')}
              >
                <span
                  className="mr-2 size-3 rounded-full"
                  style={{ backgroundColor: parent.color || '#3B82F6' }}
                />
                {parent.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      {/* 削除 */}
      {onDeleteTag && (
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteTag(tagId)}
        >
          <Trash2 className="mr-2 size-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      )}
    </>
  );

  const content = (
    <div
      className={cn(
        'group/item hover:bg-state-hover flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm',
        disabled && 'cursor-not-allowed opacity-50',
        dragHandleProps && 'cursor-grab active:cursor-grabbing',
      )}
      title={disabled ? disabledReason : undefined}
      onContextMenu={handleContextMenu}
      {...(dragHandleProps || {})}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="h-4 w-4 shrink-0 cursor-pointer"
        style={checkboxStyle}
      />
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="border-border bg-background focus-visible:ring-ring h-auto flex-1 rounded px-2 py-0.5 text-sm shadow-none focus-visible:ring-1"
        />
      ) : (
        <span
          className={cn(
            'min-w-0 flex-1 truncate',
            tagId && !disabled && 'cursor-pointer hover:underline',
          )}
          onClick={handleNameClick}
        >
          {label}
        </span>
      )}
      {/* メニュー */}
      {tagId && !disabled && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex size-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/item:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {/* カウント（右端に表示） */}
      {count !== undefined && (
        <span className="text-muted-foreground shrink-0 text-right text-xs tabular-nums">
          {count}
        </span>
      )}
    </div>
  );

  // 説明がある場合はツールチップで表示
  return (
    <HoverTooltip content={description} side="right" disabled={!description}>
      {content}
    </HoverTooltip>
  );
}

/** 新規タグ作成ボタン */
function CreateTagButton() {
  const t = useTranslations();
  const openModal = useTagCreateModalStore((state) => state.openModal);

  return (
    <HoverTooltip content={t('calendar.filter.createTag')} side="top">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex size-6 items-center justify-center rounded"
        onClick={() => openModal()}
      >
        <Plus className="size-4" />
      </button>
    </HoverTooltip>
  );
}
