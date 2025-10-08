'use client'

import { useCallback, useState } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'

import { useEventStore } from '../stores/useEventStore'
import type { CreateEventRequest, Event } from '../types/events'

interface UseCreateEventReturn {
  createEvent: (data: CreateEventRequest) => Promise<Event>
  isCreating: boolean
  error: Error | null
  reset: () => void
}

export function useCreateEvent(): UseCreateEventReturn {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const eventStore = useEventStore()
  const toast = useCalendarToast()

  const createEvent = useCallback(
    async (data: CreateEventRequest): Promise<Event> => {
      setIsCreating(true)
      setError(null)

      try {
        // バリデーション
        if (!data.title?.trim()) {
          throw new Error('Title is required')
        }

        // 日時の整合性チェック
        if (data.startDate && data.endDate) {
          if (data.endDate < data.startDate) {
            throw new Error('End time must be after start time')
          }
        }

        // イベント作成
        const createdEvent = await eventStore.createEvent(data)

        // 成功通知
        toast.success(`「${createdEvent.title}」を作成しました`)

        // 作成したイベントの日付にスクロール（カレンダービューの場合）
        const { pathname } = window.location
        if (pathname.startsWith('/calendar') && createdEvent.startDate) {
          // カレンダービューの場合、作成したイベントの日付に移動
          const dateStr = createdEvent.startDate.toISOString().split('T')[0]
          const currentUrl = new URL(window.location.href)
          currentUrl.searchParams.set('date', dateStr)
          window.history.pushState({}, '', currentUrl.toString())

          // イベントをハイライト表示するための処理
          setTimeout(() => {
            const eventElement = document.querySelector(`[data-event-id="${createdEvent.id}"]`)
            if (eventElement) {
              eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              eventElement.classList.add('animate-pulse')
              setTimeout(() => {
                eventElement.classList.remove('animate-pulse')
              }, 2000)
            }
          }, 100)
        }

        return createdEvent
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
        setError(new Error(errorMessage))

        // エラー通知
        toast.error(errorMessage)

        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [eventStore, toast]
  )

  const reset = useCallback(() => {
    setError(null)
    setIsCreating(false)
  }, [])

  return {
    createEvent,
    isCreating,
    error,
    reset,
  }
}
