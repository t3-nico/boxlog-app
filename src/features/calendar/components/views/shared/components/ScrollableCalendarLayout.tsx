/**
 * 統一されたスクロール可能カレンダーレイアウト
 *
 * リファクタリング済み: ロジックは専用フックに分離
 * - useScrollableCalendar: スクロール管理・キーボードナビゲーション
 * - useCurrentTimeLine: 現在時刻線のロジック
 * - useSleepHoursLayout: 睡眠時間帯のレイアウト計算
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { ChevronDown, ChevronUp, Moon } from 'lucide-react';

import { HoverTooltip } from '@/components/ui/tooltip';
import { useSleepHours } from '@/features/calendar/hooks/useSleepHours';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

import { TimeColumn } from '../grid/TimeColumn/TimeColumn';
import { useCurrentTimeLine } from '../hooks/useCurrentTimeLine';
import { useResponsiveHourHeight } from '../hooks/useResponsiveHourHeight';
import { useScrollableCalendar } from '../hooks/useScrollableCalendar';
import { useSleepHoursLayout } from '../hooks/useSleepHoursLayout';

import { TIME_COLUMN_WIDTH } from '../constants/grid.constants';
import { COLLAPSED_SECTION_HEIGHT, CollapsedSleepSection } from './CollapsedSleepSection';
import { TimezoneOffset } from './TimezoneOffset';

interface ScrollableCalendarLayoutProps {
  children: React.ReactNode;
  className?: string | undefined;
  timezone?: string | undefined;
  scrollToHour?: number | undefined;
  showTimeColumn?: boolean | undefined;
  showCurrentTime?: boolean | undefined;
  showTimezone?: boolean | undefined;
  timeColumnWidth?: number | undefined;
  onTimeClick?: ((hour: number, minute: number) => void) | undefined;
  displayDates?: Date[] | undefined;
  viewMode?: string | undefined;
  /** 睡眠時間帯内のプラン数計算用 */
  plans?: CalendarPlan[] | undefined;

  // スクロール機能の追加
  enableKeyboardNavigation?: boolean | undefined;
  onScrollPositionChange?: ((scrollTop: number) => void) | undefined;
}

interface CalendarDateHeaderProps {
  header: React.ReactNode;
  showTimeColumn?: boolean | undefined;
  showTimezone?: boolean | undefined;
  timeColumnWidth?: number | undefined;
  timezone?: string | undefined;
  /** 週番号（表示する場合） */
  weekNumber?: number | undefined;
}

/**
 * カレンダー日付ヘッダー（固定）
 */
export const CalendarDateHeader = ({
  header,
  showTimeColumn = true,
  showTimezone = true,
  timeColumnWidth = TIME_COLUMN_WIDTH,
  timezone,
  weekNumber,
}: CalendarDateHeaderProps) => {
  const showWeekNumbers = useCalendarSettingsStore((state) => state.showWeekNumbers);

  // 設定がオンで週番号が渡されている場合のみ表示
  const shouldShowWeekNumber = showWeekNumbers && weekNumber != null;

  return (
    <div className="flex h-12 shrink-0 flex-col justify-center py-2">
      <div className="flex items-center">
        {/* 左スペーサー（時間列と揃えるため） */}
        {showTimeColumn ? (
          <div
            className="flex shrink-0 flex-col items-center justify-center"
            style={{ width: timeColumnWidth }}
          >
            {/* 週番号バッジ（Googleカレンダースタイル） - モバイルのみ表示 */}
            {shouldShowWeekNumber ? (
              <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-xs font-normal md:hidden">
                {weekNumber}
              </span>
            ) : null}
            {/* タイムゾーン表示（PC: 常に表示、モバイル: 週番号がない場合のみ） */}
            {showTimezone && timezone ? (
              <TimezoneOffset
                timezone={timezone}
                className={cn('w-full text-xs', shouldShowWeekNumber && 'hidden md:flex')}
              />
            ) : null}
          </div>
        ) : null}

        {/* 各ビューが独自のヘッダーを配置するエリア */}
        <div className="flex-1">{header}</div>
      </div>
    </div>
  );
};

/**
 * スクロール可能カレンダーコンテンツ
 */
