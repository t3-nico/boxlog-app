'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { cn } from '@/lib/utils';

import type { OverduePlan } from '../../../../hooks/useOverduePlans';

interface OverdueBadgeProps {
  /** 未完了プラン配列 */
  overduePlans: OverduePlan[];
  /** 追加のクラス名 */
  className?: string;
  /** 追加のスタイル */
  style?: React.CSSProperties;
}

/**
 * OverdueBadge - 未完了プランのバッジコンポーネント（Googleカレンダー風）
 *
 * @description
 * 未完了で期限切れのプランの件数を表示するバッジ。
 * クリックするとGoogleカレンダー風のポップオーバーでプラン一覧を表示。
 */
export function OverdueBadge({ overduePlans, className, style }: OverdueBadgeProps) {
  const t = useTranslations('calendar.overdue');
  const locale = useLocale();
  const openInspector = usePlanInspectorStore((state) => state.openInspector);
  const { formatTime: formatTimeWithSettings } = useDateFormat();

  // HoverCardの表示位置を動的に決定
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const [hoverCardSide, setHoverCardSide] = useState<'left' | 'right'>('right');

  // HoverCard幅(w-64=256px) + sideOffset(8px) + 余裕(16px)
  const HOVER_CARD_WIDTH = 280;

  const updateHoverCardSide = useCallback(() => {
    if (!helpButtonRef.current) return;
    const rect = helpButtonRef.current.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    // 右側に十分なスペースがあれば右に、なければ左に表示
    setHoverCardSide(spaceOnRight >= HOVER_CARD_WIDTH ? 'right' : 'left');
  }, []);

  // 未完了プランがない場合は非表示
  if (overduePlans.length === 0) {
    return null;
  }

  const handlePlanClick = (plan: OverduePlan['plan']) => {
    // 繰り返しインスタンスの場合は親プランIDを使用
    const planIdToOpen = plan.calendarId ?? plan.id;

    // 繰り返しプランの場合はインスタンス日付を渡す
    const instanceDateRaw =
      plan.isRecurring && plan.id.includes('_')
        ? plan.id.split('_').pop()
        : plan.startDate?.toISOString().slice(0, 10);

    openInspector(
      planIdToOpen,
      instanceDateRaw && plan.isRecurring ? { instanceDate: instanceDateRaw } : undefined,
    );
  };

  // 日付のフォーマット（アジェンダ風）
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    if (isToday(date)) {
      return locale === 'ja' ? '今日' : 'Today';
    }
    if (isYesterday(date)) {
      return locale === 'ja' ? '昨日' : 'Yesterday';
    }
    return format(date, 'M/d');
  };

  // 時間のフォーマット
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return formatTimeWithSettings(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-warning',
            'flex items-center justify-center gap-1 text-xs font-normal md:gap-1.5',
            'transition-colors focus:outline-none',
            className,
          )}
          style={style}
        >
          <AlertCircle className="size-3 flex-shrink-0" />
          <span className="truncate">{t('badge', { count: overduePlans.length })}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* ヘッダー: タイトル + ヘルプ */}
        <div className="border-border flex items-start justify-between border-b px-4 py-3">
          <div className="flex-1">
            <h4 className="text-foreground text-sm font-bold">{t('title')}</h4>
            <p className="text-muted-foreground text-xs">{t('period')}</p>
          </div>
          {/* ヘルプアイコン with HoverCard */}
          <HoverCard openDelay={200} onOpenChange={(open) => open && updateHoverCardSide()}>
            <HoverCardTrigger asChild>
              <button
                ref={helpButtonRef}
                type="button"
                className="text-muted-foreground hover:text-foreground hover:bg-state-hover rounded-full p-1.5 transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side={hoverCardSide}
              align="start"
              alignOffset={16}
              className="bg-overlay border-border z-[250] w-64 rounded-xl shadow-lg"
              sideOffset={24}
              avoidCollisions={false}
            >
              <p className="text-muted-foreground text-sm leading-relaxed">{t('helpText')}</p>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* プランリスト（アジェンダ風） */}
        <div className="divide-border max-h-64 divide-y overflow-y-auto">
          {overduePlans.map(({ plan }) => {
            const dateLabel = formatDate(plan.endDate);
            const timeLabel = formatTime(plan.endDate);

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handlePlanClick(plan)}
                className={cn(
                  'group w-full px-4 py-2',
                  'grid grid-cols-[2.5rem_1fr_auto] items-center gap-2',
                  'hover:bg-state-hover focus-visible:bg-state-focus',
                  'focus-visible:outline-none',
                  'transition-colors duration-150',
                  'cursor-pointer text-left',
                )}
              >
                {/* 日付 */}
                <span className="text-muted-foreground text-right text-sm">{dateLabel}</span>

                {/* タイトル（カラードット + テキスト） */}
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: plan.color }}
                    aria-hidden="true"
                  />
                  <span className="text-foreground truncate text-sm group-hover:underline">
                    {plan.title || t('noTitle')}
                  </span>
                </span>

                {/* 時間 */}
                <span className="text-muted-foreground text-sm">{timeLabel || t('timeUnset')}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
