'use client';

/**
 * TagInspector のメニューコンテンツ
 */

import { memo } from 'react';

import {
  Archive,
  CheckIcon,
  Folder,
  Merge,
  Palette,
  PanelRight,
  SquareMousePointer,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { InspectorDisplayMode } from '@/features/inspector';
import type { TagGroup } from '@/features/tags/types';

import { TagGroupMenuItems } from '../TagGroupDropdown';

interface TagInspectorMenuProps {
  groups: TagGroup[];
  currentGroupId: string | null;
  displayMode: InspectorDisplayMode;
  onColorPickerOpen: () => void;
  onGroupChange: (groupId: string | null) => void;
  onMerge: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDisplayModeChange: (mode: InspectorDisplayMode) => void;
}

export const TagInspectorMenu = memo(function TagInspectorMenu({
  groups,
  currentGroupId,
  displayMode,
  onColorPickerOpen,
  onGroupChange,
  onMerge,
  onArchive,
  onDelete,
  onDisplayModeChange,
}: TagInspectorMenuProps) {
  return (
    <>
      <DropdownMenuItem onClick={onColorPickerOpen}>
        <Palette className="size-4" />
        カラー変更
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Folder className="size-4" />
          グループを変更
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-48">
          <TagGroupMenuItems
            groups={groups}
            currentGroupId={currentGroupId}
            onSelect={onGroupChange}
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem onClick={onMerge}>
        <Merge className="size-4" />
        マージ
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onArchive}>
        <Archive className="size-4" />
        アーカイブ
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="text-muted-foreground px-2 py-2 text-xs font-medium">表示モード</div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onDisplayModeChange('sheet')}
        className="flex w-full cursor-default justify-between gap-2"
      >
        <span className="flex items-center gap-2">
          <PanelRight className="size-4 shrink-0" />
          パネル
        </span>
        {displayMode === 'sheet' && <CheckIcon className="text-primary size-4" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onDisplayModeChange('popover')}
        className="flex w-full cursor-default justify-between gap-2"
      >
        <span className="flex items-center gap-2">
          <SquareMousePointer className="size-4 shrink-0" />
          ポップアップ
        </span>
        {displayMode === 'popover' && <CheckIcon className="text-primary size-4" />}
      </Button>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  );
});
