import React, { useMemo } from 'react'

import { colors, icons, rounded, spacing, typography } from '@/config/theme'

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

  const handleHeaderCheckboxChange = () => {
    if (isAllSelected) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  const handleItemCheckboxChange = (itemId: string) => {
    if (selectedIds.has(itemId)) {
      deselectItem(itemId)
    } else {
      selectItem(itemId)
    }
  }

  const handleSort = (newSortBy: typeof sort.by) => {
    const newOrder = sort.by === newSortBy && sort.order === 'asc' ? 'desc' : 'asc'
    setSort({ by: newSortBy, order: newOrder })
  }

  const getSortIcon = (column: typeof sort.by) => {
    if (sort.by !== column) {
      return <span className={colors.text.muted}>↕</span>
    }
    return sort.order === 'asc' ? (
      <span className={colors.primary.text}>↑</span>
    ) : (
      <span className={colors.primary.text}>↓</span>
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
        className={`${colors.background.surface} border border-neutral-200 dark:border-neutral-800 ${rounded.lg} p-8 text-center ${className}`}
      >
        <div className="mb-4 text-6xl">🗑️</div>
        <h3 className="${typography.heading.h4} ${colors.text.primary} ${spacing.stack.xs}">ゴミ箱は空です</h3>
        <p className={colors.text.muted}>削除されたアイテムはここに表示されます</p>
      </div>
    )
  }

  return (
    <div
      className={`${colors.background.surface} border border-neutral-200 dark:border-neutral-800 ${rounded.lg} overflow-hidden ${className}`}
    >
      {/* テーブルヘッダー */}
      <div className="${colors.background.elevated} ${colors.border.alpha} border-b px-4 py-3">
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
                className={`${icons.size.sm} ${colors.primary.text} ${colors.background.elevated} border border-neutral-200 dark:border-neutral-800 ${rounded.sm} ${colors.state.focus.ring}`}
              />
              <span className={`ml-2 ${typography.body.small} font-medium ${colors.text.secondary}`}>
                {isAllSelected ? 'すべて選択解除' : 'すべて選択'}
              </span>
            </label>
            <span className={`${typography.body.small} ${colors.text.muted}`}>{items.length}件のアイテム</span>
          </div>

          {/* ソートボタン */}
          <div className="flex items-center space-x-2 text-sm">
            <span className={colors.text.muted}>並び順:</span>
            <button
              type="button"
              onClick={() => handleSort('deletedAt')}
              className={`flex items-center ${spacing.inlineGap.xs} px-2 py-1 ${colors.text.muted} ${colors.ghost.hover} ${rounded.sm}`}
            >
              <span>削除日</span>
              {getSortIcon('deletedAt')}
            </button>
            <button
              type="button"
              onClick={() => handleSort('title')}
              className={`flex items-center ${spacing.inlineGap.xs} px-2 py-1 ${colors.text.muted} ${colors.ghost.hover} ${rounded.sm}`}
            >
              <span>タイトル</span>
              {getSortIcon('title')}
            </button>
            <button
              type="button"
              onClick={() => handleSort('type')}
              className={`flex items-center ${spacing.inlineGap.xs} px-2 py-1 ${colors.text.muted} ${colors.ghost.hover} ${rounded.sm}`}
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
            <div className="${colors.background.elevated} ${colors.border.alpha} sticky top-0 border-b px-4 py-2">
              <h4 className="${typography.body.small} ${colors.text.secondary} font-medium">
                {formatDateHeader(new Date(dateString))} ({dayItems.length}件)
              </h4>
            </div>

            {/* その日のアイテム */}
            {dayItems.map((item) => (
              <TrashItemRow
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={() => handleItemCheckboxChange(item.id)}
                onRestore={() => restoreItem(item.id)}
                onPermanentDelete={() => permanentlyDelete(item.id)}
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
  const typeConfig = trashOperations.getTypeConfig(item.type)
  const daysUntilDelete = trashOperations.getDaysUntilAutoDelete(item)
  const isExpiringSoon = trashOperations.isExpiringSoon(item)
  const isExpired = trashOperations.isExpired(item)

  return (
    <div
      className={`flex items-center border-b px-4 py-3 ${colors.border.alpha} ${colors.ghost.hover} transition-colors ${
        isSelected ? colors.selection.DEFAULT : ''
      }`}
    >
      {/* 選択チェックボックス */}
      <div className="mr-3 flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className={`${icons.size.sm} ${colors.primary.text} ${colors.background.elevated} border border-neutral-200 dark:border-neutral-800 ${rounded.sm} ${colors.state.focus.ring}`}
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
                <h4 className="${typography.body.small} ${colors.text.primary} truncate font-medium">
                  {trashOperations.truncateTitle(item.title)}
                </h4>
                <span className="${typography.body.small} ${colors.background.elevated} ${colors.text.muted} ${rounded.sm} flex-shrink-0 px-2 py-1">
                  {typeConfig.label}
                </span>
              </div>

              {item.description != null && (
                <p className="${typography.body.small} ${colors.text.muted} mt-1 truncate">
                  {trashOperations.truncateDescription(item.description)}
                </p>
              )}

              {/* メタデータ */}
              <div className="${typography.body.small} ${colors.text.muted} mt-2 flex items-center space-x-4">
                <span>削除: {trashOperations.formatDeletedDate(item.deletedAt)}</span>

                {item.deletedFrom && <span>元の場所: {trashOperations.formatDeletedFrom(item.deletedFrom)}</span>}

                {item.metadata?.fileSize && (
                  <span>サイズ: {trashOperations.formatFileSize(item.metadata.fileSize)}</span>
                )}

                {/* 自動削除警告 */}
                {(isExpired || isExpiringSoon) && (
                  <span
                    className={`font-medium ${isExpired ? colors.semantic.error.text : colors.semantic.warning.text}`}
                  >
                    {isExpired ? '期限切れ' : `${daysUntilDelete}日後に自動削除`}
                  </span>
                )}
              </div>

              {/* タグ */}
              {item.metadata?.tags && item.metadata.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {trashOperations.formatTags(item.metadata.tags).visible.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-block px-2 py-1 ${typography.body.small} ${colors.semantic.info.light} ${colors.semantic.info.text} ${rounded.sm}`}
                    >
                      #{tag}
                    </span>
                  ))}
                  {trashOperations.formatTags(item.metadata.tags).hidden > 0 && (
                    <span
                      className={`inline-block px-2 py-1 ${typography.body.small} ${colors.background.elevated} ${colors.text.muted} ${rounded.sm}`}
                    >
                      +{trashOperations.formatTags(item.metadata.tags).hidden}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="ml-4 flex items-center space-x-2">
            <button
              type="button"
              onClick={onRestore}
              className={`px-3 py-1 ${typography.body.small} ${colors.semantic.info.text} hover:${colors.semantic.info.light} ${rounded.sm} transition-colors`}
              title="復元"
            >
              復元
            </button>
            <button
              type="button"
              onClick={onPermanentDelete}
              className={`px-3 py-1 ${typography.body.small} ${colors.semantic.error.text} hover:${colors.semantic.error.light} ${rounded.sm} transition-colors`}
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
