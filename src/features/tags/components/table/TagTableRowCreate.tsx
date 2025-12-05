'use client'

import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell, TableRow } from '@/components/ui/table'
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useCreateTag } from '@/features/tags/hooks/use-tags'
import { useTagColumnStore } from '@/features/tags/stores/useTagColumnStore'
import type { TagGroup, TagWithChildren } from '@/types/tags'
import { Folder, Hash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { toast } from 'sonner'

export interface TagTableRowCreateHandle {
  /** 作成モードを開始 */
  startCreate: () => void
  /** 作成モードをキャンセル */
  cancelCreate: () => void
  /** 作成中かどうか */
  isCreating: boolean
}

interface TagTableRowCreateProps {
  /** 現在選択中のグループID */
  selectedGroupId: string | null
  /** グループ一覧 */
  groups: TagGroup[]
  /** 全タグ一覧（グループ内タグ数計算用） */
  allTags: TagWithChildren[]
  /** 作成完了時のコールバック */
  onCreated?: () => void
}

/**
 * タグインライン作成行コンポーネント
 *
 * テーブル最下部に表示される新規タグ作成フォーム
 * - refを使用して外部から作成開始/キャンセルを制御可能
 * - Enterで保存、Escapeでキャンセル
 * - 外側クリックでキャンセル
 */
export const TagTableRowCreate = forwardRef<TagTableRowCreateHandle, TagTableRowCreateProps>(
  ({ selectedGroupId, groups, allTags, onCreated }, ref) => {
    const t = useTranslations()
    const { getVisibleColumns, getColumnWidth } = useTagColumnStore()
    const createTagMutation = useCreateTag()

    const [isCreating, setIsCreating] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [newTagDescription, setNewTagDescription] = useState('')
    const [newTagColor, setNewTagColor] = useState<string>(DEFAULT_TAG_COLOR)
    const rowRef = useRef<HTMLTableRowElement>(null)

    const visibleColumns = getVisibleColumns()

    // 外部からの制御用ハンドル
    useImperativeHandle(ref, () => ({
      startCreate: () => {
        setIsCreating(true)
        setNewTagName('')
        setNewTagDescription('')
        setNewTagColor(DEFAULT_TAG_COLOR)
      },
      cancelCreate: () => {
        setIsCreating(false)
        setNewTagName('')
        setNewTagDescription('')
        setNewTagColor(DEFAULT_TAG_COLOR)
      },
      isCreating,
    }))

    // 保存処理
    const handleSave = useCallback(async () => {
      if (newTagName.trim() === '') {
        setIsCreating(false)
        return
      }

      try {
        await createTagMutation.mutateAsync({
          name: newTagName.trim(),
          description: newTagDescription.trim() || null,
          color: newTagColor,
          group_id: selectedGroupId,
          level: 0 as const,
        })
        toast.success(t('tags.page.tagCreated', { name: newTagName }))
        setIsCreating(false)
        setNewTagName('')
        setNewTagDescription('')
        setNewTagColor(DEFAULT_TAG_COLOR)
        onCreated?.()
      } catch (error) {
        console.error('Failed to create tag:', error)
        toast.error(t('tags.page.tagCreateFailed'))
      }
    }, [newTagName, newTagDescription, newTagColor, selectedGroupId, createTagMutation, t, onCreated])

    // キャンセル処理
    const handleCancel = useCallback(() => {
      setIsCreating(false)
      setNewTagName('')
      setNewTagDescription('')
      setNewTagColor(DEFAULT_TAG_COLOR)
    }, [])

    // 外側クリック検出
    useEffect(() => {
      if (!isCreating) return

      const handleClickOutside = (event: MouseEvent) => {
        if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
          handleCancel()
        }
      }

      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isCreating, handleCancel])

    // グループ情報
    const selectedGroup = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null
    const groupTagCount = selectedGroup
      ? allTags.filter((t) => t.group_id === selectedGroup.id && t.is_active && t.level === 0).length
      : 0

    if (!isCreating) return null

    // 列を順番にレンダリング
    const renderCell = (columnId: string) => {
      const width = getColumnWidth(columnId as Parameters<typeof getColumnWidth>[0])
      const style = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }

      switch (columnId) {
        case 'selection':
          return <TableCell key={columnId} style={style}></TableCell>

        case 'id':
          return (
            <TableCell key={columnId} className="text-muted-foreground font-mono text-sm" style={style}>
              -
            </TableCell>
          )

        case 'name': {
          const nameWidth = getColumnWidth('name')
          const nameStyle = { width: `${nameWidth}px`, minWidth: `${nameWidth}px`, maxWidth: `${nameWidth}px` }

          return (
            <TableCell key={columnId} style={nameStyle}>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={t('tags.page.changeColor')}
                    >
                      <Hash className="h-4 w-4" style={{ color: newTagColor }} aria-label={t('tags.page.tagColor')} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <ColorPalettePicker selectedColor={newTagColor} onColorSelect={setNewTagColor} />
                  </PopoverContent>
                </Popover>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave()
                    } else if (e.key === 'Escape') {
                      handleCancel()
                    }
                  }}
                  placeholder={t('tags.page.name')}
                  autoFocus
                  className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
              </div>
            </TableCell>
          )
        }

        case 'description':
          return (
            <TableCell key={columnId} style={style}>
              <Input
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave()
                  } else if (e.key === 'Escape') {
                    handleCancel()
                  }
                }}
                placeholder={t('tags.page.description')}
                className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            </TableCell>
          )

        case 'group':
          return (
            <TableCell key={columnId} style={style}>
              {selectedGroup ? (
                <div className="flex items-center gap-1">
                  <Folder className="h-4 w-4 shrink-0" style={{ color: selectedGroup.color || DEFAULT_GROUP_COLOR }} />
                  <span className="text-sm">
                    {selectedGroup.name} <span className="text-muted-foreground">({groupTagCount})</span>
                  </span>
                </div>
              ) : null}
            </TableCell>
          )

        case 'created_at':
        case 'last_used':
          return <TableCell key={columnId} className="text-muted-foreground text-xs" style={style}></TableCell>

        default:
          return null
      }
    }

    return (
      <TableRow ref={rowRef} className="bg-surface-container/30">
        {visibleColumns.map((column) => renderCell(column.id))}
      </TableRow>
    )
  }
)

TagTableRowCreate.displayName = 'TagTableRowCreate'
