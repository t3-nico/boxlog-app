'use client';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableRow } from '@/components/ui/table';
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { TagActionMenuItems } from '@/features/tags/components/TagActionMenuItems';
import { useUpdateTag } from '@/features/tags/hooks/useTags';
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore';
import type { Tag, TagGroup } from '@/features/tags/types';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Folder, FolderX, Hash, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

// ============================================
// セル内容コンポーネント（DataTable用）
// ============================================

interface TagCellContentProps {
  /** 表示するタグ */
  tag: Tag;
  /** 列ID */
  columnId: string;
  /** グループ一覧 */
  groups: TagGroup[];
  /** 全タグ一覧（グループ内タグ数計算用） */
  allTags: Tag[];
  /** プラン数のマップ */
  planCounts: Record<string, number>;
  /** 最終使用日時のマップ */
  lastUsed: Record<string, string>;
  /** グループ作成コールバック（インライン作成用） */
  onCreateGroup?: (name: string) => Promise<TagGroup>;
}

/**
 * タグテーブルのセル内容をレンダリング
 * DataTableのrender関数から使用
 */
export function TagCellContent({
  tag,
  columnId,
  groups,
  allTags: _allTags,
  planCounts: _planCounts,
  lastUsed,
  onCreateGroup,
}: TagCellContentProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();

  // インライン編集の状態
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');

  // インライングループ作成の状態
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // 日時フォーマット関数
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'yyyy/MM/dd HH:mm', { locale: ja });
  };

  // インライン編集キャンセル
  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  // インライン編集保存
  const saveInlineEdit = useCallback(async () => {
    if (!editingField) {
      cancelEditing();
      return;
    }
    // nameは必須、descriptionは空でもOK
    if (editingField === 'name' && editValue.trim() === '') {
      cancelEditing();
      return;
    }
    try {
      await updateTagMutation.mutateAsync({
        id: tag.id,
        data: { [editingField]: editValue.trim() || null },
      });
      cancelEditing();
    } catch (error) {
      logger.error('Failed to update tag:', error);
    }
  }, [editingField, editValue, updateTagMutation, tag.id, cancelEditing]);

  // グループ情報
  const group = tag.parent_id ? groups.find((g) => g.id === tag.parent_id) : null;

  switch (columnId) {
    case 'name':
      return (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label={t('tags.page.changeColor')}
              >
                <Hash className="h-4 w-4" style={{ color: tag.color || DEFAULT_TAG_COLOR }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <ColorPalettePicker
                selectedColor={tag.color || DEFAULT_TAG_COLOR}
                onColorSelect={(color) => {
                  updateTagMutation.mutate({ id: tag.id, data: { color } });
                }}
              />
            </PopoverContent>
          </Popover>
          {editingField === 'name' ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveInlineEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveInlineEdit();
                else if (e.key === 'Escape') cancelEditing();
              }}
              autoFocus
              className="h-7 px-2"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>
          )}
        </div>
      );

    case 'description':
      return editingField === 'description' ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveInlineEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveInlineEdit();
            else if (e.key === 'Escape') cancelEditing();
          }}
          autoFocus
          placeholder={t('tags.page.addDescription')}
          className="h-7 px-2"
        />
      ) : (
        <span
          className="text-muted-foreground block max-w-32 cursor-pointer truncate sm:max-w-[200px]"
          onClick={() => {
            setEditingField('description');
            setEditValue(tag.description || '');
          }}
        >
          {tag.description || t('tags.page.addDescription')}
        </span>
      );

    case 'group':
      // インライングループ作成モード
      if (isCreatingGroup) {
        return (
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && newGroupName.trim() && onCreateGroup) {
                e.preventDefault();
                const newGroup = await onCreateGroup(newGroupName.trim());
                updateTagMutation.mutate({ id: tag.id, data: { parentId: newGroup.id } });
                setIsCreatingGroup(false);
                setNewGroupName('');
              } else if (e.key === 'Escape') {
                setIsCreatingGroup(false);
                setNewGroupName('');
              }
            }}
            onBlur={() => {
              setIsCreatingGroup(false);
              setNewGroupName('');
            }}
            placeholder={t('tags.group.namePlaceholder')}
            className="h-7 w-32 text-sm sm:w-[160px]"
            autoFocus
          />
        );
      }

      return (
        <Select
          value={tag.parent_id || 'uncategorized'}
          onValueChange={(value) => {
            if (value === '__create_new__') {
              setIsCreatingGroup(true);
              return;
            }
            const newGroupId = value === 'uncategorized' ? null : value;
            updateTagMutation.mutate({ id: tag.id, data: { parentId: newGroupId } });
          }}
        >
          <SelectTrigger className="h-auto w-32 justify-start border-none bg-transparent p-0 shadow-none focus:ring-0 sm:w-[160px] [&>svg:last-child]:hidden">
            <SelectValue>
              {group ? (
                <div className="flex items-center gap-2">
                  <Folder
                    className="h-4 w-4 shrink-0"
                    style={{ color: group.color || DEFAULT_GROUP_COLOR }}
                  />
                  <span className="text-sm">{group.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FolderX className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground text-sm">
                    {t('tags.sidebar.uncategorized')}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uncategorized">
              <div className="flex items-center gap-2">
                <FolderX className="text-muted-foreground h-4 w-4" />
                <span>{t('tags.sidebar.uncategorized')}</span>
              </div>
            </SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" style={{ color: g.color || DEFAULT_GROUP_COLOR }} />
                  <span>{g.name}</span>
                </div>
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="__create_new__">
              <div className="flex items-center gap-2">
                <Plus className="text-muted-foreground h-4 w-4" />
                <span>{t('tags.group.create')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      );

    case 'created_at':
      return (
        <span className="text-muted-foreground text-xs">
          {tag.created_at ? formatDate(tag.created_at) : '-'}
        </span>
      );

    case 'last_used': {
      const lastUsedDate = lastUsed[tag.id];
      return (
        <span className="text-muted-foreground text-xs">
          {lastUsedDate ? formatDate(lastUsedDate) : '-'}
        </span>
      );
    }

    default:
      return null;
  }
}

// ============================================
// 行ラッパーコンポーネント（DataTable用）
// ============================================

interface TagRowWrapperProps {
  /** タグデータ */
  tag: Tag;
  /** 子要素（DataTableの行） */
  children: ReactNode;
  /** 選択状態 */
  isSelected: boolean;
  /** グループ一覧 */
  groups: TagGroup[];
  /** グループ移動時のコールバック */
  onMoveToGroup: (tag: Tag, groupId: string | null) => void;
  /** アーカイブ確認ダイアログを開く */
  onArchiveConfirm: (tag: Tag) => void;
  /** 削除確認ダイアログを開く */
  onDeleteConfirm: (tag: Tag) => void;
}

/**
 * タグ行のラッパー（コンテキストメニュー）
 * DataTableのrowWrapper propから使用
 */
export function TagRowWrapper({
  tag,
  children,
  isSelected,
  groups,
  onMoveToGroup,
  onArchiveConfirm,
  onDeleteConfirm,
}: TagRowWrapperProps) {
  const t = useTranslations();
  const { setSelectedIds } = useTagSelectionStore();

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <TableRow
          className={cn(isSelected && 'bg-primary-state-selected hover:bg-state-dragged')}
          onContextMenu={() => {
            if (!isSelected) {
              setSelectedIds([tag.id]);
            }
          }}
        >
          {children}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <TagActionMenuItems
          tag={tag}
          groups={groups}
          onMoveToGroup={onMoveToGroup}
          onArchive={onArchiveConfirm}
          onDelete={onDeleteConfirm}
          t={t}
          renderMenuItem={({ icon, label, onClick, variant }) => (
            <ContextMenuItem
              onClick={onClick}
              className={
                variant === 'destructive'
                  ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                  : ''
              }
            >
              {icon}
              {label}
            </ContextMenuItem>
          )}
          renderSubMenu={({ trigger, items }) => (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                {trigger.icon}
                {trigger.label}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="min-w-48">
                {items.map((item) => (
                  <ContextMenuItem key={item.key} onClick={item.onClick}>
                    {item.icon}
                    {item.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
