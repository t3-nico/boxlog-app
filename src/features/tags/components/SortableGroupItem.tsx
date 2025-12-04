'use client'

import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, Folder, MoreHorizontal, Palette, Trash2 } from 'lucide-react'
import { useCallback } from 'react'

import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors'
import { GroupNameWithTooltip } from '@/features/tags/components/GroupNameWithTooltip'
import type { TagGroup } from '@/types/tags'
import { useTranslations } from 'next-intl'

interface SortableGroupItemProps {
  group: TagGroup
  isActive: boolean
  tagCount: number
  onGroupClick: (groupNumber: number) => void
  onStartEdit: (group: TagGroup) => void
  onCancelEdit: () => void
  onSaveEdit: (group: TagGroup) => Promise<void>
  onUpdateColor: (groupId: string, color: string) => Promise<void>
  onDelete: (group: TagGroup) => void
  isEditing: boolean
  editingName: string
  setEditingName: (name: string) => void
}

/**
 * ソート可能なグループアイテムコンポーネント
 */
export function SortableGroupItem({
  group,
  isActive,
  tagCount,
  onGroupClick,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateColor,
  onDelete,
  isEditing,
  editingName,
  setEditingName,
}: SortableGroupItemProps) {
  const t = useTranslations()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id })

  // ドロップゾーンとして設定
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${group.id}`,
    data: {
      type: 'group',
      groupId: group.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
    border: isOver ? '2px dashed rgba(59, 130, 246, 0.5)' : undefined,
  }

  const handleSave = useCallback(() => {
    onSaveEdit(group)
  }, [group, onSaveEdit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        onCancelEdit()
      }
    },
    [handleSave, onCancelEdit]
  )

  // ソートとドロップの両方のrefを設定
  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node)
      setDropRef(node)
    },
    [setNodeRef, setDropRef]
  )

  return (
    <button
      ref={setRefs}
      type="button"
      onClick={() => onGroupClick(group.group_number)}
      className={`group w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
        isActive ? 'bg-foreground/12 text-foreground' : 'text-muted-foreground hover:bg-foreground/8'
      }`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* カラーアイコン */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                aria-label={t('tags.sidebar.changeColorAria', { name: group.name })}
              >
                <Folder className="h-4 w-4 shrink-0" style={{ color: group.color || DEFAULT_GROUP_COLOR }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <ColorPalettePicker
                selectedColor={group.color || DEFAULT_GROUP_COLOR}
                onColorSelect={(color) => onUpdateColor(group.id, color)}
              />
            </PopoverContent>
          </Popover>

          {/* グループ名（インライン編集可能） */}
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
          ) : (
            <GroupNameWithTooltip
              name={group.name}
              onDoubleClick={(e) => {
                e.stopPropagation()
                onStartEdit(group)
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* コンテキストメニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hover:bg-foreground/8 flex h-6 w-6 shrink-0 items-center justify-center rounded p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit(group)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('tags.sidebar.editName')}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  {t('tags.sidebar.changeColor')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-auto p-3">
                  <ColorPalettePicker
                    selectedColor={group.color || DEFAULT_GROUP_COLOR}
                    onColorSelect={(color) => onUpdateColor(group.id, color)}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(group)
                }}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('tags.sidebar.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* タグ数 */}
          <span className="text-muted-foreground text-xs">{tagCount}</span>
        </div>
      </div>
    </button>
  )
}
