'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/useTagGroups';
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import type { TagGroup } from '@/features/tags/types';
import { Columns3, Folder, FolderTree, List, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { TagGroupManageDialog } from './TagGroupManageDialog';

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
 * Linear/Account.tsx風の2カラム構造
 * - DropdownMenuSub でカテゴリ → サブメニュー
 * - 表示モード: RadioGroup（単一選択）
 * - 列の表示: CheckboxItem（複数選択）
 * - グループ管理: 作成・編集・削除
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
  const updateGroupMutation = useUpdateTagGroup();
  const deleteGroupMutation = useDeleteTagGroup();

  // ダイアログ状態
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
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

  // グループ作成を開く
  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setIsGroupDialogOpen(true);
  };

  // グループ編集を開く
  const handleOpenEditGroup = (group: TagGroup) => {
    setEditingGroup(group);
    setIsGroupDialogOpen(true);
  };

  // グループ保存
  const handleSaveGroup = async (data: { name: string; color: string }) => {
    if (editingGroup) {
      // 編集
      await updateGroupMutation.mutateAsync({
        id: editingGroup.id,
        data: {
          name: data.name,
          description: editingGroup.description,
          color: data.color,
        },
      });
      toast.success(t('toast.groupUpdated', { name: data.name }));
    } else {
      // 作成
      const slug = data.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

      await createGroupMutation.mutateAsync({
        name: data.name,
        slug: slug || `group-${Date.now()}`,
        description: null,
        color: data.color,
      });
      toast.success(t('toast.groupCreated', { name: data.name }));
    }
  };

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
          <DropdownMenuSubContent className="border-input w-56">
            <ScrollArea className="max-h-64">
              {/* グループ一覧 */}
              {groups.map((group) => (
                <div key={group.id} className="group flex items-center">
                  <DropdownMenuItem
                    className="flex-1"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleOpenEditGroup(group);
                    }}
                  >
                    <Folder className="size-4" style={{ color: group.color ?? undefined }} />
                    <span className="flex-1 truncate">{group.name}</span>
                    <Pencil className="text-muted-foreground size-3 opacity-0 group-hover:opacity-100" />
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

              {groups.length === 0 && (
                <div className="text-muted-foreground px-2 py-2 text-center text-sm">
                  {t('settings.noGroups')}
                </div>
              )}
            </ScrollArea>

            <DropdownMenuSeparator />

            {/* 新規作成 */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleOpenCreateGroup();
              }}
            >
              <Plus className="size-4" />
              {t('settings.createGroup')}
            </DropdownMenuItem>
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

      {/* グループ作成/編集ダイアログ */}
      <TagGroupManageDialog
        isOpen={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        group={editingGroup}
        onSave={handleSaveGroup}
      />

      {/* グループ削除確認ダイアログ */}
      <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('group.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('group.deleteDescription', { name: deletingGroup?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
