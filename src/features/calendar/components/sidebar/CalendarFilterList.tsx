'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ChevronRight,
  CircleDashed,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { type ItemType, useCalendarFilterStore } from '../../stores/useCalendarFilterStore';

import { SidebarSection } from '@/features/navigation/components/sidebar/SidebarSection';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useDeleteTag, useTags, useUpdateTag } from '@/features/tags/hooks/useTags';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
export function CalendarFilterList() {
  const t = useTranslations();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: groups, isLoading: groupsLoading } = useTagGroups();
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = tagStats?.counts ?? {};
  const deleteTagMutation = useDeleteTag();

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

    const ungrouped = tags.filter((tag) => !tag.parent_id);

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

  return (
    <>
      <div className="min-w-0 space-y-2 overflow-hidden p-2">
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
            <>
              {/* グループ別タグ */}
              {groupedTags.grouped.map(
                ({ group, tags: groupTags }) =>
                  groupTags.length > 0 && (
                    <TagGroupSection
                      key={group.id}
                      groupId={group.id}
                      groupName={group.name}
                      groupColor={group.color || undefined}
                      tags={groupTags.map((t) => ({
                        id: t.id,
                        name: t.name,
                        color: t.color || '#3B82F6',
                        description: t.description,
                      }))}
                      visibleTagIds={visibleTagIds}
                      onToggleTag={toggleTag}
                      onToggleGroup={() => toggleGroupTags(groupTags.map((t) => t.id))}
                      groupVisibility={getGroupVisibility(groupTags.map((t) => t.id))}
                      tagPlanCounts={tagPlanCounts}
                      onAddChildTag={handleAddChildTag}
                      onDeleteGroup={handleDeleteParentTag}
                    />
                  ),
              )}

              {/* グループなしタグ */}
              {groupedTags.ungrouped.length > 0 && (
                <TagGroupSection
                  groupName={t('calendar.filter.ungrouped')}
                  tags={groupedTags.ungrouped.map((t) => ({
                    id: t.id,
                    name: t.name,
                    color: t.color || '#3B82F6',
                    description: t.description,
                  }))}
                  visibleTagIds={visibleTagIds}
                  onToggleTag={toggleTag}
                  onToggleGroup={() => toggleGroupTags(groupedTags.ungrouped.map((t) => t.id))}
                  groupVisibility={getGroupVisibility(groupedTags.ungrouped.map((t) => t.id))}
                  tagPlanCounts={tagPlanCounts}
                />
              )}

              {/* タグなし */}
              <FilterItem
                label={t('calendar.filter.untagged')}
                icon={<CircleDashed className="size-4" />}
                checked={showUntagged}
                onCheckedChange={toggleUntagged}
              />
            </>
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

/** タググループセクション */
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
}

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
}: TagGroupSectionProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();

  // インライン編集状態
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(groupName);
  const inputRef = useRef<HTMLInputElement>(null);

  // カラーピッカー状態
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // 編集開始時にフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
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

  // カラー変更
  const handleColorChange = useCallback(
    async (color: string) => {
      if (!groupId) return;
      await updateTagMutation.mutateAsync({
        id: groupId,
        data: { color },
      });
      setColorPickerOpen(false);
    },
    [groupId, updateTagMutation],
  );

  const groupCheckboxStyle = groupColor
    ? ({
        borderColor: groupColor,
        backgroundColor: groupVisibility === 'all' ? groupColor : 'transparent',
      } as React.CSSProperties)
    : undefined;

  return (
    <Collapsible defaultOpen className="min-w-0">
      <div className="group hover:bg-state-hover flex min-w-0 items-center rounded transition-colors">
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
            className="mx-2 h-6 flex-1 text-sm font-medium"
          />
        ) : (
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-center overflow-hidden px-2 py-1 text-sm font-medium">
            <span className="min-w-0 truncate">{groupName}</span>
          </CollapsibleTrigger>
        )}
        {/* アクションメニュー（ホバーで表示） */}
        {groupId && (onAddChildTag || onDeleteGroup) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              {/* 名前を変更 */}
              <DropdownMenuItem onClick={handleStartRename}>
                <Pencil className="mr-2 size-4" />
                {t('calendar.filter.rename')}
              </DropdownMenuItem>
              {/* カラーを変更 */}
              <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Palette className="mr-2 size-4" />
                    {t('calendar.filter.changeColor')}
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start" side="right">
                  <ColorPalettePicker
                    selectedColor={groupColor || '#3B82F6'}
                    onColorSelect={handleColorChange}
                  />
                </PopoverContent>
              </Popover>
              {onAddChildTag && (
                <DropdownMenuItem onClick={() => onAddChildTag(groupId)}>
                  <Plus className="mr-2 size-4" />
                  {t('calendar.filter.addChildTag')}
                </DropdownMenuItem>
              )}
              {onDeleteGroup && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteGroup(groupId)}
                >
                  <Trash2 className="mr-2 size-4" />
                  {t('actions.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* 折りたたみアイコン */}
        <CollapsibleTrigger className="flex size-6 shrink-0 items-center justify-center">
          <ChevronRight className="size-4 transition-transform [[data-state=open]>&]:rotate-90" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="min-w-0 space-y-1 overflow-hidden pl-4">
          {tags.map((tag) => (
            <FilterItem
              key={tag.id}
              label={tag.name}
              tagId={tag.id}
              description={tag.description}
              checkboxColor={tag.color || undefined}
              checked={visibleTagIds.has(tag.id)}
              onCheckedChange={() => onToggleTag(tag.id)}
              count={tagPlanCounts[tag.id] ?? 0}
            />
          ))}
        </div>
      </CollapsibleContent>
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
}: FilterItemProps) {
  const { openInspector } = useTagInspectorStore();

  // チェックボックスのカスタムスタイル
  const checkboxStyle = checkboxColor
    ? ({
        borderColor: checkboxColor,
        backgroundColor: checked ? checkboxColor : 'transparent',
      } as React.CSSProperties)
    : undefined;

  // 名前クリックでInspectorを開く
  const handleNameClick = (e: React.MouseEvent) => {
    if (tagId && !disabled) {
      e.preventDefault();
      e.stopPropagation();
      openInspector(tagId);
    }
  };

  // 親幅 w-60 (240px) - padding 16px = 224px
  // チェックボックス 16px + gap 8px + 数字用 24px + gap 8px = 56px
  // ラベル最大幅 = 224px - 56px = 168px
  const content = (
    <div
      className={cn(
        'hover:bg-state-hover flex w-full items-center gap-2 rounded px-2 py-1 text-sm',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      title={disabled ? disabledReason : undefined}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="h-4 w-4 shrink-0 cursor-pointer"
        style={checkboxStyle}
      />
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      <span
        className={cn(
          'max-w-[140px] truncate',
          tagId && !disabled && 'cursor-pointer hover:underline',
        )}
        onClick={handleNameClick}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground ml-auto w-4 shrink-0 text-right text-xs tabular-nums">
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
