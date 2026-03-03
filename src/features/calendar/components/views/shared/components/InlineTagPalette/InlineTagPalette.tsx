'use client';

/**
 * インラインタグパレット
 *
 * カレンダーグリッド上でドラッグ確定後に表示される。
 * 選択範囲のハイライト + タグボタン群を表示し、
 * タグタップでエントリを即作成する。フォームなし、保存ボタンなし。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useTags } from '@/hooks/useTagsQuery';
import { convertFromTimezone } from '@/lib/date/timezone';
import { logger } from '@/lib/logger';
import { parseColonTag } from '@/lib/tag-colon';
import { cn } from '@/lib/utils';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useInlineCreateStore } from '@/stores/useInlineCreateStore';

import { Z_INDEX } from '../../constants/grid.constants';

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

  // エントリ作成ハンドラー（タグ必須、タグ名をタイトルに設定）
  const handleCreate = useCallback(
    (tagId: string, tagName: string) => {
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
        tagId,
        title: tagName,
      });

      createEntry.mutate(
        {
          title: tagName,
          start_time: utcStart.toISOString(),
          end_time: utcEnd.toISOString(),
        },
        {
          onSuccess: (result) => {
            if (result?.id) {
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

  // パレット用グルーピング（コロン付き1つでもprefix表示）
  const { groups, ungrouped } = useMemo(() => {
    const allTags = tags ?? [];
    const prefixMap = new Map<string, typeof allTags>();
    const noColon: typeof allTags = [];

    for (const tag of allTags) {
      const { prefix, suffix } = parseColonTag(tag.name);
      if (suffix !== null) {
        const existing = prefixMap.get(prefix) ?? [];
        existing.push(tag);
        prefixMap.set(prefix, existing);
      } else {
        noColon.push(tag);
      }
    }

    return { groups: prefixMap, ungrouped: noColon };
  }, [tags]);

  if (!pendingSelection) return null;

  const { startHour, startMinute, endHour, endMinute } = pendingSelection;

  // 選択範囲のピクセル計算
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const selectionTop = startMinutes * (hourHeight / 60);
  const selectionHeight = (endMinutes - startMinutes) * (hourHeight / 60);

  // パレットの位置（選択範囲の直下）
  const paletteTop = selectionTop + selectionHeight + 4;

  // 時間ラベル + 合計時間
  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const timeLabel = `${formatTime(startHour, startMinute)} – ${formatTime(endHour, endMinute)}`;

  const totalMinutes = endMinutes - startMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationText =
    hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : `${minutes}m`;

  return (
    <div
      ref={paletteRef}
      data-tag-palette
      className="pointer-events-auto absolute right-0 left-0"
      style={{ zIndex: Z_INDEX.POPOVER }}
    >
      {/* 選択範囲ハイライト（DragSelectionPreviewと同じデザイン） */}
      <div
        className="bg-plan-box border-plan-border absolute right-0 left-0 rounded-md border"
        style={{
          top: selectionTop,
          height: selectionHeight,
        }}
      >
        <div className="flex h-full flex-col justify-between p-2">
          <span className="text-foreground text-sm font-semibold tabular-nums">{timeLabel}</span>
          <span className="text-foreground/60 text-sm font-medium tabular-nums">
            {durationText}
          </span>
        </div>
      </div>

      {/* タグパレット */}
      <div
        className="bg-card border-border absolute right-1 left-1 rounded-lg border p-2 shadow-lg"
        style={{ top: paletteTop }}
      >
        <div className="flex flex-col gap-1.5">
          {/* [prefix] suffix suffix ... */}
          {[...groups.entries()].map(([prefix, groupTags]) => {
            const firstTag = groupTags[0];
            const groupColor = firstTag?.color ?? null;

            return (
              <div key={prefix} className="flex flex-wrap items-center gap-1">
                {/* prefix ボタン（クリックで先頭タグを割り当て） */}
                <button
                  type="button"
                  disabled={isCreating || !firstTag}
                  onClick={() => firstTag && handleCreate(firstTag.id, prefix)}
                  className={cn(
                    'rounded px-2 py-1 text-xs font-semibold transition-colors',
                    'hover:opacity-80 active:scale-95 disabled:opacity-50',
                  )}
                  style={{
                    backgroundColor: groupColor
                      ? `color-mix(in oklch, ${groupColor} 25%, transparent)`
                      : 'var(--muted)',
                    color: groupColor ?? 'var(--muted-foreground)',
                  }}
                >
                  {prefix}
                </button>

                {/* suffix 表示 */}
                {groupTags.map((tag) => {
                  const { suffix } = parseColonTag(tag.name);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      disabled={isCreating}
                      onClick={() => handleCreate(tag.id, tag.name)}
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
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
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: tag.color ?? 'var(--muted-foreground)' }}
                      />
                      {suffix}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* 非グループタグ */}
          {ungrouped.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {ungrouped.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  disabled={isCreating}
                  onClick={() => handleCreate(tag.id, tag.name)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
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
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: tag.color ?? 'var(--muted-foreground)' }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
