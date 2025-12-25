'use client';

import { Check, Folder, FolderX } from 'lucide-react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DEFAULT_GROUP_COLOR } from '@/features/tags/constants/colors';
import type { TagGroup } from '@/features/tags/types';

interface TagGroupMenuItemsProps {
  groups: TagGroup[];
  currentGroupId: string | null;
  onSelect: (groupId: string | null) => void;
}

/**
 * タググループ選択メニューアイテム
 * DropdownMenuContent / DropdownMenuSubContent の中で使用
 */
export function TagGroupMenuItems({ groups, currentGroupId, onSelect }: TagGroupMenuItemsProps) {
  const isNoGroup = !currentGroupId;

  return (
    <>
      <DropdownMenuItem onClick={() => onSelect(null)} className="hover:bg-state-hover">
        <FolderX className="mr-2 h-4 w-4" />
        <span className="flex-1">グループなし</span>
        {isNoGroup && <Check className="text-primary ml-2 h-4 w-4" />}
      </DropdownMenuItem>
      {groups.length > 0 && <DropdownMenuSeparator />}
      {groups.map((group) => {
        const isSelected = currentGroupId === group.id;
        return (
          <DropdownMenuItem
            key={group.id}
            onClick={() => onSelect(group.id)}
            className="hover:bg-state-hover"
          >
            <Folder
              className="mr-2 h-4 w-4"
              style={{ color: group.color || DEFAULT_GROUP_COLOR }}
            />
            <span className="flex-1">{group.name}</span>
            {isSelected && <Check className="text-primary ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        );
      })}
    </>
  );
}
