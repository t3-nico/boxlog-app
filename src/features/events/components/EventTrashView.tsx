import React, { useState, useMemo } from 'react'

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
    formatDeletedDate
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
          <p className="text-gray-600 dark:text-gray-400">
            削除されたイベントはありません
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} p-8 flex flex-col space-y-6`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ゴミ箱</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            削除済み: {stats.totalDeleted}件 
            {hasOldEvents && <span className="text-orange-600 dark:text-orange-400"> (30日以上経過: {stats.oldDeleted}件)</span>}
          </p>
        </div>
        
        {hasOldEvents && (
          <button
            onClick={handleClearTrash}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
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
            className="flex-1 min-w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg"
          />
          
          <select
            value={filterDays || ''}
            onChange={(e) => setFilterDays(e.target.value ? Number(e.target.value) : null)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg"
          >
            <option value="">全期間</option>
            <option value="1">今日</option>
            <option value="7">1週間以内</option>
            <option value="30">1ヶ月以内</option>
          </select>
        </div>
        
        {/* バッチ操作 */}
        {filteredEvents.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {selectedCount > 0 ? `${selectedCount}件選択中` : '全て選択'}
                </span>
              </label>
              
              {hasSelection && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({selectedCount}件/{filteredEvents.length}件)
                </span>
              )}
            </div>
            
            {hasSelection && (
              <div className="flex space-x-2">
                <button
                  onClick={handleBatchRestore}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                >
                  一括復元
                </button>
                <button
                  onClick={handleBatchPermanentDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                >
                  完全削除
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm"
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
                  : 'イベントがありません'
                }
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
                className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-4 flex flex-col space-y-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${isSelected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
              >
                {/* イベント基本情報 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectEvent(event.id)}
                        className="w-4 h-4"
                      />
                    </label>
                    
                    <div className="flex flex-col flex-1">
                      <h3 className="text-lg font-medium truncate">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRestoreEvent(event.id)}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap disabled:opacity-50"
                    >
                      復元
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(event.id)}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap disabled:opacity-50"
                    >
                      完全削除
                    </button>
                  </div>
                </div>

                {/* メタデータ */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>削除日: {deletedDateStr}</span>
                    {event.startDate && (
                      <span>元の日時: {event.startDate.toLocaleDateString()}</span>
                    )}
                    {event.type && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {event.type}
                      </span>
                    )}
                  </div>
                  
                  {daysUntilDelete !== null && daysUntilDelete <= 7 && (
                    <span className="text-orange-600 dark:text-orange-400 text-sm">
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
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col space-y-4 items-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p>処理中...</p>
          </div>
        </div>
      )}
    </div>
  )
}