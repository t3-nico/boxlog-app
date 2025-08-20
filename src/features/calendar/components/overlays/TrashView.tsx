/**
 * ゴミ箱ビュー - 削除されたイベントの表示と復元
 */

'use client'

import React from 'react'
import type { CalendarEvent } from '@/features/events'

interface TrashViewProps {
  events: CalendarEvent[]
  onRestore?: (event: CalendarEvent) => void
  onPermanentDelete?: (eventId: string) => void
}

export function TrashView({ events, onRestore, onPermanentDelete }: TrashViewProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">ゴミ箱</h2>
      
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          削除されたイベントはありません
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500">
                  {event.description}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onRestore?.(event)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  復元
                </button>
                <button
                  onClick={() => onPermanentDelete?.(event.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
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