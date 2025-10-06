'use client'

import React, { useCallback, useMemo, useState } from 'react'

import { useI18n } from '@/lib/i18n/hooks'

import { useEventTrash } from '../hooks/useEventTrash'

interface EventTrashViewProps {
  className?: string
}

export const EventTrashView: React.FC<EventTrashViewProps> = ({ className }) => {
  const { t } = useI18n()
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

  // jsx-no-bind optimization: Search input handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  // jsx-no-bind optimization: Filter select handler
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDays(e.target.value ? Number(e.target.value) : null)
  }, [])

  // jsx-no-bind optimization: Event selection handler creator
  const createSelectEventHandler = useCallback(
    (eventId: string) => {
      return () => handleSelectEvent(eventId)
    },
    [handleSelectEvent]
  )

  // jsx-no-bind optimization: Event restore handler creator
  const createRestoreEventHandler = useCallback(
    (eventId: string) => {
      return () => handleRestoreEvent(eventId)
    },
    [handleRestoreEvent]
  )

  // jsx-no-bind optimization: Event permanent delete handler creator
  const createPermanentDeleteHandler = useCallback(
    (eventId: string) => {
      return () => handlePermanentDelete(eventId)
    },
    [handlePermanentDelete]
  )

  if (isEmpty) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="text-6xl">🗑️</div>
          <h3 className="text-xl font-semibold">{t('events.trash.empty.title')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('events.trash.empty.description')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} flex flex-col space-y-6 p-8`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('events.trash.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('events.trash.stats.deleted', { count: stats.totalDeleted })}
            {hasOldEvents === true && (
              <span className="text-orange-600 dark:text-orange-400"> ({t('events.trash.stats.old', { count: stats.oldDeleted })})</span>
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
            {t('events.trash.actions.clearOld')}
          </button>
        )}
      </div>

      {/* 検索・フィルター */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder={t('events.trash.search.placeholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="min-w-64 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          />

          <select
            value={filterDays || ''}
            onChange={handleFilterChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">{t('events.trash.filter.all')}</option>
            <option value="1">{t('events.trash.filter.today')}</option>
            <option value="7">{t('events.trash.filter.week')}</option>
            <option value="30">{t('events.trash.filter.month')}</option>
          </select>
        </div>

        {/* バッチ操作 */}
        {filteredEvents.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <label className="flex cursor-pointer items-center space-x-2">
                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-4 w-4" />
                <span className="text-sm">{selectedCount > 0 ? t('events.trash.actions.selected', { count: selectedCount }) : t('events.trash.actions.selectAll')}</span>
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
                  {t('events.trash.actions.batchRestore')}
                </button>
                <button
                  type="button"
                  onClick={handleBatchPermanentDelete}
                  disabled={isLoading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {t('events.trash.actions.permanentDelete')}
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {t('events.trash.actions.clearSelection')}
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
                  ? t('events.trash.search.noResults')
                  : t('events.trash.search.noEvents')}
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
                        onChange={createSelectEventHandler(event.id)}
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
                      onClick={createRestoreEventHandler(event.id)}
                      disabled={isLoading}
                      className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t('events.trash.actions.restore')}
                    </button>
                    <button
                      type="button"
                      onClick={createPermanentDeleteHandler(event.id)}
                      disabled={isLoading}
                      className="whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {t('events.trash.actions.permanentDelete')}
                    </button>
                  </div>
                </div>

                {/* メタデータ */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('events.trash.metadata.deletedDate', { date: deletedDateStr })}</span>
                    {event.startDate ? <span>{t('events.trash.metadata.originalDate', { date: event.startDate.toLocaleDateString() })}</span> : null}
                    {event.type != null && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">{event.type}</span>
                    )}
                  </div>

                  {daysUntilDelete !== null && daysUntilDelete <= 7 && (
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {daysUntilDelete === 0 ? t('events.trash.metadata.autoDeleteToday') : t('events.trash.metadata.autoDeleteIn', { days: daysUntilDelete })}
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
            <p>{t('events.trash.loading.title')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
