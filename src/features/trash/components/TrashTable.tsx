'use client'

import React, { useCallback, useMemo } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/features/i18n/lib/hooks'

import { useTrashStore } from '../stores/useTrashStore'
import { TrashItem } from '../types/trash'
import { trashOperations } from '../utils/trash-operations'

interface TrashTableProps {
  items: TrashItem[]
  className?: string
}

export function TrashTable({ items, className }: TrashTableProps) {
  const { t } = useI18n()
  const {
    selectedIds,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    sort,
    setSort,
    restoreItem,
    permanentlyDelete,
  } = useTrashStore()

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id))
  const isSomeSelected = items.some((item) => selectedIds.has(item.id))

  const handleHeaderCheckboxChange = useCallback(() => {
    if (isAllSelected) {
      deselectAll()
    } else {
      selectAll()
    }
  }, [isAllSelected, deselectAll, selectAll])

  const handleItemCheckboxChange = useCallback(
    (itemId: string) => {
      if (selectedIds.has(itemId)) {
        deselectItem(itemId)
      } else {
        selectItem(itemId)
      }
    },
    [selectedIds, deselectItem, selectItem]
  )

  const handleSort = useCallback(
    (newSortBy: typeof sort.by) => {
      const newOrder = sort.by === newSortBy && sort.order === 'asc' ? 'desc' : 'asc'
      setSort({ by: newSortBy, order: newOrder })
    },
    [sort, setSort]
  )

  const handleSortByDeletedAt = useCallback(() => handleSort('deletedAt'), [handleSort])
  const handleSortByTitle = useCallback(() => handleSort('title'), [handleSort])
  const handleSortByType = useCallback(() => handleSort('type'), [handleSort])

  const getSortIcon = (column: typeof sort.by) => {
    if (sort.by !== column) {
      return <span className="text-muted-foreground">↕</span>
    }
    return sort.order === 'asc' ? <span className="text-primary">↑</span> : <span className="text-primary">↓</span>
  }

  const groupedItems = useMemo(() => {
    if (items.length === 0) return {}

    // 削除日でグループ化
    const groups = trashOperations.groupByDeletedDate(items)

    // 日付でソート
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const sortedGroups: Record<string, TrashItem[]> = {}
    sortedDates.forEach((date) => {
      sortedGroups[date] = groups[date]!
    })

    return sortedGroups
  }, [items])

  if (items.length === 0) {
    return (
      <div className={`border-border bg-card rounded-xl border p-8 text-center ${className}`}>
        <div className="mb-4 text-6xl">🗑️</div>
        <h3 className="text-foreground mb-2 text-xl font-bold">ゴミ箱は空です</h3>
        <p className="text-muted-foreground">削除されたアイテムはここに表示されます</p>
      </div>
    )
  }

  return (
    <div className={`border-border bg-card overflow-hidden rounded-xl border ${className}`}>
      {/* テーブルヘッダー */}
      <div className="border-border bg-muted border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isSomeSelected && !isAllSelected
                }}
                onChange={handleHeaderCheckboxChange}
                className="border-input text-primary focus:ring-ring h-4 w-4 rounded-sm focus:ring-2"
              />
              <span className="text-foreground ml-2 text-sm font-medium">
                {isAllSelected ? t('trash.actions.deselectAll') : t('trash.actions.selectAll')}
              </span>
            </label>
            <span className="text-muted-foreground text-sm">{items.length}件のアイテム</span>
          </div>

          {/* ソートボタン */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">並び順:</span>
            <button
              type="button"
              onClick={handleSortByDeletedAt}
              className="text-muted-foreground hover:bg-foreground/8 flex items-center gap-1 rounded-sm px-2 py-1"
            >
              <span>削除日</span>
              {getSortIcon('deletedAt')}
            </button>
            <button
              type="button"
              onClick={handleSortByTitle}
              className="text-muted-foreground hover:bg-foreground/8 flex items-center gap-1 rounded-sm px-2 py-1"
            >
              <span>タイトル</span>
              {getSortIcon('title')}
            </button>
            <button
              type="button"
              onClick={handleSortByType}
              className="text-muted-foreground hover:bg-foreground/8 flex items-center gap-1 rounded-sm px-2 py-1"
            >
              <span>タイプ</span>
              {getSortIcon('type')}
            </button>
          </div>
        </div>
      </div>

      {/* アイテムリスト */}
      <ScrollArea className="max-h-96">
        {Object.entries(groupedItems).map(([dateString, dayItems]) => (
          <div key={dateString}>
            {/* 日付ヘッダー */}
            <div className="border-border bg-muted sticky top-0 border-b px-4 py-2">
              <h4 className="text-foreground text-sm font-medium">
                {formatDateHeader(new Date(dateString), t)} ({dayItems.length}件)
              </h4>
            </div>

            {/* その日のアイテム */}
            {dayItems.map((item) => (
              <MemoizedTrashItemRow
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={handleItemCheckboxChange}
                onRestore={restoreItem}
                onPermanentDelete={permanentlyDelete}
              />
            ))}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

interface TrashItemRowProps {
  item: TrashItem
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
}

function TrashItemRow({ item, isSelected, onToggleSelect, onRestore, onPermanentDelete }: TrashItemRowProps) {
  const { t } = useI18n()
  const handleToggleSelect = useCallback(() => onToggleSelect(item.id), [onToggleSelect, item.id])
  const handleRestore = useCallback(() => onRestore(item.id), [onRestore, item.id])
  const handlePermanentDelete = useCallback(() => onPermanentDelete(item.id), [onPermanentDelete, item.id])
  const typeConfig = trashOperations.getTypeConfig(item.type)
  const daysUntilDelete = trashOperations.getDaysUntilAutoDelete(item)
  const isExpiringSoon = trashOperations.isExpiringSoon(item)
  const isExpired = trashOperations.isExpired(item)

  return (
    <div
      className={`border-border hover:bg-foreground/8 flex items-center border-b px-4 py-3 transition-colors ${
        isSelected ? 'bg-foreground/12' : ''
      }`}
    >
      {/* 選択チェックボックス */}
      <div className="mr-3 flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggleSelect}
          className="border-input text-primary focus:ring-ring h-4 w-4 rounded-sm focus:ring-2"
        />
      </div>

      {/* アイテム情報 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-start space-x-3">
            {/* タイプアイコン */}
            <div className="flex-shrink-0 text-lg" title={typeConfig.label}>
              {typeConfig.icon}
            </div>

            {/* タイトル・説明 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-foreground truncate text-sm font-medium">
                  {trashOperations.truncateTitle(item.title)}
                </h4>
                <span className="bg-muted text-muted-foreground flex-shrink-0 rounded-sm px-2 py-1 text-sm">
                  {typeConfig.label}
                </span>
              </div>

              {item.description != null && (
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {trashOperations.truncateDescription(item.description)}
                </p>
              )}

              {/* メタデータ */}
              <div className="text-muted-foreground mt-2 flex items-center space-x-4 text-sm">
                <span>削除: {trashOperations.formatDeletedDate(item.deletedAt)}</span>

                {item.deletedFrom ? <span>元の場所: {trashOperations.formatDeletedFrom(item.deletedFrom)}</span> : null}

                {item.metadata?.fileSize ? (
                  <span>サイズ: {trashOperations.formatFileSize(item.metadata.fileSize)}</span>
                ) : null}

                {/* 自動削除警告 */}
                {isExpired || isExpiringSoon ? (
                  <span className={`font-medium ${isExpired ? 'text-destructive' : 'text-destructive/80'}`}>
                    {isExpired
                      ? t('trash.status.expired')
                      : t('trash.time.daysUntilDelete', { days: daysUntilDelete.toString() })}
                  </span>
                ) : null}
              </div>

              {/* タグ */}
              {item.metadata?.tags && item.metadata.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {trashOperations.formatTags(item.metadata.tags).visible.map((tag) => (
                    <span key={tag} className="bg-primary/10 text-primary inline-block rounded-sm px-2 py-1 text-sm">
                      #{tag}
                    </span>
                  ))}
                  {trashOperations.formatTags(item.metadata.tags).hidden > 0 && (
                    <span className="bg-muted text-muted-foreground inline-block rounded-sm px-2 py-1 text-sm">
                      +{trashOperations.formatTags(item.metadata.tags).hidden}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="ml-4 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRestore}
              className="text-primary hover:bg-foreground/8 rounded-sm px-3 py-1 text-sm transition-colors"
              title={t('trash.actions.restore')}
            >
              {t('trash.actions.restore')}
            </button>
            <button
              type="button"
              onClick={handlePermanentDelete}
              className="text-destructive hover:bg-foreground/8 rounded-sm px-3 py-1 text-sm transition-colors"
              title={t('trash.actions.permanentDelete')}
            >
              {t('trash.actions.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 日付ヘッダーをフォーマット
 */
function formatDateHeader(date: Date, t: ReturnType<typeof useI18n>['t']): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) {
    return t('time.today')
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return t('time.yesterday')
  } else {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }
}

// パフォーマンス最適化のためのメモ化
const MemoizedTrashItemRow = React.memo(TrashItemRow)
