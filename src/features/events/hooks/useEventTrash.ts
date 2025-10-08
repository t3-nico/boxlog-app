// @ts-nocheck
// TODO(#389): useEventTrash型エラーを修正後、@ts-nocheckを削除
import { useCallback, useMemo, useState } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { useAddPopup } from '@/hooks/useAddPopup'

import { useEventStore } from '../stores/useEventStore'
import { Event } from '../types/events'
import { eventDeletionUtils } from '../utils/eventDeletion'

export interface UseEventTrashOptions {
  autoRefresh?: boolean
  sortByDeletedDate?: boolean
}

export const useEventTrash = (options: UseEventTrashOptions = {}) => {
  const { autoRefresh: _autoRefresh = true, sortByDeletedDate = true } = options
  const { t } = useI18n()

  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const addPopup = useAddPopup()

  // Store actions
  const { events, restoreEvent, hardDeleteEvent, batchRestore, batchHardDelete, clearTrash, getTrashedEvents } =
    useEventStore()

  // 削除済みイベントを取得
  const trashedEvents = useMemo(() => {
    const deleted = getTrashedEvents()
    return sortByDeletedDate ? eventDeletionUtils.sortDeletedEventsByDate(deleted) : deleted
  }, [getTrashedEvents, sortByDeletedDate])

  // 統計情報
  const stats = useMemo(() => eventDeletionUtils.getDeletedEventsStats(events), [events])

  // 選択関連
  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventIds((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }, [])

  const handleSelectAll = useCallback(() => {
    const allIds = trashedEvents.map((event) => event.id)
    setSelectedEventIds((prev) => (prev.length === allIds.length ? [] : allIds))
  }, [trashedEvents])

  const clearSelection = useCallback(() => {
    setSelectedEventIds([])
  }, [])

  // 単一イベント復元
  const handleRestoreEvent = useCallback(
    async (eventId: string) => {
      const event = trashedEvents.find((e) => e.id === eventId)
      if (!event) return

      const validation = eventDeletionUtils.validateRestore(event)
      if (!validation.canRestore) {
        addPopup({
          title: t('calendar.event.restoreError'),
          content: validation.reason || t('calendar.event.restoreFailed'),
          type: 'error',
        })
        return
      }

      setIsLoading(true)
      try {
        await restoreEvent(eventId)
        addPopup({
          title: '復元完了',
          content: `「${event.title}」を復元しました`,
          type: 'success',
        })
        clearSelection()
      } catch (error) {
        addPopup({
          title: '復元エラー',
          content: error instanceof Error ? error.message : '復元に失敗しました',
          type: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [trashedEvents, restoreEvent, addPopup, clearSelection]
  )

  // 単一イベント完全削除
  const handlePermanentDelete = useCallback(
    async (eventId: string) => {
      const event = trashedEvents.find((e) => e.id === eventId)
      if (!event) return

      const validation = eventDeletionUtils.validatePermanentDeletion(event)
      if (!validation.canPermanentlyDelete) {
        addPopup({
          title: '削除エラー',
          content: validation.reason || '削除できませんでした',
          type: 'error',
        })
        return
      }

      setIsLoading(true)
      try {
        await hardDeleteEvent(eventId)
        addPopup({
          title: '削除完了',
          content: `「${event.title}」を完全に削除しました`,
          type: 'success',
        })
        clearSelection()
      } catch (error) {
        addPopup({
          title: '削除エラー',
          content: error instanceof Error ? error.message : '削除に失敗しました',
          type: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [trashedEvents, hardDeleteEvent, addPopup, clearSelection]
  )

  // バッチ復元
  const handleBatchRestore = useCallback(async () => {
    if (selectedEventIds.length === 0) return

    const eventsToRestore = trashedEvents.filter((e) => selectedEventIds.includes(e.id))
    const invalidEvents = eventsToRestore.filter((event) => !eventDeletionUtils.validateRestore(event).canRestore)

    if (invalidEvents.length > 0) {
      addPopup({
        title: '復元エラー',
        content: `${invalidEvents.length}個のイベントが復元できませんでした`,
        type: 'error',
      })
      return
    }

    setIsLoading(true)
    try {
      await batchRestore(selectedEventIds)
      addPopup({
        title: '一括復元完了',
        content: `${selectedEventIds.length}個のイベントを復元しました`,
        type: 'success',
      })
      clearSelection()
    } catch (error) {
      addPopup({
        title: '一括復元エラー',
        content: error instanceof Error ? error.message : '一括復元に失敗しました',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedEventIds, trashedEvents, batchRestore, addPopup, clearSelection])

  // バッチ完全削除
  const handleBatchPermanentDelete = useCallback(async () => {
    if (selectedEventIds.length === 0) return

    const eventsToDelete = trashedEvents.filter((e) => selectedEventIds.includes(e.id))
    const invalidEvents = eventsToDelete.filter(
      (event) => !eventDeletionUtils.validatePermanentDeletion(event).canPermanentlyDelete
    )

    if (invalidEvents.length > 0) {
      addPopup({
        title: '削除エラー',
        content: `${invalidEvents.length}個のイベントが削除できませんでした`,
        type: 'error',
      })
      return
    }

    setIsLoading(true)
    try {
      await batchHardDelete(selectedEventIds)
      addPopup({
        title: '一括削除完了',
        content: `${selectedEventIds.length}個のイベントを完全に削除しました`,
        type: 'success',
      })
      clearSelection()
    } catch (error) {
      addPopup({
        title: '一括削除エラー',
        content: error instanceof Error ? error.message : '一括削除に失敗しました',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedEventIds, trashedEvents, batchHardDelete, addPopup, clearSelection])

  // ゴミ箱クリア（30日以上経過分を自動削除）
  const handleClearTrash = useCallback(async () => {
    const oldEvents = eventDeletionUtils.filterOldDeletedEvents(trashedEvents)

    if (oldEvents.length === 0) {
      addPopup({
        title: '情報',
        content: '30日以上経過した削除済みイベントがありません',
        type: 'info',
      })
      return
    }

    setIsLoading(true)
    try {
      await clearTrash()
      addPopup({
        title: 'ゴミ箱クリア完了',
        content: `${oldEvents.length}個の古いイベントを自動削除しました`,
        type: 'success',
      })
      clearSelection()
    } catch (error) {
      addPopup({
        title: 'クリアエラー',
        content: error instanceof Error ? error.message : 'ゴミ箱のクリアに失敗しました',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [trashedEvents, clearTrash, addPopup, clearSelection])

  // イベント検索・フィルタリング
  const searchEvents = useCallback(
    (query: string): Event[] => {
      if (!query.trim()) return trashedEvents

      const lowerQuery = query.toLowerCase()
      return trashedEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerQuery) ||
          event.description?.toLowerCase().includes(lowerQuery) ||
          event.location?.toLowerCase().includes(lowerQuery)
      )
    },
    [trashedEvents]
  )

  // 削除日でフィルタリング
  const filterByDeletionDate = useCallback(
    (days: number): Event[] => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      return trashedEvents.filter((event) => event.deletedAt && event.deletedAt >= cutoffDate)
    },
    [trashedEvents]
  )

  return {
    // データ
    trashedEvents,
    stats,
    selectedEventIds,
    isLoading,

    // 選択操作
    handleSelectEvent,
    handleSelectAll,
    clearSelection,
    isAllSelected: selectedEventIds.length === trashedEvents.length && trashedEvents.length > 0,
    selectedCount: selectedEventIds.length,

    // 単一操作
    handleRestoreEvent,
    handlePermanentDelete,

    // バッチ操作
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleClearTrash,

    // ユーティリティ
    searchEvents,
    filterByDeletionDate,
    getDaysUntilAutoDelete: eventDeletionUtils.getDaysUntilAutoDelete,
    formatDeletedDate: eventDeletionUtils.formatDeletedDate,

    // 状態チェック
    isEmpty: trashedEvents.length === 0,
    hasSelection: selectedEventIds.length > 0,
    hasOldEvents: stats.oldDeleted > 0,
  }
}
