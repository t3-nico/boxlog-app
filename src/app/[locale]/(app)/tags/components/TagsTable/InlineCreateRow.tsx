'use client'

import type React from 'react'
import { forwardRef } from 'react'

import { Folder, Hash } from 'lucide-react'
import { toast } from 'sonner'

import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell, TableRow } from '@/components/ui/table'
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors'
import { TAG_DESCRIPTION_MAX_LENGTH, TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors'
import type { Tag, TagGroup } from '@/features/tags/types'
import type { useTranslations } from 'next-intl'

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

interface InlineCreateRowProps {
  columnWidths: ColumnWidths
  newTagName: string
  newTagDescription: string
  newTagColor: string
  selectedGroup: TagGroup | null
  tags: Tag[]
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onColorChange: (color: string) => void
  onSave: () => void
  onCancel: () => void
  t: ReturnType<typeof useTranslations>
}

export const InlineCreateRow = forwardRef<HTMLTableRowElement, InlineCreateRowProps>(function InlineCreateRow(
  {
    columnWidths,
    newTagName,
    newTagDescription,
    newTagColor,
    selectedGroup,
    tags: _tags,
    onNameChange,
    onDescriptionChange,
    onColorChange,
    onSave,
    onCancel,
    t,
  },
  ref
) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <TableRow ref={ref} className="bg-surface-container">
      <TableCell style={{ width: `${columnWidths.select}px` }}></TableCell>
      <TableCell className="text-muted-foreground font-mono text-sm" style={{ width: `${columnWidths.id}px` }}>
        -
      </TableCell>
      <TableCell style={{ width: `${columnWidths.color + columnWidths.name}px` }}>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                aria-label={t('tag.page.changeColor')}
              >
                <Hash className="h-4 w-4" style={{ color: newTagColor }} aria-label={t('tag.page.tagColor')} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <ColorPalettePicker selectedColor={newTagColor} onColorSelect={onColorChange} />
            </PopoverContent>
          </Popover>
          <Input
            value={newTagName}
            onChange={(e) => {
              const value = e.target.value
              if (value.length >= TAG_NAME_MAX_LENGTH) {
                toast.info(`タグ名は${TAG_NAME_MAX_LENGTH}文字までです`, { id: 'name-limit' })
              }
              onNameChange(value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('tag.page.name')}
            maxLength={TAG_NAME_MAX_LENGTH}
            autoFocus
            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
      </TableCell>
      <TableCell style={{ width: `${columnWidths.description}px` }}>
        <Input
          value={newTagDescription}
          onChange={(e) => {
            const value = e.target.value
            if (value.length >= TAG_DESCRIPTION_MAX_LENGTH) {
              toast.info(`説明は${TAG_DESCRIPTION_MAX_LENGTH}文字までです`, { id: 'description-limit' })
            }
            onDescriptionChange(value)
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('tag.page.description')}
          maxLength={TAG_DESCRIPTION_MAX_LENGTH}
          className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </TableCell>
      <TableCell style={{ width: `${columnWidths.group}px` }}>
        {selectedGroup ? (
          <div className="flex items-center gap-1">
            <Folder className="h-4 w-4 shrink-0" style={{ color: selectedGroup.color || DEFAULT_GROUP_COLOR }} />
            <span className="text-sm">{selectedGroup.name}</span>
          </div>
        ) : null}
      </TableCell>
      <TableCell
        className="text-muted-foreground text-xs"
        style={{ width: `${columnWidths.created_at}px` }}
      ></TableCell>
    </TableRow>
  )
})
