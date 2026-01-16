'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
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
  Eye,
  FileText,
  FolderUp,
  Merge,
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
import { TagMergeModal } from '@/features/tags/components/tag-merge-modal';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useDeleteTag, useReorderTags, useTags, useUpdateTag } from '@/features/tags/hooks/useTags';
import { useTagCreateModalStore } from '@/features/tags/stores/useTagCreateModalStore';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Field, FieldError, FieldLabel, FieldSupportText } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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

/** フラットリスト用のアイテム型（dnd-kit対応） */
interface FlatItem {
  id: string;
  type: 'group-header' | 'child-tag' | 'ungrouped-header' | 'ungrouped-tag';
  name: string;
  color: string;
  description?: string | null;
  parentId: string | null;
  sortOrder: number;
  /** グループヘッダー/グループなしヘッダーは常にtrueで、子タグは展開状態に依存 */
  isVisible: boolean;
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

  // 展開状態管理（Collapsible代替 - DnDのDOM順序問題を解決）
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(['ungrouped']));

  // グループ展開状態の初期化（グループデータ取得後）
  useEffect(() => {
    if (groups && groups.length > 0) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        groups.forEach((g) => next.add(g.id));
        return next;
      });
    }
  }, [groups]);

  // グループの展開/折りたたみトグル
  const toggleGroupExpand = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

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
    showOnlyUntagged,
    showOnlyGroupTags,
  } = useCalendarFilterStore();

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags]);

  // タグをグループ別に整理（sort_order順でソート）
  const groupedTags = useMemo(() => {
    if (!tags) return { grouped: [], ungrouped: [] };

    const grouped = (groups || []).map((group) => ({
      group,
      // 子タグを sort_order 順でソート（DnDのインデックス計算に必須）
      tags: tags
        .filter((tag) => tag.parent_id === group.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));

    // 子タグを持つ親タグのIDセット（グループヘッダーとして表示される）
    const parentIdsWithChildren = new Set(
      grouped.filter(({ tags: groupTags }) => groupTags.length > 0).map(({ group }) => group.id),
    );

    // ungrouped: 子を持たないルートタグのみ（親タグとして表示されているものは除外）
    // sort_order順でソート
    const ungrouped = tags
      .filter((tag) => !tag.parent_id && !parentIdsWithChildren.has(tag.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

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

  // DnD: フラットアイテムリスト（DOM順序とSortableContext items順序を一致させる）
  // Google Drive方式: 全アイテムを同一DOMレベルでレンダリング、CSSで視覚的階層を表現
  const flatItems = useMemo(() => {
    const items: FlatItem[] = [];

    // 1. グループヘッダー + 子タグ
    groupedTags.grouped.forEach(({ group, tags: children }) => {
      if (children.length > 0) {
        const isExpanded = expandedGroups.has(group.id);
        // グループヘッダー
        items.push({
          id: group.id,
          type: 'group-header',
          name: group.name,
          color: group.color || '#3B82F6',
          description: group.description,
          parentId: null,
          sortOrder: group.sort_order ?? 0,
          isVisible: true,
        });
        // 子タグ（展開時のみ表示）
        children.forEach((child, index) => {
          items.push({
            id: child.id,
            type: 'child-tag',
            name: child.name,
            color: child.color || '#3B82F6',
            description: child.description,
            parentId: group.id,
            sortOrder: child.sort_order ?? index,
            isVisible: isExpanded,
          });
        });
      }
    });

    // 2. グループなしセクション
    const isUngroupedExpanded = expandedGroups.has('ungrouped');
    items.push({
      id: 'ungrouped-header',
      type: 'ungrouped-header',
      name: t('calendar.filter.ungrouped'),
      color: '#6B7280',
      description: null,
      parentId: null,
      sortOrder: 9999,
      isVisible: true,
    });

    // グループなしタグ（展開時のみ表示）
    groupedTags.ungrouped.forEach((tag, index) => {
      items.push({
        id: tag.id,
        type: 'ungrouped-tag',
        name: tag.name,
        color: tag.color || '#3B82F6',
        description: tag.description,
        parentId: null,
        sortOrder: tag.sort_order ?? index,
        isVisible: isUngroupedExpanded,
      });
    });

    return items;
  }, [groupedTags, expandedGroups, t]);

  // DnD: SortableContext用のIDリスト（表示中のアイテムのみ）
  // 重要: dnd-kit の SortableContext には表示中の全アイテムを含める必要がある
  const allSortableIds = useMemo(() => {
    return flatItems.filter((item) => item.isVisible).map((item) => item.id);
  }, [flatItems]);

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

      // 「グループなし」へのドロップ（ルートに移動）
      if (overId === 'ungrouped-drop-zone' || overId === 'ungrouped-header') {
        const activeTag = tags.find((t) => t.id === activeId);
        // グループ（親タグ）の場合や、既にルートの場合は何もしない
        if (!activeTag || groups.some((g) => g.id === activeId)) return;
        if (activeTag.parent_id === null) return;

        // ルートに移動（parent_id: null）
        const ungroupedTags = tags.filter(
          (t) => t.parent_id === null && !groups.some((g) => g.id === t.id),
        );
        const updates = [
          {
            id: activeId,
            sort_order: ungroupedTags.length,
            parent_id: null,
          },
        ];
        reorderTagsMutation.mutate({ updates });
        return;
      }

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
            // 注意: ルートレベル(parent_id: null)の場合、親タグ(グループ)を除外する必要がある
            const siblingTags = tags
              .filter((t) => t.parent_id === targetParentId)
              .filter((t) => targetParentId !== null || !groups.some((g) => g.id === t.id))
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
            // 注意: ルートレベル(parent_id: null)の場合、親タグ(グループ)を除外する必要がある
            const targetSiblings = tags
              .filter((t) => t.parent_id === targetParentId)
              .filter((t) => targetParentId !== null || !groups.some((g) => g.id === t.id))
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
              {/* フラットレンダリング: 全アイテムを同一DOMレベルで表示（Google Drive方式） */}
              <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
                {flatItems.map((item) => {
                  if (!item.isVisible) return null;

                  switch (item.type) {
                    case 'group-header':
                      return (
                        <FlatGroupHeader
                          key={item.id}
                          item={item}
                          isExpanded={expandedGroups.has(item.id)}
                          onToggleExpand={() => toggleGroupExpand(item.id)}
                          groupVisibility={getGroupVisibility(
                            groupedTags.grouped
                              .find((g) => g.group.id === item.id)
                              ?.tags.map((t) => t.id) || [],
                          )}
                          onToggleGroup={() => {
                            const groupTags =
                              groupedTags.grouped.find((g) => g.group.id === item.id)?.tags || [];
                            toggleGroupTags(groupTags.map((t) => t.id));
                          }}
                          onAddChildTag={() => handleAddChildTag(item.id)}
                          onDeleteGroup={() => handleDeleteParentTag(item.id)}
                        />
                      );
                    case 'child-tag':
                      return (
                        <FlatChildTag
                          key={item.id}
                          item={item}
                          checked={visibleTagIds.has(item.id)}
                          onToggle={() => toggleTag(item.id)}
                          count={tagPlanCounts[item.id] ?? 0}
                          parentTags={groups?.map((g) => ({
                            id: g.id,
                            name: g.name,
                            color: g.color,
                          }))}
                          onDeleteTag={() => handleDeleteParentTag(item.id)}
                        />
                      );
                    case 'ungrouped-header':
                      return (
                        <FlatUngroupedHeader
                          key={item.id}
                          isExpanded={expandedGroups.has('ungrouped')}
                          onToggleExpand={() => toggleGroupExpand('ungrouped')}
                          groupVisibility={getGroupVisibility(
                            groupedTags.ungrouped.map((t) => t.id),
                          )}
                          onToggleGroup={() =>
                            toggleGroupTags(groupedTags.ungrouped.map((t) => t.id))
                          }
                          onShowOnlyGroup={() =>
                            showOnlyGroupTags(groupedTags.ungrouped.map((t) => t.id))
                          }
                        />
                      );
                    case 'ungrouped-tag':
                      return (
                        <FlatUngroupedTag
                          key={item.id}
                          item={item}
                          checked={visibleTagIds.has(item.id)}
                          onToggle={() => toggleTag(item.id)}
                          count={tagPlanCounts[item.id] ?? 0}
                          parentTags={groups?.map((g) => ({
                            id: g.id,
                            name: g.name,
                            color: g.color,
                          }))}
                          onDeleteTag={() => handleDeleteParentTag(item.id)}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </SortableContext>

              {/* タグなし */}
              <FilterItem
                label={t('calendar.filter.untagged')}
                checked={showUntagged}
                onCheckedChange={toggleUntagged}
                onShowOnlyThis={showOnlyUntagged}
              />

              {/* ドラッグオーバーレイ（カレンダーDnDと統一スタイル） */}
              <DragOverlay>
                {activeItem && (
                  <div className="bg-card border-primary flex items-center gap-2 rounded-xl border-2 px-3 py-2 shadow-lg">
                    {/* 左側のカラーバー（カレンダーDnDと統一） */}
                    <div
                      className="h-6 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: activeItem.color }}
                    />
                    <span className="text-foreground truncate text-sm font-medium">
                      {activeItem.name}
                    </span>
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

interface FilterItemProps {
  label: string;
  /** タグID */
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
  /** このアイテムだけ表示（タグなし用） */
  onShowOnlyThis?: (() => void) | undefined;
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
  onShowOnlyThis,
}: FilterItemProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();
  const { removeTag, showOnlyTag } = useCalendarFilterStore();

  // インライン編集状態
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  // 楽観的更新用の色
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? checkboxColor ?? '#3B82F6';

  // メニュー開閉状態
  const [menuOpen, setMenuOpen] = useState(false);

  // マージモーダル状態
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // 説明編集状態
  const [editDescription, setEditDescription] = useState(description ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // description prop と editDescription を同期
  useEffect(() => {
    setEditDescription(description ?? '');
  }, [description]);

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

  // 説明保存
  const handleSaveDescription = useCallback(async () => {
    if (!tagId) return;
    const trimmed = editDescription.trim();
    // 変更がなければスキップ
    if (trimmed === (description ?? '')) return;
    await updateTagMutation.mutateAsync({
      id: tagId,
      data: { description: trimmed || null },
    });
  }, [tagId, editDescription, description, updateTagMutation]);

  // マージ成功時のコールバック
  const handleMergeSuccess = useCallback(() => {
    if (tagId) {
      removeTag(tagId);
    }
  }, [tagId, removeTag]);

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
      {/* 説明を編集 */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <FileText className="mr-2 size-4" />
          {t('calendar.filter.editDescription')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-[280px] p-3">
          <Field>
            <FieldLabel htmlFor={`tag-description-${tagId}`}>
              {t('calendar.filter.descriptionLabel')}
            </FieldLabel>
            <div className="flex items-center justify-between">
              <FieldSupportText id={`tag-description-support-${tagId}`}>
                {t('calendar.filter.descriptionHint')}
              </FieldSupportText>
              <span className="text-muted-foreground text-xs tabular-nums">
                {editDescription.length}/100
              </span>
            </div>
            <Textarea
              id={`tag-description-${tagId}`}
              ref={textareaRef}
              value={editDescription}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  setEditDescription(value);
                  // 自動高さ調整
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  textarea.style.height = `${textarea.scrollHeight}px`;
                }
              }}
              onBlur={handleSaveDescription}
              maxLength={100}
              aria-describedby={`tag-description-support-${tagId}`}
              className="border-border min-h-[60px] w-full resize-none border text-sm"
            />
            {editDescription.length >= 100 && (
              <FieldError noPrefix>{t('calendar.filter.descriptionMaxLength')}</FieldError>
            )}
          </Field>
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
      {/* マージ */}
      <DropdownMenuItem onClick={() => setMergeModalOpen(true)}>
        <Merge className="mr-2 size-4" />
        {t('calendar.filter.merge')}
      </DropdownMenuItem>
      {/* このタグだけ表示 */}
      {tagId && (
        <DropdownMenuItem onClick={() => showOnlyTag(tagId)}>
          <Eye className="mr-2 size-4" />
          {t('calendar.filter.showOnlyThis')}
        </DropdownMenuItem>
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
        menuOpen && 'bg-state-selected',
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
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}
      {/* メニュー */}
      {(tagId || onShowOnlyThis) && !disabled && (
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
            {tagId ? (
              menuItems
            ) : onShowOnlyThis ? (
              <DropdownMenuItem onClick={onShowOnlyThis}>
                <Eye className="mr-2 size-4" />
                {t('calendar.filter.showOnlyThis')}
              </DropdownMenuItem>
            ) : null}
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
    <>
      <HoverTooltip
        content={description}
        side="top"
        disabled={!description || menuOpen}
        wrapperClassName="w-full"
      >
        {content}
      </HoverTooltip>

      {/* マージモーダル */}
      {tagId && (
        <TagMergeModal
          open={mergeModalOpen}
          onClose={() => setMergeModalOpen(false)}
          sourceTag={{ id: tagId, name: label, color: checkboxColor ?? null }}
          hasChildren={false}
          onMergeSuccess={handleMergeSuccess}
        />
      )}
    </>
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

// ==========================================
// フラットレンダリング用コンポーネント
// Google Drive方式: 全アイテムを同一DOMレベルでレンダリング
// ==========================================

interface FlatGroupHeaderProps {
  item: FlatItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  groupVisibility: 'all' | 'none' | 'some';
  onToggleGroup: () => void;
  onAddChildTag: () => void;
  onDeleteGroup: () => void;
}

/** フラットなグループヘッダー（useSortable対応） */
function FlatGroupHeader({
  item,
  isExpanded,
  onToggleExpand,
  groupVisibility,
  onToggleGroup,
  onAddChildTag,
  onDeleteGroup,
}: FlatGroupHeaderProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: item.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? item.color;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleColorChange = async (color: string) => {
    setOptimisticColor(color);
    await updateTagMutation.mutateAsync({ id: item.id, data: { color } });
    setOptimisticColor(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'w-full rounded-md transition-colors',
        isOver && !isDragging && 'bg-state-hover ring-primary/30 ring-2',
      )}
    >
      <div
        className={cn(
          'group hover:bg-state-hover flex w-full min-w-0 items-center rounded transition-colors',
          'cursor-grab active:cursor-grabbing',
          menuOpen && 'bg-state-selected',
        )}
        {...listeners}
      >
        <Checkbox
          checked={groupVisibility === 'some' ? 'indeterminate' : groupVisibility === 'all'}
          onCheckedChange={onToggleGroup}
          className="mx-2 shrink-0"
          style={
            {
              '--checkbox-color': displayColor,
              borderColor: displayColor,
              backgroundColor: groupVisibility !== 'none' ? displayColor : undefined,
            } as React.CSSProperties
          }
        />
        <div className="h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: displayColor }} />
        <span className="text-foreground ml-2 flex-1 truncate text-sm font-medium">
          {item.name}
        </span>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 size-4" />
                {t('calendar.filter.changeColor')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2">
                <ColorPalettePicker
                  selectedColor={displayColor}
                  onColorSelect={handleColorChange}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={onAddChildTag}>
              <Plus className="mr-2 size-4" />
              {t('calendar.filter.addChildTag')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDeleteGroup}
            >
              <Trash2 className="mr-2 size-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          <ChevronRight className={cn('size-4 transition-transform', isExpanded && 'rotate-90')} />
        </button>
      </div>
    </div>
  );
}

interface FlatChildTagProps {
  item: FlatItem;
  checked: boolean;
  onToggle: () => void;
  count: number;
  parentTags?: Array<{ id: string; name: string; color?: string | null }> | undefined;
  onDeleteTag: () => void;
}

/** フラットな子タグ（useSortable対応、CSSでインデント） */
function FlatChildTag({
  item,
  checked,
  onToggle,
  count,
  parentTags,
  onDeleteTag,
}: FlatChildTagProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: item.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? item.color;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleColorChange = async (color: string) => {
    setOptimisticColor(color);
    await updateTagMutation.mutateAsync({ id: item.id, data: { color } });
    setOptimisticColor(null);
  };

  const handleChangeParent = async (newParentId: string | null) => {
    await updateTagMutation.mutateAsync({ id: item.id, data: { parentId: newParentId } });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'w-full rounded-md pl-4 transition-colors', // pl-4 for visual indentation
        isOver && !isDragging && 'bg-state-hover ring-primary/30 ring-2',
      )}
    >
      <div
        className={cn(
          'group/item hover:bg-state-hover flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm',
          'cursor-grab active:cursor-grabbing',
          menuOpen && 'bg-state-selected',
        )}
        {...listeners}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          className="shrink-0"
          style={
            {
              '--checkbox-color': displayColor,
              borderColor: displayColor,
              backgroundColor: checked ? displayColor : undefined,
            } as React.CSSProperties
          }
        />
        <div
          className="h-3 w-0.5 shrink-0 rounded-full"
          style={{ backgroundColor: displayColor }}
        />
        <span className="text-foreground flex-1 truncate">{item.name}</span>
        {count > 0 && (
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{count}</span>
        )}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center rounded opacity-0 group-hover/item:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 size-4" />
                {t('calendar.filter.changeColor')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2">
                <ColorPalettePicker
                  selectedColor={displayColor}
                  onColorSelect={handleColorChange}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {parentTags && parentTags.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderUp className="mr-2 size-4" />
                  {t('calendar.filter.changeParent')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleChangeParent(null)}>
                    {t('calendar.filter.ungrouped')}
                  </DropdownMenuItem>
                  {parentTags
                    .filter((p) => p.id !== item.parentId)
                    .map((parent) => (
                      <DropdownMenuItem
                        key={parent.id}
                        onClick={() => handleChangeParent(parent.id)}
                      >
                        <div
                          className="mr-2 h-3 w-1 rounded-full"
                          style={{ backgroundColor: parent.color || '#3B82F6' }}
                        />
                        {parent.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDeleteTag}
            >
              <Trash2 className="mr-2 size-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface FlatUngroupedHeaderProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  groupVisibility: 'all' | 'none' | 'some';
  onToggleGroup: () => void;
  /** このグループだけ表示 */
  onShowOnlyGroup: () => void;
}

/** フラットなグループなしヘッダー（useDroppable対応） */
function FlatUngroupedHeader({
  isExpanded,
  onToggleExpand,
  groupVisibility,
  onToggleGroup,
  onShowOnlyGroup,
}: FlatUngroupedHeaderProps) {
  const t = useTranslations();
  const { setNodeRef, isOver } = useDroppable({ id: 'ungrouped-header' });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-full rounded-md transition-colors',
        isOver && 'bg-state-hover ring-primary/30 ring-2',
      )}
    >
      <div
        className={cn(
          'group hover:bg-state-hover flex w-full min-w-0 items-center rounded transition-colors',
          menuOpen && 'bg-state-selected',
        )}
      >
        <Checkbox
          checked={groupVisibility === 'some' ? 'indeterminate' : groupVisibility === 'all'}
          onCheckedChange={onToggleGroup}
          className="mx-2 shrink-0"
        />
        <span className="text-muted-foreground ml-2 flex-1 truncate text-sm">
          {t('calendar.filter.ungrouped')}
        </span>
        {/* メニュー */}
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
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onShowOnlyGroup}>
              <Eye className="mr-2 size-4" />
              {t('calendar.filter.showOnlyThis')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center"
          onClick={onToggleExpand}
        >
          <ChevronRight className={cn('size-4 transition-transform', isExpanded && 'rotate-90')} />
        </button>
      </div>
    </div>
  );
}

interface FlatUngroupedTagProps {
  item: FlatItem;
  checked: boolean;
  onToggle: () => void;
  count: number;
  parentTags?: Array<{ id: string; name: string; color?: string | null }> | undefined;
  onDeleteTag: () => void;
}

/** フラットなグループなしタグ（useSortable対応） */
function FlatUngroupedTag({
  item,
  checked,
  onToggle,
  count,
  parentTags,
  onDeleteTag,
}: FlatUngroupedTagProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: item.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? item.color;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleColorChange = async (color: string) => {
    setOptimisticColor(color);
    await updateTagMutation.mutateAsync({ id: item.id, data: { color } });
    setOptimisticColor(null);
  };

  const handleChangeParent = async (newParentId: string) => {
    await updateTagMutation.mutateAsync({ id: item.id, data: { parentId: newParentId } });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'w-full rounded-md pl-4 transition-colors', // pl-4 for visual indentation
        isOver && !isDragging && 'bg-state-hover ring-primary/30 ring-2',
      )}
    >
      <div
        className={cn(
          'group/item hover:bg-state-hover flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm',
          'cursor-grab active:cursor-grabbing',
          menuOpen && 'bg-state-selected',
        )}
        {...listeners}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          className="shrink-0"
          style={
            {
              '--checkbox-color': displayColor,
              borderColor: displayColor,
              backgroundColor: checked ? displayColor : undefined,
            } as React.CSSProperties
          }
        />
        <div
          className="h-3 w-0.5 shrink-0 rounded-full"
          style={{ backgroundColor: displayColor }}
        />
        <span className="text-foreground flex-1 truncate">{item.name}</span>
        {count > 0 && (
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{count}</span>
        )}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center rounded opacity-0 group-hover/item:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 size-4" />
                {t('calendar.filter.changeColor')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2">
                <ColorPalettePicker
                  selectedColor={displayColor}
                  onColorSelect={handleColorChange}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {parentTags && parentTags.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderUp className="mr-2 size-4" />
                  {t('calendar.filter.changeParent')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {parentTags.map((parent) => (
                    <DropdownMenuItem key={parent.id} onClick={() => handleChangeParent(parent.id)}>
                      <div
                        className="mr-2 h-3 w-1 rounded-full"
                        style={{ backgroundColor: parent.color || '#3B82F6' }}
                      />
                      {parent.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDeleteTag}
            >
              <Trash2 className="mr-2 size-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
