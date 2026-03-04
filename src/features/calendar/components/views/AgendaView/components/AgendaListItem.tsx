'use client';

import { useCallback, useMemo } from 'react';

import { Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TagSelectCombobox } from '@/components/tags/TagSelectCombobox';
import { useDateFormat } from '@/hooks/useDateFormat';
import { usePlanTags } from '@/hooks/usePlanTags';
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
 * レイアウト: 縦線 | 時間 | タイトル | タグ
 * - 左端の縦線はタグカラーを反映（タグ未設定時はentry-default）
 */
export function AgendaListItem({ plan, onClick, onContextMenu }: AgendaListItemProps) {
  const t = useTranslations('calendar');
  const { setPlanTags } = usePlanTags();
  const { formatTime: formatTimeWithSettings } = useDateFormat();
  const { getTagsByIds } = useTagsMap();

  // プランの実際のIDを取得（繰り返しプランの場合はcalendarIdを使用）
  const planId = plan.calendarId ?? plan.id;

  // 選択中のタグID（単一）
  const selectedTagId = plan.tagId ?? null;

  const handleClick = () => {
    onClick?.(plan);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(plan, e);
  };

  // タグの変更ハンドラー（単一タグ）
  const handleTagChange = useCallback(
    async (newTagId: string | null) => {
      await setPlanTags(planId, newTagId ? [newTagId] : []);
    },
    [planId, setPlanTags],
  );

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

        {/* タイトル */}
        <div className="min-w-0 flex-1">
          <span className="text-foreground truncate font-normal">
            {plan.title || t('event.noTitle')}
          </span>
        </div>
      </button>

      {/* タグ */}
      <div
        className="flex shrink-0 items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {tag ? (
          <span
            className="inline-flex max-w-16 items-center truncate rounded px-1.5 py-0.5 text-xs"
            style={{
              backgroundColor: tag.color ? `${tag.color}20` : undefined,
              color: tag.color || undefined,
            }}
            title={tag.name}
          >
            {tag.name}
          </span>
        ) : (
          <TagSelectCombobox
            selectedTagId={selectedTagId}
            onTagChange={handleTagChange}
            align="end"
            side="bottom"
          >
            <div
              className={cn(
                'text-muted-foreground hover:text-foreground flex cursor-pointer items-center rounded p-1 transition-all',
                'opacity-0 group-hover:opacity-100',
              )}
            >
              <Tag className="size-3.5" />
            </div>
          </TagSelectCombobox>
        )}
      </div>
    </div>
  );
}
