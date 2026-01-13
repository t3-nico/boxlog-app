'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TableCell, TableRow } from '@/components/ui/table';
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import { useUpdateTagGroup } from '@/features/tags/hooks/useTagGroups';
import type { TagGroup } from '@/features/tags/types';
import { ChevronDown, ChevronRight, Folder, FolderX, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface TagGroupHeaderProps {
  groupKey: string;
  groupLabel: string;
  count: number;
  columnCount: number;
  isCollapsed: boolean;
  tagGroup: TagGroup | undefined;
  onToggleCollapse: (groupKey: string) => void;
  onDeleteGroup?: (group: TagGroup) => void;
}

/**
 * タググループヘッダー
 *
 * - Folderアイコン: クリックでカラー変更
 * - グループ名: ダブルクリックでインライン編集
 * - 削除ボタン: ホバーで表示
 */
export function TagGroupHeader({
  groupKey,
  groupLabel,
  count,
  columnCount,
  isCollapsed,
  tagGroup,
  onToggleCollapse,
  onDeleteGroup,
}: TagGroupHeaderProps) {
  const t = useTranslations('tag');
  const isUncategorized = groupKey === '__uncategorized__';

  // カラーピッカー状態
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // インライン編集状態
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(groupLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const updateGroupMutation = useUpdateTagGroup();

  // 編集開始時にフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // カラー変更
  const handleColorChange = useCallback(
    async (color: string) => {
      if (!tagGroup) return;
      try {
        await updateGroupMutation.mutateAsync({
          id: tagGroup.id,
          data: { name: tagGroup.name, description: tagGroup.description, color },
        });
        toast.success(t('toast.groupUpdated', { name: tagGroup.name }));
        setColorPickerOpen(false);
      } catch {
        toast.error(t('toast.groupUpdateFailed'));
      }
    },
    [tagGroup, updateGroupMutation, t],
  );

  // ダブルクリックで編集開始
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isUncategorized) return;
      e.stopPropagation();
      setEditName(groupLabel);
      setIsEditing(true);
    },
    [isUncategorized, groupLabel],
  );

  // 名前変更保存
  const handleSaveName = useCallback(async () => {
    if (!tagGroup || !editName.trim()) {
      setIsEditing(false);
      return;
    }
    if (editName.trim() === tagGroup.name) {
      setIsEditing(false);
      return;
    }
    try {
      await updateGroupMutation.mutateAsync({
        id: tagGroup.id,
        data: { name: editName.trim(), description: tagGroup.description, color: tagGroup.color },
      });
      toast.success(t('toast.groupUpdated', { name: editName.trim() }));
      setIsEditing(false);
    } catch {
      toast.error(t('toast.groupUpdateFailed'));
      setIsEditing(false);
    }
  }, [tagGroup, editName, updateGroupMutation, t]);

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

  return (
    <TableRow
      key={`group-${groupKey}`}
      className="bg-surface-container hover:bg-state-hover group cursor-pointer border-y"
      onClick={() => !isEditing && onToggleCollapse(groupKey)}
    >
      {/* checkbox列用の空セル */}
      <TableCell className="w-[50px] py-2" />
      <TableCell colSpan={columnCount - 1} className="py-2">
        <div className="flex items-center gap-2">
          {/* グループカラーアイコン（クリックで色変更） */}
          {isUncategorized ? (
            <FolderX className="text-muted-foreground size-4" />
          ) : (
            <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Folder
                    className="size-4"
                    style={{ color: tagGroup?.color || DEFAULT_GROUP_COLOR }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start" side="bottom">
                <ColorPalettePicker
                  selectedColor={tagGroup?.color || DEFAULT_GROUP_COLOR}
                  onColorSelect={handleColorChange}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* 折りたたみアイコン */}
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}

          {/* グループ名（ダブルクリックで編集） */}
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-48 text-sm font-semibold"
            />
          ) : (
            <span
              className="font-semibold"
              onDoubleClick={handleDoubleClick}
              title={isUncategorized ? undefined : t('group.doubleClickToEdit')}
            >
              {groupLabel}
            </span>
          )}

          {/* カウント */}
          <Badge variant="secondary" className="ml-1">
            {count}
          </Badge>

          {/* 削除ボタン（ホバーで表示、未分類以外） */}
          {!isUncategorized && tagGroup && onDeleteGroup && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive ml-1 size-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGroup(tagGroup);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
