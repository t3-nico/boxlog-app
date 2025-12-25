/**
 * ゴミ箱ビュー - 削除されたイベントの表示と復元
 */

'use client';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

interface TrashViewProps {
  events: CalendarPlan[];
  onRestore?: (plan: CalendarPlan) => void;
  onPermanentDelete?: (eventId: string) => void;
}

export const TrashView = ({ events, onRestore, onPermanentDelete }: TrashViewProps) => {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">ゴミ箱</h2>

      {events.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">削除されたイベントはありません</div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-surface-container flex items-center justify-between rounded-lg p-3"
            >
              <div>
                <div className="text-foreground font-medium">{event.title}</div>
                <div className="text-muted-foreground text-sm">{event.description}</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onRestore?.(event)}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover rounded px-3 py-1 text-sm"
                >
                  復元
                </button>
                <button
                  type="button"
                  onClick={() => onPermanentDelete?.(event.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive-hover rounded px-3 py-1 text-sm"
                >
                  完全削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
