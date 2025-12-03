'use client'

import { Folder, Hash } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell, TableRow } from '@/components/ui/table'
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import type { TranslationFunction } from '@/features/i18n/lib/hooks'
import { TagActionMenuItems } from '@/features/tags/components/TagActionMenuItems'
import type { TagGroup, TagWithChildren } from '@/features/tags/types'

interface ColumnWidths {
  select: number
  id: number
  color: number
  name: number
  description: number
  group: number
  created_at: number
  actions: number
}

interface TagRowProps {
  tag: TagWithChildren
  groups: TagGroup[]
  tags: TagWithChildren[]
  columnWidths: ColumnWidths
  isSelected: boolean
  isEditing: boolean
  editingField: 'name' | 'description' | null
  editValue: string
  planCount: number
  onSelect: (tagId: string) => void
  onContextSelect: (tagId: string) => void
  onColorChange: (tagId: string, color: string) => void
  onEditStart: (tag: TagWithChildren) => void
  onEditChange: (value: string) => void
  onEditSave: (tagId: string) => void
  onEditCancel: () => void
  onView: (tag: TagWithChildren) => void
  onMoveToGroup: (tag: TagWithChildren, groupId: string | null) => void
  onArchive: (tag: TagWithChildren) => void
  onDelete: (tag: TagWithChildren) => void
  formatDate: (date: Date | string) => string
  t: TranslationFunction
}

export function TagRow({
  tag,
  groups,
  tags,
  columnWidths,
  isSelected,
  isEditing,
  editingField,
  editValue,
  planCount,
  onSelect,
  onContextSelect,
  onColorChange,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onView,
  onMoveToGroup,
  onArchive,
  onDelete,
  formatDate,
  t,
}: TagRowProps) {
  const group = tag.group_id ? groups.find((g) => g.id === tag.group_id) : null
  const groupTagCount = group ? tags.filter((t) => t.group_id === group.id && t.is_active && t.level === 0).length : 0

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <TableRow
          className="group"
          onContextMenu={() => {
            if (!isSelected) {
              onContextSelect(tag.id)
            }
          }}
        >
          <TableCell style={{ width: `${columnWidths.select}px` }} onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(tag.id)}
              aria-label={t('tags.page.selectTag', { name: tag.name })}
            />
          </TableCell>
          <TableCell className="text-muted-foreground font-mono text-sm" style={{ width: `${columnWidths.id}px` }}>
            t-{tag.tag_number}
          </TableCell>
          <TableCell className="font-medium" style={{ width: `${columnWidths.color + columnWidths.name}px` }}>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                    aria-label={t('tags.page.changeColor')}
                  >
                    <Hash
                      className="h-4 w-4"
                      style={{ color: tag.color || DEFAULT_TAG_COLOR }}
                      aria-label={t('tags.page.tagColor')}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <ColorPalettePicker
                    selectedColor={tag.color || DEFAULT_TAG_COLOR}
                    onColorSelect={(color) => onColorChange(tag.id, color)}
                  />
                </PopoverContent>
              </Popover>
              {isEditing && editingField === 'name' ? (
                <Input
                  value={editValue}
                  onChange={(e) => onEditChange(e.target.value)}
                  onBlur={() => onEditSave(tag.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onEditSave(tag.id)
                    } else if (e.key === 'Escape') {
                      onEditCancel()
                    }
                  }}
                  autoFocus
                  className="h-7 px-2"
                />
              ) : (
                <span className="cursor-pointer hover:underline" onClick={() => onView(tag)}>
                  {tag.name} <span className="text-muted-foreground">({planCount})</span>
                </span>
              )}
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground" style={{ width: `${columnWidths.description}px` }}>
            <span className="truncate">
              {tag.description || (
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  {t('tags.page.addDescription')}
                </span>
              )}
            </span>
          </TableCell>
          <TableCell style={{ width: `${columnWidths.group}px` }}>
            {group ? (
              <div className="flex items-center gap-1">
                <Folder className="h-4 w-4 shrink-0" style={{ color: group.color || DEFAULT_GROUP_COLOR }} />
                <span className="text-sm">
                  {group.name} <span className="text-muted-foreground">({groupTagCount})</span>
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm opacity-0 transition-opacity group-hover:opacity-100">
                {t('tags.page.addGroup')}
              </span>
            )}
          </TableCell>
          <TableCell className="text-muted-foreground text-xs" style={{ width: `${columnWidths.created_at}px` }}>
            {formatDate(tag.created_at)}
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <TagActionMenuItems
          tag={tag}
          groups={groups}
          onView={onView}
          onEdit={onEditStart}
          onMoveToGroup={onMoveToGroup}
          onArchive={onArchive}
          onDelete={onDelete}
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
  )
}
