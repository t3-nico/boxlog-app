'use client';

import { useCallback, useRef, useState } from 'react';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
} from '@/features/tags/hooks/useTagGroups';
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import type { TagGroup } from '@/features/tags/types';
import {
  Check,
  Columns3,
  Folder,
  FolderTree,
  List,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/**
 * 表示モードオプション（valueとiconのみ定義、labelは翻訳から取得）
 */
const DISPLAY_MODE_OPTIONS = [
  { value: 'flat', labelKey: 'page.displayMode.flat', icon: List },
  { value: 'grouped', labelKey: 'page.displayMode.grouped', icon: FolderTree },
] as const;

/**
 * タグ設定コンテンツ
 *
 * - 表示モード: RadioGroup（単一選択）
 * - 列の表示: CheckboxItem（複数選択）
 * - グループ管理: インライン作成・削除（編集はグループヘッダーで）
 */
export function TagsSettingsContent() {
  const t = useTranslations('tag');

  // 表示モード
  const displayMode = useTagDisplayModeStore((state) => state.displayMode);
  const setDisplayMode = useTagDisplayModeStore((state) => state.setDisplayMode);

  // 列設定
  const columns = useTagColumnStore((state) => state.columns);
  const toggleColumnVisibility = useTagColumnStore((state) => state.toggleColumnVisibility);
  const resetColumns = useTagColumnStore((state) => state.resetColumns);

  // グループ関連
  const { data: groups = [] } = useTagGroups();
  const createGroupMutation = useCreateTagGroup();
  const deleteGroupMutation = useDeleteTagGroup();

  // インライン作成状態
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_GROUP_COLOR);
  const inputRef = useRef<HTMLInputElement>(null);

  // 削除ダイアログ状態
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null);

  // 設定可能な列（selectionとname以外）
  const configurableColumns = columns.filter((col) => col.id !== 'selection' && col.id !== 'name');

  // 非表示の列数をカウント
  const hiddenColumnCount = configurableColumns.filter((col) => !col.visible).length;

  // 設定がアクティブかどうか
  const hasActiveSettings = displayMode === 'grouped' || hiddenColumnCount > 0;

  // リセット
  const handleReset = () => {
    setDisplayMode('flat');
    resetColumns();
  };

  // インライン作成を開始
  const handleStartCreate = useCallback(() => {
    setIsCreating(true);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_GROUP_COLOR);
    // 次のレンダリング後にフォーカス
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // インライン作成をキャンセル
  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_GROUP_COLOR);
  }, []);

  // インライン作成を保存
  const handleSaveCreate = useCallback(async () => {
    if (!newGroupName.trim()) return;

    const slug = newGroupName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        slug: slug || `group-${Date.now()}`,
        description: null,
        color: newGroupColor,
      });
      toast.success(t('toast.groupCreated', { name: newGroupName.trim() }));
      handleCancelCreate();
    } catch (error) {
      console.error('Failed to create tag group:', error);
      toast.error(t('toast.groupCreateFailed'));
    }
  }, [newGroupName, newGroupColor, createGroupMutation, t, handleCancelCreate]);

  // グループ削除確認
  const handleConfirmDelete = async () => {
    if (!deletingGroup) return;

    try {
      await deleteGroupMutation.mutateAsync({ id: deletingGroup.id });
      toast.success(t('toast.groupDeleted', { name: deletingGroup.name }));
      setDeletingGroup(null);
    } catch (error) {
      console.error('Failed to delete tag group:', error);
      toast.error(t('toast.groupDeleteFailed'));
    }
  };

  return (
    <>
      <DropdownMenuGroup>
        {/* グループ管理 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderTree />
            <span className="flex-1">{t('settings.manageGroups')}</span>
            <span className="text-muted-foreground text-xs">{groups.length}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input w-64">
            <ScrollArea className="max-h-64">
              {/* グループ一覧（表示のみ、編集はグループヘッダーで） */}
              {groups.map((group) => (
                <div key={group.id} className="group flex items-center">
                  <DropdownMenuItem className="flex-1" onSelect={(e) => e.preventDefault()}>
                    <Folder className="size-4" style={{ color: group.color ?? undefined }} />
                    <span className="flex-1 truncate">{group.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive hover:text-destructive px-2"
                    onSelect={(e) => {
                      e.preventDefault();
                      setDeletingGroup(group);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </DropdownMenuItem>
                </div>
              ))}

              {groups.length === 0 && !isCreating && (
                <div className="text-muted-foreground px-2 py-2 text-center text-sm">
                  {t('settings.noGroups')}
                </div>
              )}
            </ScrollArea>

            <DropdownMenuSeparator />

            {/* インライン作成フォーム */}
            {isCreating ? (
              <div
                className="flex items-center gap-1 px-2 py-1.5"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveCreate();
                  } else if (e.key === 'Escape') {
                    handleCancelCreate();
                  }
                }}
              >
                {/* カラーピッカー */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 shrink-0 p-0"
                    >
                      <Folder className="size-4" style={{ color: newGroupColor }} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start" side="left">
                    <ColorPalettePicker
                      selectedColor={newGroupColor}
                      onColorSelect={setNewGroupColor}
                    />
                  </PopoverContent>
                </Popover>

                {/* 名前入力 */}
                <Input
                  ref={inputRef}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t('group.namePlaceholder')}
                  className="h-7 flex-1 text-sm"
                />

                {/* 保存ボタン */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 shrink-0"
                  onClick={handleSaveCreate}
                  disabled={!newGroupName.trim() || createGroupMutation.isPending}
                >
                  <Check className="size-4" />
                </Button>

                {/* キャンセルボタン */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 shrink-0"
                  onClick={handleCancelCreate}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleStartCreate();
                }}
              >
                <Plus className="size-4" />
                {t('settings.createGroup')}
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 表示モード */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <List />
            <span className="flex-1">{t('settings.displayMode')}</span>
            {displayMode === 'grouped' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={displayMode}
              onValueChange={(v) => setDisplayMode(v as 'flat' | 'grouped')}
            >
              {DISPLAY_MODE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <option.icon className="size-4" />
                    {t(option.labelKey)}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 列の表示 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Columns3 />
            <span className="flex-1">{t('settings.columns')}</span>
            {hiddenColumnCount > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {hiddenColumnCount}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {configurableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.id as TagColumnId)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（設定がアクティブな場合のみ表示） */}
      {hasActiveSettings && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReset}>
            <RotateCcw />
            {t('settings.reset')}
          </DropdownMenuItem>
        </>
      )}

      {/* グループ削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
        title={t('group.deleteTitle', { name: deletingGroup?.name ?? '' })}
        description={t('group.deleteDescription')}
      />
    </>
  );
}
