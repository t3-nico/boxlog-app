import React, { useCallback, useMemo } from 'react'

import { useTrashStore } from '../stores/useTrashStore'
import { TrashItem } from '../types/trash'
import { trashOperations } from '../utils/trash-operations'

interface TrashTableProps {
  items: TrashItem[]
  className?: string
}

export const TrashTable: React.FC<TrashTableProps> = ({ items, className }) => {
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
      return <span className="text-neutral-600 dark:text-neutral-400">↕</span>
    }
    return sort.order === 'asc' ? (
      <span className="text-blue-600 dark:text-blue-400">↑</span>
    ) : (
      <span className="text-blue-600 dark:text-blue-400">↓</span>
    )
  }

  const groupedItems = useMemo(() => {
    if (items.length === 0) return {}

    // 削除日でグループ化
    const groups = trashOperations.groupByDeletedDate(items)

    // 日付でソート
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const sortedGroups: Record<string, TrashItem[]> = {}
    sortedDates.forEach((date) => {
      sortedGroups[date] = groups[date]
    })

    return sortedGroups
  }, [items])

  if (items.length === 0) {
    return (
      <div
        className={`rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-800 ${className}`}
      >
        <div className="mb-4 text-6xl">🗑️</div>
        <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">ゴミ箱は空です</h3>
        <p className="text-neutral-600 dark:text-neutral-400">削除されたアイテムはここに表示されます</p>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-800 ${className}`}
    >
      {/* テーブルヘッダー */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-700">
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
                className="h-4 w-4 rounded-sm border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700"
              />
              <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {isAllSelected ? 'すべて選択解除' : 'すべて選択'}
              </span>
            </label>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{items.length}件のアイテム</span>
          </div>

          {/* ソートボタン */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">並び順:</span>
            <button
              type="button"
              onClick={handleSortByDeletedAt}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-600"
            >
              <span>削除日</span>
              {getSortIcon('deletedAt')}
            </button>
            <button
              type="button"
              onClick={handleSortByTitle}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-600"
            >
              <span>タイトル</span>
              {getSortIcon('title')}
            </button>
            <button
              type="button"
              onClick={handleSortByType}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-600"
            >
              <span>タイプ</span>
              {getSortIcon('type')}
            </button>
          </div>
        </div>
      </div>

      {/* アイテムリスト */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(groupedItems).map(([dateString, dayItems]) => (
          <div key={dateString}>
            {/* 日付ヘッダー */}
            <div className="sticky top-0 border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-700">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {formatDateHeader(new Date(dateString))} ({dayItems.length}件)
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
      </div>
    </div>
  )
}

interface TrashItemRowProps {
  item: TrashItem
  isSelected: boolean
  onToggleSelect: () => void
  onRestore: () => void
  onPermanentDelete: () => void
}

const TrashItemRow: React.FC<TrashItemRowProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onRestore,
  onPermanentDelete,
}) => {
  const handleToggleSelect = useCallback(() => onToggleSelect(item.id), [onToggleSelect, item.id])
  const handleRestore = useCallback(() => onRestore(item.id), [onRestore, item.id])
  const handlePermanentDelete = useCallback(() => onPermanentDelete(item.id), [onPermanentDelete, item.id])
  const typeConfig = trashOperations.getTypeConfig(item.type)
  const daysUntilDelete = trashOperations.getDaysUntilAutoDelete(item)
  const isExpiringSoon = trashOperations.isExpiringSoon(item)
  const isExpired = trashOperations.isExpired(item)

  return (
    <div
      className={`flex items-center border-b border-neutral-200 px-4 py-3 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {/* 選択チェックボックス */}
      <div className="mr-3 flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggleSelect}
          className="h-4 w-4 rounded-sm border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700"
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
                <h4 className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {trashOperations.truncateTitle(item.title)}
                </h4>
                <span className="flex-shrink-0 rounded-sm bg-neutral-50 px-2 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                  {typeConfig.label}
                </span>
              </div>

              {item.description != null && (
                <p className="mt-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
                  {trashOperations.truncateDescription(item.description)}
                </p>
              )}

              {/* メタデータ */}
              <div className="mt-2 flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span>削除: {trashOperations.formatDeletedDate(item.deletedAt)}</span>

                {item.deletedFrom ? <span>元の場所: {trashOperations.formatDeletedFrom(item.deletedFrom)}</span> : null}

                {item.metadata?.fileSize ? (
                  <span>サイズ: {trashOperations.formatFileSize(item.metadata.fileSize)}</span>
                ) : null}

                {/* 自動削除警告 */}
                {isExpired || isExpiringSoon ? (
                  <span
                    className={`font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                  >
                    {isExpired ? '期限切れ' : `${daysUntilDelete}日後に自動削除`}
                  </span>
                ) : null}
              </div>

              {/* タグ */}
              {item.metadata?.tags && item.metadata.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {trashOperations.formatTags(item.metadata.tags).visible.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-sm bg-blue-50 px-2 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      #{tag}
                    </span>
                  ))}
                  {trashOperations.formatTags(item.metadata.tags).hidden > 0 && (
                    <span
                      className="inline-block rounded-sm bg-neutral-50 px-2 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                    >
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
              className="rounded-sm px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
              title="復元"
            >
              復元
            </button>
            <button
              type="button"
              onClick={handlePermanentDelete}
              className="rounded-sm px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
              title="完全削除"
            >
              削除
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
function formatDateHeader(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) {
    return '今日'
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return '昨日'
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
