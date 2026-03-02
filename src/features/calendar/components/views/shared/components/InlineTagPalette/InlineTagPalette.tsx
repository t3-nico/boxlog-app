'use client';

/**
 * インラインタグパレット
 *
 * カレンダーグリッド上でドラッグ確定後に表示される。
 * 選択範囲のハイライト + タグボタン群を表示し、
 * タグタップでエントリを即作成する。フォームなし、保存ボタンなし。
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { Plus } from 'lucide-react';

import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useTags } from '@/hooks/useTagsQuery';
import { convertFromTimezone } from '@/lib/date/timezone';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useInlineCreateStore } from '@/stores/useInlineCreateStore';

import { Z_INDEX } from '../../constants/grid.constants';

/** パレットに表示するタグの最大数 */
const MAX_TAGS = 10;

interface InlineTagPaletteProps {
  /** 1時間あたりの高さ（px） */
  hourHeight: number;
}

export function InlineTagPalette({ hourHeight }: InlineTagPaletteProps) {
  const pendingSelection = useInlineCreateStore.use.pendingSelection();
  const clearPendingSelection = useInlineCreateStore.use.clearPendingSelection();
  const timezone = useCalendarSettingsStore((s) => s.timezone);

  const { data: tags } = useTags();
  const { createEntry, bulkAddTags } = useEntryMutations();
  const [isCreating, setIsCreating] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // 外部クリック / Escape でキャンセル
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        clearPendingSelection();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearPendingSelection();
      }
    };

    // mousedown ではなく少し遅延を入れてリスナーを追加
    // ドラッグ終了のmouseupと同フレームで発火するのを防ぐ
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearPendingSelection]);

  // エントリ作成ハンドラー
  const handleCreate = useCallback(
    (tagId?: string) => {
      if (!pendingSelection || isCreating) return;

      setIsCreating(true);

      const { date, startHour, startMinute, endHour, endMinute } = pendingSelection;

      // ローカル時刻 → UTC変換
      const localStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startHour,
        startMinute,
      );
      const localEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        endHour,
        endMinute,
      );

      const utcStart = convertFromTimezone(localStart, timezone);
      const utcEnd = convertFromTimezone(localEnd, timezone);

      logger.log('🏷️ InlineTagPalette: Creating entry', {
        start: utcStart.toISOString(),
        end: utcEnd.toISOString(),
        tagId: tagId ?? 'none',
      });

      createEntry.mutate(
        {
          title: '',
          start_time: utcStart.toISOString(),
          end_time: utcEnd.toISOString(),
        },
        {
          onSuccess: (result) => {
            // タグがある場合はタグを追加
            if (tagId && result?.id) {
              bulkAddTags.mutate({
                entryIds: [result.id],
                tagIds: [tagId],
              });
            }
            clearPendingSelection();
            setIsCreating(false);
          },
          onError: () => {
            setIsCreating(false);
          },
        },
      );
    },
    [pendingSelection, isCreating, timezone, createEntry, bulkAddTags, clearPendingSelection],
  );

  if (!pendingSelection) return null;

  const { startHour, startMinute, endHour, endMinute } = pendingSelection;

  // 選択範囲のピクセル計算
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const selectionTop = startMinutes * (hourHeight / 60);
  const selectionHeight = (endMinutes - startMinutes) * (hourHeight / 60);

  // パレットの位置（選択範囲の直下）
  const paletteTop = selectionTop + selectionHeight + 4;

  // 時間ラベル
  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const timeLabel = `${formatTime(startHour, startMinute)} – ${formatTime(endHour, endMinute)}`;

  const displayTags = (tags ?? []).slice(0, MAX_TAGS);

  return (
    <div
      ref={paletteRef}
      data-tag-palette
      className="pointer-events-auto absolute right-0 left-0"
      style={{ zIndex: Z_INDEX.POPOVER }}
    >
      {/* 選択範囲ハイライト */}
      <div
        className="bg-plan-box border-plan-border absolute right-0 left-0 rounded border"
        style={{
          top: selectionTop,
          height: selectionHeight,
        }}
      >
        <div className="text-foreground px-2 py-1 text-xs font-medium">{timeLabel}</div>
      </div>

      {/* タグパレット */}
      <div
        className="bg-card border-border absolute right-1 left-1 rounded-lg border p-2 shadow-lg"
        style={{ top: paletteTop }}
      >
        {displayTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                disabled={isCreating}
                onClick={() => handleCreate(tag.id)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  'hover:opacity-80 active:scale-95 disabled:opacity-50',
                )}
                style={{
                  backgroundColor: tag.color
                    ? `color-mix(in oklch, ${tag.color} 15%, transparent)`
                    : 'var(--muted)',
                  color: tag.color ?? 'var(--muted-foreground)',
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: tag.color ?? 'var(--muted-foreground)' }}
                />
                {tag.name}
              </button>
            ))}

            {/* タグなしボタン */}
            <button
              type="button"
              disabled={isCreating}
              onClick={() => handleCreate()}
              className={cn(
                'bg-muted text-muted-foreground flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                'hover:bg-state-hover active:scale-95 disabled:opacity-50',
              )}
            >
              <Plus className="size-3" />
              タグなし
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isCreating}
            onClick={() => handleCreate()}
            className={cn(
              'bg-primary text-primary-foreground w-full rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50',
            )}
          >
            作成
          </button>
        )}
      </div>
    </div>
  );
}
