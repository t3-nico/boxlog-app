'use client'

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
import { TableCell } from '@/components/ui/table'
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useI18n } from '@/features/i18n/lib/hooks'
import { DraggableTagRow } from '@/features/tags/components/DraggableTagRow'
import { TagActionMenuItems } from '@/features/tags/components/TagActionMenuItems'
import { useUpdateTag } from '@/features/tags/hooks/use-tags'
import { useTagColumnStore } from '@/features/tags/stores/useTagColumnStore'
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore'
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore'
import { cn } from '@/lib/utils'
import type { TagGroup, TagWithChildren } from '@/types/tags'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Folder, Hash } from 'lucide-react'
import { useCallback, useState } from 'react'

interface TagTableRowProps {
  /** 表示するタグ */
  tag: TagWithChildren
  /** グループ一覧 */
  groups: TagGroup[]
  /** 全タグ一覧（グループ内タグ数計算用） */
  allTags: TagWithChildren[]
  /** プラン数のマップ（タグID -> プラン数） */
  planCounts: Record<string, number>
  /** 最終使用日時のマップ（タグID -> 日時文字列） */
  lastUsed: Record<string, string>
  /** グループ移動時のコールバック */
  onMoveToGroup: (tag: TagWithChildren, groupId: string | null) => void
  /** アーカイブ確認ダイアログを開く */
  onArchiveConfirm: (tag: TagWithChildren) => void
  /** 削除確認ダイアログを開く */
  onDeleteConfirm: (tag: TagWithChildren) => void
}

/**
 * タグテーブル行コンポーネント
 *
 * 1行分のタグ情報を表示
 * - ドラッグ可能（グループへの移動用）
 * - コンテキストメニュー対応
 * - インライン編集対応
 * - カラーピッカー対応
 */
export function TagTableRow({
  tag,
  groups,
  allTags,
  planCounts,
  lastUsed,
  onMoveToGroup,
  onArchiveConfirm,
  onDeleteConfirm,
}: TagTableRowProps) {
  const { t } = useI18n()
  const { openInspector } = useTagInspectorStore()
  const { isSelected, toggleSelection, setSelectedIds } = useTagSelectionStore()
  const { getVisibleColumns, getColumnWidth } = useTagColumnStore()
  const updateTagMutation = useUpdateTag()

  // インライン編集の状態
  const [editingField, setEditingField] = useState<'name' | null>(null)
  const [editValue, setEditValue] = useState('')

  const selected = isSelected(tag.id)
  const visibleColumns = getVisibleColumns()

  // 日時フォーマット関数
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, 'yyyy/MM/dd HH:mm', { locale: ja })
  }

  // インライン編集開始
  const handleStartEdit = useCallback(() => {
    setEditingField('name')
    setEditValue(tag.name)
  }, [tag.name])

  // インライン編集キャンセル
  const cancelEditing = useCallback(() => {
    setEditingField(null)
    setEditValue('')
  }, [])

  // インライン編集保存
  const saveInlineEdit = useCallback(async () => {
    if (!editingField || editValue.trim() === '') {
      cancelEditing()
      return
    }

    try {
      await updateTagMutation.mutateAsync({
        id: tag.id,
        data: { [editingField]: editValue.trim() },
      })
      cancelEditing()
    } catch (error) {
      console.error('Failed to update tag:', error)
    }
  }, [editingField, editValue, updateTagMutation, tag.id, cancelEditing])

  // グループ情報を取得
  const group = tag.group_id ? groups.find((g) => g.id === tag.group_id) : null
  const groupTagCount = group
    ? allTags.filter((t) => t.group_id === group.id && t.is_active && t.level === 0).length
    : 0

  // 列を順番にレンダリング
  const renderCell = (columnId: string) => {
    const width = getColumnWidth(columnId as Parameters<typeof getColumnWidth>[0])
    const style = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }

    switch (columnId) {
      case 'selection':
        return (
          <TableCell key={columnId} style={style} onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selected}
              onCheckedChange={() => toggleSelection(tag.id)}
              aria-label={t('tags.page.selectTag', { name: tag.name })}
            />
          </TableCell>
        )

      case 'id':
        return (
          <TableCell key={columnId} className="text-muted-foreground font-mono text-sm" style={style}>
            t-{tag.tag_number}
          </TableCell>
        )

      case 'name': {
        // name列はcolor分も含めた幅
        const nameWidth = getColumnWidth('name')
        const nameStyle = { width: `${nameWidth}px`, minWidth: `${nameWidth}px`, maxWidth: `${nameWidth}px` }

        return (
          <TableCell key={columnId} className="font-medium" style={nameStyle}>
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
                    onColorSelect={(color) => {
                      updateTagMutation.mutate({
                        id: tag.id,
                        data: { color },
                      })
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
                    if (e.key === 'Enter') {
                      saveInlineEdit()
                    } else if (e.key === 'Escape') {
                      cancelEditing()
                    }
                  }}
                  autoFocus
                  className="h-7 px-2"
                />
              ) : (
                <span className="cursor-pointer hover:underline" onClick={() => openInspector(tag.id)}>
                  {tag.name} <span className="text-muted-foreground">({planCounts[tag.id] || 0})</span>
                </span>
              )}
            </div>
          </TableCell>
        )
      }

      case 'description':
        return (
          <TableCell key={columnId} className="text-muted-foreground" style={style}>
            <span className="truncate">
              {tag.description || (
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  {t('tags.page.addDescription')}
                </span>
              )}
            </span>
          </TableCell>
        )

      case 'group':
        return (
          <TableCell key={columnId} style={style}>
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
        )

      case 'created_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-xs" style={style}>
            {formatDate(tag.created_at)}
          </TableCell>
        )

      case 'last_used':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-xs" style={style}>
            {lastUsed[tag.id] ? formatDate(lastUsed[tag.id]) : '-'}
          </TableCell>
        )

      default:
        return null
    }
  }

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <DraggableTagRow
          id={tag.id}
          className={cn('group', selected && 'bg-primary/10 hover:bg-primary/15')}
          onContextMenu={() => {
            // 右クリックされた行を選択
            if (!selected) {
              setSelectedIds([tag.id])
            }
          }}
        >
          {visibleColumns.map((column) => renderCell(column.id))}
        </DraggableTagRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <TagActionMenuItems
          tag={tag}
          groups={groups}
          onView={() => openInspector(tag.id)}
          onEdit={handleStartEdit}
          onMoveToGroup={onMoveToGroup}
          onArchive={onArchiveConfirm}
          onDelete={onDeleteConfirm}
          t={t}
          renderMenuItem={({ icon, label, onClick, variant }) => (
            <ContextMenuItem
              onClick={onClick}
              className={variant === 'destructive' ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground' : ''}
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