export const ScrollableCalendarLayout = ({
  children,
  className = '',
  timezone: _timezone,
  scrollToHour: _scrollToHour = 8,
  showTimeColumn = true,
  showCurrentTime = true,
  showTimezone: _showTimezone = true,
  timeColumnWidth = TIME_COLUMN_WIDTH,
  onTimeClick,
  displayDates = [],
  viewMode = 'week',
  plans,
  enableKeyboardNavigation = true,
  onScrollPositionChange,
}: ScrollableCalendarLayoutProps) => {
  const [_containerWidth, setContainerWidth] = useState(800);

  // 睡眠時間帯設定
  const sleepHours = useSleepHours();
  const sleepHoursCollapsed = useCalendarSettingsStore((state) => state.sleepHoursCollapsed);
  const sleepScheduleEnabled = useCalendarSettingsStore((state) => state.sleepSchedule.enabled);
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  });

  // 睡眠時間帯のレイアウト計算（フック利用）
  const { collapsedLayout, gridHeight, sleepHoursPlanCountByDate, todayColumnPosition, hasToday } =
    useSleepHoursLayout({
      sleepHours,
      sleepHoursCollapsed,
      hourHeight: HOUR_HEIGHT,
      plans,
      displayDates,
    });

  // スクロール管理・キーボードナビゲーション（フック利用）
  const { scrollContainerRef, handleKeyDown, handleToggleSleepHours } = useScrollableCalendar({
    viewMode,
    hourHeight: HOUR_HEIGHT,
    sleepHoursCollapsed,
    sleepHours,
    enableKeyboardNavigation,
    onScrollPositionChange,
    onToggleSleepHours: () => updateSettings({ sleepHoursCollapsed: !sleepHoursCollapsed }),
  });

  // 現在時刻線ロジック（フック利用）
  const { currentTime, currentTimePosition, collapsedCurrentTimePosition, currentTimeLineColor } =
    useCurrentTimeLine({
      hourHeight: HOUR_HEIGHT,
      showCurrentTime,
      sleepHours,
      collapsedLayout,
    });

  // 現在時刻のフォーマット（HH:mm）
  const formattedCurrentTime = currentTime.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // コンテナ幅の動的取得
  useEffect(() => {
    const updateContainerWidth = () => {
      if (scrollContainerRef.current) {
        const width = scrollContainerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [scrollContainerRef]);

  // グリッドクリックハンドラー
  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onTimeClick || !scrollContainerRef.current) return;

      const rect = scrollContainerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top + scrollContainerRef.current.scrollTop;
      const x = e.clientX - rect.left;

      // 時間列以外の領域のクリックのみ処理
      if (showTimeColumn && x < timeColumnWidth) return;

      // 15分単位でスナップ
      const totalMinutes = Math.max(0, Math.floor((y / HOUR_HEIGHT) * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round((totalMinutes % 60) / 15) * 15;

      if (hours >= 0 && hours < 24) {
        onTimeClick(hours, minutes);
      }
    },
    [onTimeClick, HOUR_HEIGHT, showTimeColumn, timeColumnWidth, scrollContainerRef],
  );

  // 現在時刻線を表示するか判定
  const shouldShowCurrentTimeLine = showCurrentTime;

  return (
    <div
      ref={scrollContainerRef}
      className={cn('calendar-scrollbar relative min-h-0 flex-1 overflow-y-auto', className)}
      data-calendar-scroll
    >
      <div
        className="relative flex w-full"
        style={{ height: `${gridHeight}px` }}
        onClick={handleGridClick}
        onKeyDown={handleKeyDown}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
        role={enableKeyboardNavigation ? 'grid' : undefined}
        aria-label={enableKeyboardNavigation ? `${viewMode} view calendar` : undefined}
      >
        {/* 時間軸列 */}
        {showTimeColumn && (
          <div
            className="border-border sticky left-0 z-10 shrink-0 border-r"
            style={{ width: timeColumnWidth }}
          >
            {collapsedLayout && sleepHours ? (
              // 折りたたみ時の時間列
              <div className="relative h-full">
                {/* 上部の折りたたみセクション（時間列部分）- 睡眠時間帯全体を1行で表示 */}
                <div
                  className="bg-chronotype-sleep relative z-10 flex w-full items-center justify-end gap-1 pr-2"
                  style={{ height: COLLAPSED_SECTION_HEIGHT }}
                >
                  <Moon className="text-muted-foreground size-3" />
                  <span className="text-muted-foreground text-xs">
                    {sleepHours.bedtime}-{sleepHours.wakeTime}
                  </span>
                </div>

                {/* 起きている時間帯の時間列 */}
                <div className="relative" style={{ height: collapsedLayout.awakeHeight }}>
                  {/* 起床時間の位置（最上部）に展開ボタン */}
                  <div className="absolute top-0 right-0 z-20 flex items-center justify-end pr-2">
                    <HoverTooltip content="睡眠時間帯を展開" side="right">
                      <button
                        type="button"
                        onClick={handleToggleSleepHours}
                        className="hover:bg-state-hover flex size-6 cursor-pointer items-center justify-center rounded-lg transition-colors"
                        aria-label="睡眠時間帯を展開"
                      >
                        <ChevronUp className="text-muted-foreground size-4" />
                      </button>
                    </HoverTooltip>
                  </div>
                  <div className="overflow-hidden" style={{ height: collapsedLayout.awakeHeight }}>
                    <TimeColumn
                      startHour={collapsedLayout.wakeTime}
                      endHour={collapsedLayout.bedtime}
                      hourHeight={HOUR_HEIGHT}
                      format="24h"
                      className=""
                    />
                  </div>
                  {/* 現在時刻ラベル（折りたたみ時・Apple Calendar風） */}
                  {shouldShowCurrentTimeLine && hasToday && (
                    <div
                      className="pointer-events-none absolute right-0 z-20 rounded px-2 py-1 text-xs font-bold text-white"
                      style={{
                        top: `${collapsedCurrentTimePosition - COLLAPSED_SECTION_HEIGHT}px`,
                        transform: 'translateY(-50%)',
                        backgroundColor: currentTimeLineColor || 'hsl(var(--primary))',
                      }}
                    >
                      {formattedCurrentTime}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 通常時の時間列
              <div className="relative h-full">
                <TimeColumn
                  startHour={0}
                  endHour={24}
                  hourHeight={HOUR_HEIGHT}
                  format="24h"
                  className="h-full"
                />
                {/* 起床時間の位置に折りたたみボタンを表示 */}
                {sleepScheduleEnabled && sleepHours && (
                  <div
                    className="absolute right-0 z-20 flex items-center justify-end pr-2"
                    style={{ top: `${sleepHours.wakeTime * HOUR_HEIGHT - 40}px` }}
                  >
                    <HoverTooltip content="睡眠時間帯を折りたたむ" side="right">
                      <button
                        type="button"
                        onClick={handleToggleSleepHours}
                        className="hover:bg-state-hover flex size-6 cursor-pointer items-center justify-center rounded-lg transition-colors"
                        aria-label="睡眠時間帯を折りたたむ"
                      >
                        <ChevronDown className="text-muted-foreground size-4" />
                      </button>
                    </HoverTooltip>
                  </div>
                )}
                {/* 現在時刻ラベル（Apple Calendar風） */}
                {shouldShowCurrentTimeLine && hasToday && (
                  <div
                    className="pointer-events-none absolute right-0 z-20 rounded px-2 py-1 text-xs font-bold text-white"
                    style={{
                      top: `${currentTimePosition}px`,
                      transform: 'translateY(-50%)',
                      backgroundColor: currentTimeLineColor || 'hsl(var(--primary))',
                    }}
                  >
                    {formattedCurrentTime}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* グリッドコンテンツエリア */}
        <div className="relative flex flex-1 flex-col">
          {collapsedLayout && sleepHours ? (
            // 折りたたみ時のレイアウト
            <>
              {/* 上部の折りたたみセクション（睡眠時間帯全体を1行で表示） */}
              <CollapsedSleepSection
                startHour={sleepHours.bedtime}
                endHour={sleepHours.wakeTime}
                position="top"
                planCountsByDate={sleepHoursPlanCountByDate}
              />

              {/* 縦の区切り線（折りたたみセクション上にも表示） */}
              {displayDates && displayDates.length > 1 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex">
                  {displayDates.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex-1',
                        index < displayDates.length - 1 && 'border-border border-r',
                      )}
                    />
                  ))}
                </div>
              )}

              {/* 起きている時間帯のコンテンツ */}
              <div
                className="relative flex-1 overflow-hidden"
                style={{ height: collapsedLayout.awakeHeight }}
              >
                {/* 子要素を負のマージンでオフセット（flex で横並びを維持） */}
                <div
                  className="relative flex"
                  style={{
                    marginTop: -(collapsedLayout.wakeTime * HOUR_HEIGHT),
                    height: 24 * HOUR_HEIGHT,
                  }}
                >
                  {children}
                </div>
              </div>

              {/* 現在時刻線（折りたたみ時） */}
              {shouldShowCurrentTimeLine && displayDates && displayDates.length > 0 ? (
                <>
                  <div
                    className={cn(
                      'pointer-events-none absolute z-40 h-px',
                      !currentTimeLineColor && 'bg-primary/50',
                    )}
                    style={{
                      top: `${collapsedCurrentTimePosition}px`,
                      left: 0,
                      right: 0,
                      ...(currentTimeLineColor && {
                        backgroundColor: currentTimeLineColor,
                        opacity: 0.5,
                      }),
                    }}
                  />
                  {hasToday && todayColumnPosition ? (
                    <>
                      <div
                        className={cn(
                          'pointer-events-none absolute z-40 h-0.5 shadow-sm',
                          !currentTimeLineColor && 'bg-primary',
                        )}
                        style={{
                          top: `${collapsedCurrentTimePosition}px`,
                          left: todayColumnPosition.left,
                          width: todayColumnPosition.width,
                          ...(currentTimeLineColor && { backgroundColor: currentTimeLineColor }),
                        }}
                      />
                      {/* ドット - dayビュー以外で表示 */}
                      {viewMode !== 'day' && (
                        <div
                          className={cn(
                            'border-background pointer-events-none absolute z-40 h-2 w-2 rounded-full border shadow-md',
                            !currentTimeLineColor && 'bg-primary',
                          )}
                          style={{
                            top: `${collapsedCurrentTimePosition - 4}px`,
                            left:
                              todayColumnPosition.left === 0 ? '-4px' : todayColumnPosition.left,
                            ...(currentTimeLineColor && { backgroundColor: currentTimeLineColor }),
                          }}
                        />
                      )}
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            // 通常時のレイアウト
            <>
              {/* 睡眠時間帯の背景オーバーレイ */}
              {sleepHours ? (
                <>
                  {/* 上部の睡眠時間帯（0:00〜起床時間） */}
                  {sleepHours.morningRange ? (
                    <div
                      className="bg-chronotype-sleep pointer-events-none absolute inset-x-0 z-[5]"
                      style={{
                        top: 0,
                        height: `${sleepHours.morningRange.endHour * HOUR_HEIGHT}px`,
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                  {/* 下部の睡眠時間帯（就寝時間〜24:00） */}
                  {sleepHours.eveningRange ? (
                    <div
                      className="bg-chronotype-sleep pointer-events-none absolute inset-x-0 z-[5]"
                      style={{
                        top: `${sleepHours.eveningRange.startHour * HOUR_HEIGHT}px`,
                        height: `${(24 - sleepHours.eveningRange.startHour) * HOUR_HEIGHT}px`,
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              ) : null}

              {/* メインコンテンツ（flex で横並びを維持） */}
              <div className="relative flex h-full">{children}</div>

              {/* 現在時刻線 - 全ての列に表示 */}
              {shouldShowCurrentTimeLine && displayDates && displayDates.length > 0 ? (
                <>
                  {/* 全列に薄い線を表示 */}
                  <div
                    className={cn(
                      'pointer-events-none absolute z-40 h-px',
                      !currentTimeLineColor && 'bg-primary/50',
                    )}
                    style={{
                      top: `${currentTimePosition}px`,
                      left: 0,
                      right: 0,
                      ...(currentTimeLineColor && {
                        backgroundColor: currentTimeLineColor,
                        opacity: 0.5,
                      }),
                    }}
                  />

                  {/* 今日の列のみ濃い線を上書き */}
                  {hasToday && todayColumnPosition ? (
                    <>
                      {/* 横線 - 今日の列のみ濃く */}
                      <div
                        className={cn(
                          'pointer-events-none absolute z-40 h-0.5 shadow-sm',
                          !currentTimeLineColor && 'bg-primary',
                        )}
                        style={{
                          top: `${currentTimePosition}px`,
                          left: todayColumnPosition.left,
                          width: todayColumnPosition.width,
                          ...(currentTimeLineColor && { backgroundColor: currentTimeLineColor }),
                        }}
                      />

                      {/* ドット - dayビュー以外で表示 */}
                      {viewMode !== 'day' && (
                        <div
                          className={cn(
                            'border-background pointer-events-none absolute z-40 h-2 w-2 rounded-full border shadow-md',
                            !currentTimeLineColor && 'bg-primary',
                          )}
                          style={{
                            top: `${currentTimePosition - 4}px`,
                            left:
                              todayColumnPosition.left === 0 ? '-4px' : todayColumnPosition.left,
                            ...(currentTimeLineColor && { backgroundColor: currentTimeLineColor }),
                          }}
                        />
                      )}
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
