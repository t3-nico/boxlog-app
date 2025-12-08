'use client'

import { Folder, FolderX } from 'lucide-react'

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { DEFAULT_GROUP_COLOR } from '@/features/tags/constants/colors'
import type { TagGroup } from '@/features/tags/types'

interface TagGroupMenuItemsProps {
  groups: TagGroup[]
  currentGroupId: string | null
  onSelect: (groupId: string | null) => void
}

/**
 * タググループ選択メニューアイテム
 * DropdownMenuContent / DropdownMenuSubContent の中で使用
 */
export function TagGroupMenuItems({ groups, currentGroupId, onSelect }: TagGroupMenuItemsProps) {
  return (
    <>
      <DropdownMenuItem onClick={() => onSelect(null)} className={!currentGroupId ? 'bg-state-active' : ''}>
        <FolderX className="mr-2 h-4 w-4" />
        グループなし
      </DropdownMenuItem>
      {groups.length > 0 && <DropdownMenuSeparator />}
      {groups.map((group) => (
        <DropdownMenuItem
          key={group.id}
          onClick={() => onSelect(group.id)}
          className={currentGroupId === group.id ? 'bg-state-active' : ''}
        >
          <Folder className="mr-2 h-4 w-4" style={{ color: group.color || DEFAULT_GROUP_COLOR }} />
          {group.name}
        </DropdownMenuItem>
      ))}
    </>
  )
}
