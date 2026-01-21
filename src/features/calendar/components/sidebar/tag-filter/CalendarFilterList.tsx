'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CircleSlash,
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

import { useCalendarFilterStore, type ItemType } from '../../../stores/useCalendarFilterStore';

import { SidebarSection } from '@/features/navigation/components/sidebar/SidebarSection';
import { TagMergeModal } from '@/features/tags/components/tag-merge-modal';
import { TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';
import { useDeleteTag, useReorderTags, useTags, useUpdateTag } from '@/features/tags/hooks/useTags';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import { SortableTree } from '../sortable-tree/SortableTree';
import { TagSortableTree } from '../sortable-tree/TagSortableTree';

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
export function CalendarFilterList() {
  const t = useTranslations();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { isLoading: groupsLoading } = useTagGroups();
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = tagStats?.counts ?? {};
  const untaggedCount = tagStats?.untaggedCount ?? 0;

  // 親タグ用のカウント計算（親タグ自体 + 子タグ合計）
  const parentTagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tags?.forEach((tag) => {
      // 親タグ（parent_idがnull）のみ処理
      if (tag.parent_id === null) {
        // 親タグ自体のカウント
        const parentCount = tagPlanCounts[tag.id] ?? 0;
        // 子タグの合計カウント
        const childrenCount =
          tags
            ?.filter((t) => t.parent_id === tag.id)
            .reduce((sum, t) => sum + (tagPlanCounts[t.id] ?? 0), 0) ?? 0;
        counts[tag.id] = parentCount + childrenCount;
      }
    });
    return counts;
  }, [tags, tagPlanCounts]);

  const deleteTagMutation = useDeleteTag();
  const reorderTagsMutation = useReorderTags();
  const updateTagMutation = useUpdateTag();

  // マージモーダル用の状態
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);

  // TagSortableTree用のタグ更新ハンドラー
  const handleUpdateTag = useCallback(
    (
      tagId: string,
      data: {
        name?: string;
        color?: string;
        description?: string | null;
        parentId?: string | null;
      },
    ) => {
      const updateData: {
        name?: string;
        color?: string;
        description?: string;
        parent_id?: string | null;
      } = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.description !== undefined) updateData.description = data.description ?? '';
      if (data.parentId !== undefined) updateData.parent_id = data.parentId;
      updateTagMutation.mutate({ id: tagId, ...updateData });
    },
    [updateTagMutation],
  );

  // TagSortableTree用の並び替えハンドラー
  const handleReorder = useCallback(
    (updates: Array<{ id: string; sort_order: number; parent_id: string | null }>) => {
      reorderTagsMutation.mutate({ updates });
    },
    [reorderTagsMutation],
  );

  const {
    visibleTypes,
    visibleTagIds,
    showUntagged,
    toggleType,
    toggleTag,
    toggleUntagged,
    initializeWithTags,
    showOnlyTag,
    showOnlyUntagged,
    showOnlyGroupTags,
  } = useCalendarFilterStore();

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags]);

  const isLoading = tagsLoading || groupsLoading;

  // タグモーダルナビゲーション（Intercepting Routes ベース）
  const { openTagCreateModal } = useTagModalNavigation();

  // 削除確認ダイアログの状態
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 子タグ追加ハンドラー（親タグがプリセットされた作成モーダルを開く）
  const handleAddChildTag = (parentId: string) => {
    openTagCreateModal(parentId);
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

  return (
    <>
      <div className="w-full min-w-0 space-y-2 overflow-hidden p-2">
        {/* 種類（Plan / Record） */}
        <SidebarSection title={t('calendar.filter.type')} defaultOpen className="py-1">
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
          className="py-1"
          action={<CreateTagButton />}
        >
          {isLoading ? (
            <div className="space-y-1 py-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : tags && tags.length > 0 ? (
            <>
              {/* TagSortableTree: 公式SortableTreeパターンでタグDnD */}
              <TagSortableTree
                tags={tags}
                visibleTagIds={visibleTagIds}
                tagCounts={tagPlanCounts}
                parentTagCounts={parentTagCounts}
                onToggleTag={toggleTag}
                onUpdateTag={handleUpdateTag}
                onDeleteTag={(tagId) => handleDeleteParentTag(tagId)}
                onAddChildTag={handleAddChildTag}
                onShowOnlyTag={showOnlyTag}
                onShowOnlyGroupTags={showOnlyGroupTags}
                onOpenMergeModal={(tagId) => setMergeTargetId(tagId)}
                onReorder={handleReorder}
                indentationWidth={16}
              />

              {/* タグなし（システム項目：グレーで区別） */}
              <FilterItem
                label={t('calendar.filter.untagged')}
                checked={showUntagged}
                onCheckedChange={toggleUntagged}
                onShowOnlyThis={showOnlyUntagged}
                checkboxColor="#6B7280"
                labelClassName="text-muted-foreground"
                count={untaggedCount}
                icon={<CircleSlash className="size-4" />}
              />
            </>
          ) : (
            <div className="text-muted-foreground px-2 py-2 text-xs">
              {t('calendar.filter.noTags')}
            </div>
          )}
        </SidebarSection>

        {/* 見本（公式SortableTree） */}
        <SidebarSection title="見本" defaultOpen className="py-1">
          <SortableTree collapsible indicator indentationWidth={24} />
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

      {/* タグマージモーダル */}
      {mergeTargetId &&
        tags &&
        (() => {
          const sourceTag = tags.find((t) => t.id === mergeTargetId);
          if (!sourceTag) return null;
          const hasChildren = tags.some((t) => t.parent_id === mergeTargetId);
          return (
            <TagMergeModal
              open={mergeTargetId !== null}
              onClose={() => setMergeTargetId(null)}
              sourceTag={{ id: sourceTag.id, name: sourceTag.name, color: sourceTag.color }}
              hasChildren={hasChildren}
            />
          );
        })()}
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
  /** ラベルの追加クラス名（システム項目用） */
  labelClassName?: string | undefined;
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
  labelClassName,
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
      // tagIdがなくてもonShowOnlyThisがあれば右クリックメニューを表示（タグなし用）
      if ((!tagId && !onShowOnlyThis) || disabled) return;
      e.preventDefault();
      setMenuOpen(true);
    },
    [tagId, onShowOnlyThis, disabled],
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
      {/* ノートを編集 */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <FileText className="mr-2 size-4" />
          {t('calendar.filter.editNote')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-[280px] p-3">
          <Field>
            <FieldLabel htmlFor={`tag-note-${tagId}`}>{t('calendar.filter.noteLabel')}</FieldLabel>
            <div className="flex items-center justify-between">
              <FieldSupportText id={`tag-note-support-${tagId}`}>
                {t('calendar.filter.noteHint')}
              </FieldSupportText>
              <span className="text-muted-foreground text-xs tabular-nums">
                {editDescription.length}/100
              </span>
            </div>
            <Textarea
              id={`tag-note-${tagId}`}
              ref={textareaRef}
              value={editDescription}
              placeholder={t('calendar.filter.notePlaceholder')}
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
              aria-describedby={`tag-note-support-${tagId}`}
              className="border-border min-h-[60px] w-full resize-none border text-sm"
            />
            {editDescription.length >= 100 && (
              <FieldError noPrefix>{t('common.validation.limitReached')}</FieldError>
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
                <span className="mr-1 font-medium" style={{ color: parent.color || '#3B82F6' }}>
                  #
                </span>
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
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onDeleteTag(tagId)}>
            <Trash2 className="mr-2 size-4" />
            {t('actions.delete')}
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  const content = (
    <div
      className={cn(
        'group/item hover:bg-state-hover flex h-8 w-full min-w-0 items-center rounded text-sm',
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
        className="ml-2 shrink-0 cursor-pointer"
        style={checkboxStyle}
      />
      {icon && <span className="text-muted-foreground ml-2 shrink-0">{icon}</span>}
      {isEditing ? (
        <div className="ml-2 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              maxLength={TAG_NAME_MAX_LENGTH}
              className="border-border bg-background focus-visible:ring-ring h-auto flex-1 rounded px-2 py-0.5 text-sm shadow-none focus-visible:ring-1"
            />
            <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
              {editName.length}/{TAG_NAME_MAX_LENGTH}
            </span>
          </div>
          {editName.length >= TAG_NAME_MAX_LENGTH && (
            <span className="text-destructive text-[10px]">
              {t('common.validation.limitReached')}
            </span>
          )}
        </div>
      ) : (
        <span className={cn('ml-1 min-w-0 flex-1 truncate', labelClassName)}>{label}</span>
      )}
      {/* メニュー */}
      {(tagId || onShowOnlyThis) && !disabled && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('calendar.filter.tagMenu')}
              className="text-muted-foreground hover:text-foreground hover:bg-state-hover relative flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/item:opacity-100 before:absolute before:-inset-2 before:content-['']"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
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
        <span className="text-muted-foreground flex size-6 shrink-0 items-center justify-center text-xs tabular-nums">
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
  const { openTagCreateModal } = useTagModalNavigation();

  return (
    <HoverTooltip content={t('calendar.filter.createTag')} side="top">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex size-6 items-center justify-center rounded"
        onClick={() => openTagCreateModal()}
      >
        <Plus className="size-4" />
      </button>
    </HoverTooltip>
  );
}
