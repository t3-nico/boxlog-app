'use client';

import { useCallback, useMemo } from 'react';

import { format, isToday, isTomorrow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Tag } from 'lucide-react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { TagSelectCombobox } from '@/features/plans/components/shared/TagSelectCombobox';
import { usePlanTags } from '@/features/plans/hooks/usePlanTags';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { useTagsMap } from '@/features/tags/hooks/useTagsMap';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface AgendaListItemProps {
  plan: CalendarPlan;
  onClick?: ((plan: CalendarPlan) => void) | undefined;
  onContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined;
}

/**
 * AgendaListItem - フラットリスト表示用のアイテム
 *
 * レイアウト: 日付 | 時間 | タイトル# | タグ
 */
export function AgendaListItem({ plan, onClick, onContextMenu }: AgendaListItemProps) {
  const locale = useLocale();
  const dateLocale = locale === 'ja' ? ja : undefined;
  const { addPlanTag, removePlanTag } = usePlanTags();
  const { formatTime: formatTimeWithSettings } = useDateFormat();
  const { getTagsByIds } = useTagsMap();

  // プランの実際のIDを取得（繰り返しプランの場合はcalendarIdを使用）
  const planId = plan.calendarId ?? plan.id;

  // 選択中のタグID
  const selectedTagIds = useMemo(() => {
    return plan.tagIds ?? [];
  }, [plan.tagIds]);

  const handleClick = () => {
    onClick?.(plan);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(plan, e);
  };

  // タグの変更ハンドラー
  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      const currentTagIds = selectedTagIds;
      const addedTagIds = newTagIds.filter((id) => !currentTagIds.includes(id));
      const removedTagIds = currentTagIds.filter((id) => !newTagIds.includes(id));

      // 追加されたタグを処理
      for (const tagId of addedTagIds) {
        await addPlanTag(planId, tagId);
      }

      // 削除されたタグを処理
      for (const tagId of removedTagIds) {
        await removePlanTag(planId, tagId);
      }
    },
    [planId, selectedTagIds, addPlanTag, removePlanTag],
  );

  // 日付のフォーマット
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    if (isToday(date)) {
      return locale === 'ja' ? '今日' : 'Today';
    }
    if (isTomorrow(date)) {
      return locale === 'ja' ? '明日' : 'Tomorrow';
    }
    return format(
      date,
      locale === 'ja' ? 'M/d' : 'M/d',
      dateLocale ? { locale: dateLocale } : undefined,
    );
  };

  // 時間のフォーマット
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return formatTimeWithSettings(date);
  };

  const dateLabel = formatDate(plan.startDate);
  const startTime = formatTime(plan.startDate);
  const endTime = formatTime(plan.endDate);
  const timeRange =
    startTime && endTime
      ? `${startTime}-${endTime}`
      : startTime || (locale === 'ja' ? '終日' : 'All day');

  // タグの表示（tagIdsからタグ情報を取得）
  const tags = getTagsByIds(selectedTagIds);
  const displayTags = tags.slice(0, 3);

  return (
    <button
      type="button"
      className={cn(
        'group w-full px-3 py-2.5 md:px-4 md:py-3',
        // モバイル: 2列レイアウト、PC: 横並び
        'flex flex-col gap-1 md:flex-row md:items-center md:gap-4',
        'hover:bg-state-hover focus-visible:bg-state-hover',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
        'transition-colors duration-150',
        'cursor-pointer text-left',
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* モバイル: 上段（日付・時間）、PC: 左側 */}
      <div className="flex items-center gap-2 md:contents">
        {/* 日付 */}
        <div
          className={cn(
            'shrink-0 text-sm font-normal md:w-12',
            isToday(plan.startDate ?? new Date()) ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {dateLabel}
        </div>

        {/* 区切り（モバイルのみ） */}
        <span className="text-muted-foreground/50 md:hidden">•</span>

        {/* 時間 */}
        <div className="text-muted-foreground shrink-0 text-sm md:w-24">{timeRange}</div>
      </div>

      {/* モバイル: 下段（タイトル・タグ）、PC: 右側 */}
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
        {/* タイトル + # */}
        <div className="flex min-w-0 flex-1 items-baseline gap-1 md:gap-1.5">
          <span className="text-foreground truncate font-normal group-hover:underline md:max-w-48">
            {plan.title}
          </span>
        </div>

        {/* タグ */}
        <div
          className="flex shrink-0 items-center gap-1 md:w-40"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {displayTags.length > 0 ? (
            <>
              {/* モバイルでは最大2つ、PCでは最大3つ */}
              {displayTags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex max-w-16 items-center gap-0.5 truncate rounded border px-1 py-0.5 text-xs md:max-w-20 md:px-1.5"
                  style={{ borderColor: tag.color || undefined, color: tag.color || undefined }}
                  title={tag.name}
                >
                  <span className="truncate">{tag.name}</span>
                </span>
              ))}
              {/* 3つ目のタグはPCのみ表示 */}
              {displayTags[2] && (
                <span
                  key={displayTags[2].id}
                  className="hidden items-center gap-0.5 truncate rounded border px-1.5 py-0.5 text-xs md:inline-flex md:max-w-20"
                  style={{
                    borderColor: displayTags[2].color || undefined,
                    color: displayTags[2].color || undefined,
                  }}
                  title={displayTags[2].name}
                >
                  <span className="truncate">{displayTags[2].name}</span>
                </span>
              )}
              {tags.length > 3 && (
                <span className="text-muted-foreground hidden text-xs md:inline">
                  +{tags.length - 3}
                </span>
              )}
              {tags.length > 2 && (
                <span className="text-muted-foreground text-xs md:hidden">+{tags.length - 2}</span>
              )}
            </>
          ) : (
            <TagSelectCombobox
              selectedTagIds={selectedTagIds}
              onTagsChange={handleTagsChange}
              align="end"
              side="bottom"
            >
              <div className="hover:bg-state-hover flex w-fit cursor-pointer items-center gap-1 rounded py-0.5 text-sm transition-colors">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Tag className="size-3" />
                  <span className="hidden md:inline">
                    {locale === 'ja' ? 'タグを追加' : 'Add tag'}
                  </span>
                </div>
              </div>
            </TagSelectCombobox>
          )}
        </div>
      </div>
    </button>
  );
}
