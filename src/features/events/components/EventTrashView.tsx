import React, { useMemo, useState } from 'react'

import { useEventTrash } from '../hooks/useEventTrash'

interface EventTrashViewProps {
  className?: string
}

export const EventTrashView: React.FC<EventTrashViewProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDays, setFilterDays] = useState<number | null>(null)

  const {
    trashedEvents,
    stats,
    selectedEventIds,
    isLoading,
    isEmpty,
    hasSelection,
    hasOldEvents,
    selectedCount,
    isAllSelected,

    // 操作
    handleSelectEvent,
    handleSelectAll,
    clearSelection,
    handleRestoreEvent,
    handlePermanentDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleClearTrash,

    // ユーティリティ
    searchEvents,
    filterByDeletionDate,
    getDaysUntilAutoDelete,
    formatDeletedDate,
  } = useEventTrash()

  const filteredEvents = useMemo(() => {
    let events = trashedEvents

    // 検索フィルタリング
    if (searchQuery.trim()) {
      events = searchEvents(searchQuery)
    }

    // 日付フィルタリング
    if (filterDays !== null) {
      events = filterByDeletionDate(filterDays)
    }

    return events
  }, [trashedEvents, searchQuery, filterDays, searchEvents, filterByDeletionDate])

  if (isEmpty) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="text-6xl">🗑️</div>
          <h3 className="text-xl font-semibold">ゴミ箱は空です</h3>
          <p className="text-gray-600 dark:text-gray-400">削除されたイベントはありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} flex flex-col space-y-6 p-8`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ゴミ箱</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            削除済み: {stats.totalDeleted}件
            {hasOldEvents === true && (
              <span className="text-orange-600 dark:text-orange-400"> (30日以上経過: {stats.oldDeleted}件)</span>
            )}
          </p>
        </div>

        {hasOldEvents === true && (
          <button
            type="button"
            onClick={handleClearTrash}
            disabled={isLoading}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
          >
            古い削除済みを自動削除
          </button>
        )}
      </div>

      {/* 検索・フィルター */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="イベントを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          />

          <select
            value={filterDays || ''}
            onChange={(e) => setFilterDays(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">全期間</option>
            <option value="1">今日</option>
            <option value="7">1週間以内</option>
            <option value="30">1ヶ月以内</option>
          </select>
        </div>

        {/* バッチ操作 */}
        {filteredEvents.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <label className="flex cursor-pointer items-center space-x-2">
                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-4 w-4" />
                <span className="text-sm">{selectedCount > 0 ? `${selectedCount}件選択中` : '全て選択'}</span>
              </label>

              {hasSelection === true && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({selectedCount}件/{filteredEvents.length}件)
                </span>
              )}
            </div>

            {hasSelection === true && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleBatchRestore}
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  一括復元
                </button>
                <button
                  type="button"
                  onClick={handleBatchPermanentDelete}
                  disabled={isLoading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  完全削除
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  選択解除
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* イベント一覧 */}
      <div className="flex flex-col space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-center">
            <div className="flex flex-col space-y-4">
              <div className="text-4xl">🔍</div>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery.trim() || filterDays !== null
                  ? '条件に一致するイベントがありません'
                  : 'イベントがありません'}
              </p>
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isSelected = selectedEventIds.includes(event.id)
            const daysUntilDelete = getDaysUntilAutoDelete(event)
            const deletedDateStr = event.deletedAt ? formatDeletedDate(event.deletedAt) : ''

            return (
              <div
                key={event.id}
                className={`dark:hover:bg-gray-750 flex flex-col space-y-2 rounded-xl border-2 bg-white p-4 transition-colors hover:bg-gray-50 dark:bg-gray-800 ${isSelected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
              >
                {/* イベント基本情報 */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-center space-x-3">
                    <label htmlFor={`select-event-${event.id}`} className="cursor-pointer">
                      <span className="sr-only">Select event: {event.title}</span>
                      <input
                        id={`select-event-${event.id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectEvent(event.id)}
                        className="h-4 w-4"
                      />
                    </label>

                    <div className="flex flex-1 flex-col">
                      <h3 className="truncate text-lg font-medium">{event.title}</h3>
                      {event.description != null && (
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreEvent(event.id)}
                      disabled={isLoading}
                      className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      復元
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(event.id)}
                      disabled={isLoading}
                      className="whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      完全削除
                    </button>
                  </div>
                </div>

                {/* メタデータ */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>削除日: {deletedDateStr}</span>
                    {event.startDate && <span>元の日時: {event.startDate.toLocaleDateString()}</span>}
                    {event.type != null && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">{event.type}</span>
                    )}
                  </div>

                  {daysUntilDelete !== null && daysUntilDelete <= 7 && (
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {daysUntilDelete === 0 ? '今日自動削除' : `${daysUntilDelete}日後に自動削除`}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ローディング状態 */}
      {isLoading === true && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center space-y-4 rounded-xl border border-gray-300 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <p>処理中...</p>
          </div>
        </div>
      )}
    </div>
  )
}
