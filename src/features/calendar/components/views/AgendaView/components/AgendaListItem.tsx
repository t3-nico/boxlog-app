'use client';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { useDateFormat } from '@/hooks/useDateFormat';
import { useTagsMap } from '@/hooks/useTagsMap';
import { cn } from '@/lib/utils';
import type { CalendarPlan } from '../../../../types/calendar.types';

interface AgendaListItemProps {
  plan: CalendarPlan;
  onClick?: ((plan: CalendarPlan) => void) | undefined;
  onContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined;
}

/**
 * AgendaListItem - 日別グループ内のアイテム表示
 *
 * レイアウト: 縦線 | 時間 | タグ名
 * - 左端の縦線はタグカラーを反映（タグ未設定時はentry-default）
 */
export function AgendaListItem({ plan, onClick, onContextMenu }: AgendaListItemProps) {
  const t = useTranslations('calendar');
  const { formatTime: formatTimeWithSettings } = useDateFormat();
  const { getTagsByIds } = useTagsMap();

  // 選択中のタグID（単一）
  const selectedTagId = plan.tagId ?? null;

  const handleClick = () => {
    onClick?.(plan);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(plan, e);
  };

  // 時間表示（開始 - 終了）
  const startTime = plan.startDate ? formatTimeWithSettings(plan.startDate) : '';
  const endTime = plan.endDate ? formatTimeWithSettings(plan.endDate) : '';
  const displayTime =
    startTime && endTime ? `${startTime} - ${endTime}` : startTime || t('event.allDay');

  // タグの表示（単一タグ）
  const tag = useMemo(() => {
    if (!selectedTagId) return null;
    const tags = getTagsByIds([selectedTagId]);
    return tags[0] ?? null;
  }, [selectedTagId, getTagsByIds]);

  return (
    <div
      className={cn(
        'group flex w-full items-center gap-2 px-4 py-2',
        'hover:bg-state-hover',
        'transition-colors duration-150',
      )}
    >
      {/* 左端の縦線（タグカラー反映） */}
      <div
        className="h-6 w-0.5 shrink-0 rounded-full"
        style={{ backgroundColor: tag?.color || 'var(--entry-default)' }}
      />

      {/* クリック可能エリア */}
      <button
        type="button"
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
          'cursor-pointer text-left',
        )}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* 時間 */}
        <div className="text-muted-foreground w-28 shrink-0 text-sm tabular-nums">
          {displayTime}
        </div>

        {/* タグ名 */}
        <div className="min-w-0 flex-1">
          <span className="text-foreground truncate font-normal">
            {tag?.name || t('event.noTitle')}
          </span>
        </div>
      </button>
    </div>
  );
}
