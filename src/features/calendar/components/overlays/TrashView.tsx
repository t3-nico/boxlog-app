/**
 * ゴミ箱ビュー - 削除されたイベントの表示と復元
 */

'use client'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

interface TrashViewProps {
  events: CalendarPlan[]
  onRestore?: (plan: CalendarPlan) => void
  onPermanentDelete?: (eventId: string) => void
}

export const TrashView = ({ events, onRestore, onPermanentDelete }: TrashViewProps) => {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">ゴミ箱</h2>

      {events.length === 0 ? (
        <div className="py-8 text-center text-gray-500">削除されたイベントはありません</div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500">{event.description}</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onRestore?.(event)}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  復元
                </button>
                <button
                  type="button"
                  onClick={() => onPermanentDelete?.(event.id)}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                >
                  完全削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
