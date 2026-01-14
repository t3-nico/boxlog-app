/**
 * 統一されたスクロール可能カレンダーレイアウト
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Moon } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useSleepHours } from '@/features/calendar/hooks/useSleepHours';
import { useCalendarScrollStore } from '@/features/calendar/stores';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';
import {
  CHRONOTYPE_PRESETS,
  getChronotypeColor,
  getProductivityZoneForHour,
} from '@/types/chronotype';

import { TimeColumn } from '../grid/TimeColumn/TimeColumn';

import { useResponsiveHourHeight } from '../hooks/useResponsiveHourHeight';

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
  viewMode?: 'day' | '3day' | '5day' | 'week' | 'agenda' | undefined;
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

const TIME_COLUMN_WIDTH = 64;

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
              <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-xs font-medium md:hidden">
                {weekNumber}
              </span>
            ) : null}
            {/* タイムゾーン表示（PC: 常に表示、モバイル: 週番号がない場合のみ） */}
            {showTimezone && timezone ? (
              <TimezoneOffset
                timezone={timezone}
                className={cn('text-xs', shouldShowWeekNumber && 'hidden md:flex')}
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
  // ScrollableCalendarLayout がレンダリングされました

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [_isScrolling, setIsScrolling] = useState(false);
  const [_containerWidth, setContainerWidth] = useState(800);
  const hasRestoredScroll = useRef(false);

  // スクロール位置ストア
  const { setScrollPosition, getScrollPosition, setLastActiveView } = useCalendarScrollStore();

  // クロノタイプ設定
  const chronotype = useCalendarSettingsStore((state) => state.chronotype);

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

  // 睡眠時間帯の折りたたみトグル（スクロール位置を維持）
  const handleToggleSleepHours = useCallback(() => {
    if (!sleepHours || !scrollContainerRef.current) {
      updateSettings({ sleepHoursCollapsed: !sleepHoursCollapsed });
      return;
    }

    const { wakeTime } = sleepHours;
    const currentScrollTop = scrollContainerRef.current.scrollTop;

    // 現在見ている時間を計算
    let currentHour: number;
    if (sleepHoursCollapsed) {
      // 折りたたみ → 展開: 折りたたみセクション後の位置から時間を計算
      if (currentScrollTop <= COLLAPSED_SECTION_HEIGHT) {
        currentHour = wakeTime; // 睡眠セクション内なら起床時間
      } else {
        currentHour = wakeTime + (currentScrollTop - COLLAPSED_SECTION_HEIGHT) / HOUR_HEIGHT;
      }
    } else {
      // 展開 → 折りたたみ: 通常の位置から時間を計算
      currentHour = currentScrollTop / HOUR_HEIGHT;
    }

    // 状態を更新
    updateSettings({ sleepHoursCollapsed: !sleepHoursCollapsed });

    // 次のレンダリング後にスクロール位置を調整
    setTimeout(() => {
      if (!scrollContainerRef.current) return;

      let newScrollTop: number;
      if (!sleepHoursCollapsed) {
        // 展開 → 折りたたみ: 起きている時間帯に変換
        if (currentHour < wakeTime) {
          // 睡眠時間帯（朝）→ 折りたたみセクションへ
          newScrollTop = 0;
        } else if (currentHour >= sleepHours.bedtime) {
          // 睡眠時間帯（夜）→ 折りたたみセクションへ
          newScrollTop = 0;
        } else {
          // 起きている時間帯
          newScrollTop = COLLAPSED_SECTION_HEIGHT + (currentHour - wakeTime) * HOUR_HEIGHT;
        }
      } else {
        // 折りたたみ → 展開: 通常の位置に変換
        newScrollTop = currentHour * HOUR_HEIGHT;
      }

      scrollContainerRef.current.scrollTo({
        top: Math.max(0, newScrollTop),
        behavior: 'instant',
      });
    }, 0);
  }, [updateSettings, sleepHoursCollapsed, sleepHours, HOUR_HEIGHT]);

  // 折りたたみ時のグリッドレイアウト計算
  const collapsedLayout = useMemo(() => {
    if (!sleepHours || !sleepHoursCollapsed) {
      return null;
    }

    const { wakeTime, bedtime, totalHours } = sleepHours;

    // 起きている時間（時間数）= 24時間 - 睡眠時間
    const awakeHours = 24 - totalHours;

    // 折りたたみセクションは上部に1つだけ（睡眠時間帯全体を表示）
    const collapsedHeight = COLLAPSED_SECTION_HEIGHT;
    const awakeHeight = awakeHours * HOUR_HEIGHT;

    // 起きている時間帯の開始位置（Y座標）= 折りたたみセクションの直後
    const awakeStartY = collapsedHeight;

    return {
      collapsedHeight,
      awakeHeight,
      awakeStartY,
      totalHeight: collapsedHeight + awakeHeight,
      // 時間→Y座標変換用
      wakeTime,
      bedtime,
    };
  }, [sleepHours, sleepHoursCollapsed, HOUR_HEIGHT]);

  // グリッド高さ
  const gridHeight = collapsedLayout ? collapsedLayout.totalHeight : 24 * HOUR_HEIGHT;

  // 睡眠時間帯内のプラン数を日ごとに計算
  const sleepHoursPlanCountByDate = useMemo(() => {
    if (!sleepHours || !plans || plans.length === 0 || !displayDates || displayDates.length === 0) {
      return [];
    }

    const { wakeTime, bedtime } = sleepHours;
    // 日跨ぎの場合（bedtime >= wakeTime、例: 23:00-07:00）
    const isCrossingMidnight = bedtime >= wakeTime;

    // プランが睡眠時間帯内かどうかをチェック
    const isInSleepHours = (plan: CalendarPlan): boolean => {
      if (!plan.startDate) return false;
      const startHour = new Date(plan.startDate).getHours();

      if (isCrossingMidnight) {
        // 日跨ぎ: 23:00以降 または 7:00未満
        return startHour >= bedtime || startHour < wakeTime;
      } else {
        // 同日: 1:00以上 かつ 9:00未満
        return startHour >= bedtime && startHour < wakeTime;
      }
    };

    // 日ごとにカウント
    return displayDates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return plans.filter((plan) => {
        if (!plan.startDate) return false;
        const planDateStr = format(new Date(plan.startDate), 'yyyy-MM-dd');
        return planDateStr === dateStr && isInSleepHours(plan);
      }).length;
    });
  }, [sleepHours, plans, displayDates]);

  // 今日の列の位置を計算
  const todayColumnPosition = useMemo(() => {
    if (!displayDates || displayDates.length === 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日のインデックスを見つける
    const todayIndex = displayDates.findIndex((date) => {
      if (!date) return false;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayIndex === -1) {
      return null;
    }

    // 単一日表示の場合
    if (displayDates.length === 1) {
      return {
        left: 0,
        width: '100%',
      };
    }

    // 複数日表示の場合、列の幅と位置を計算
    const columnWidth = 100 / displayDates.length; // パーセント
    const leftPosition = todayIndex * columnWidth; // パーセント

    return {
      left: `${leftPosition}%`,
      width: `${columnWidth}%`,
    };
  }, [displayDates]);

  // 現在時刻線を表示するか判定（showCurrentTimeがtrueなら常に表示）
  const shouldShowCurrentTimeLine = showCurrentTime;

  // 今日が表示範囲に含まれるか
  const hasToday = todayColumnPosition !== null;

  // 現在時刻の位置を計算
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalHours = hours + minutes / 60;
    return totalHours * HOUR_HEIGHT;
  }, [currentTime, HOUR_HEIGHT]);

  // 現在時刻のクロノタイプゾーン色を取得（セマンティックトークン）
  const currentTimeLineColor = useMemo(() => {
    if (!chronotype.enabled) {
      return null; // クロノタイプ無効時はデフォルト色（bg-primary）
    }

    const profile =
      chronotype.type === 'custom' && chronotype.customZones
        ? { ...CHRONOTYPE_PRESETS.custom, productivityZones: chronotype.customZones }
        : CHRONOTYPE_PRESETS[chronotype.type];

    const currentHour = currentTime.getHours();
    const zone = getProductivityZoneForHour(profile, currentHour);

    if (!zone) {
      return null;
    }

    // levelベースでクロノタイプ専用色（CSS変数）を取得
    return getChronotypeColor(zone.level);
  }, [chronotype.enabled, chronotype.type, chronotype.customZones, currentTime]);

  // ScrollableCalendarLayoutの初期化完了

  // アクティブビューの更新
  useEffect(() => {
    if (viewMode !== 'agenda') {
      setLastActiveView(viewMode as 'day' | '3day' | '5day' | 'week');
    }
  }, [viewMode, setLastActiveView]);

  // 初期スクロール位置の設定（保存された位置を優先、なければ現在時刻を中央に）
  useEffect(() => {
    if (!scrollContainerRef.current || hasRestoredScroll.current) return;

    // viewModeが有効なタイプの場合のみ処理
    if (viewMode === 'agenda') return;

    const savedPosition = getScrollPosition(viewMode as 'day' | '3day' | '5day' | 'week');

    let targetScroll: number;
    if (savedPosition > 0) {
      // 保存された位置がある場合は復元
      targetScroll = savedPosition;
    } else {
      // 保存がない場合は現在時刻を画面中央に
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const currentPosition = currentHour * HOUR_HEIGHT;
      const containerHeight = scrollContainerRef.current.clientHeight;
      // 現在時刻が画面中央に来るように調整
      targetScroll = Math.max(0, currentPosition - containerHeight / 2);
    }

    hasRestoredScroll.current = true;

    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: targetScroll,
        behavior: savedPosition > 0 ? 'instant' : 'smooth',
      });
    }, 50);
  }, [viewMode, getScrollPosition, HOUR_HEIGHT]);

  // viewMode変更時にhasRestoredScrollをリセット
  useEffect(() => {
    hasRestoredScroll.current = false;
  }, [viewMode]);

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
  }, []);

  // スクロールイベントの処理
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop } = scrollContainerRef.current;
    setIsScrolling(true);

    if (onScrollPositionChange) {
      onScrollPositionChange(scrollTop);
    }

    // スクロール位置をストアに保存（agendaビュー以外）
    if (viewMode !== 'agenda') {
      setScrollPosition(viewMode as 'day' | '3day' | '5day' | 'week', scrollTop);
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onScrollPositionChange, viewMode, setScrollPosition]);

  // スクロールリスナーの設定
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // キーボードナビゲーション（グローバルキーボードイベントも監視）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      // キーボードイベント処理開始

      if (!enableKeyboardNavigation || !scrollContainerRef.current) {
        // キーボード処理をスキップ
        return;
      }

      const container = scrollContainerRef.current;
      const currentScroll = container.scrollTop;

      // スクロール実行

      switch (e.key) {
        case 'PageUp':
          e.preventDefault();
          const newScrollUp = Math.max(0, currentScroll - container.clientHeight);
          container.scrollTop = newScrollUp;
          // PageUp スクロール実行
          break;
        case 'PageDown':
          e.preventDefault();
          const newScrollDown = currentScroll + container.clientHeight;
          container.scrollTop = newScrollDown;
          // PageDown スクロール実行
          break;
        case 'Home':
          if (e.ctrlKey) {
            e.preventDefault();
            container.scrollTop = 0;
            // Ctrl+Home スクロール実行
          }
          break;
        case 'End':
          if (e.ctrlKey) {
            e.preventDefault();
            const newScrollEnd = container.scrollHeight;
            container.scrollTop = newScrollEnd;
            // Ctrl+End スクロール実行
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey) {
            e.preventDefault();
            const newScrollArrowUp = Math.max(0, currentScroll - HOUR_HEIGHT);
            container.scrollTop = newScrollArrowUp;
            // Ctrl+ArrowUp スクロール実行
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey) {
            e.preventDefault();
            const newScrollArrowDown = currentScroll + HOUR_HEIGHT;
            container.scrollTop = newScrollArrowDown;
            // Ctrl+ArrowDown スクロール実行
          }
          break;
      }
    },
    [enableKeyboardNavigation, HOUR_HEIGHT],
  );

  // グローバルキーボードイベントのリスナー
  useEffect(() => {
    if (!enableKeyboardNavigation) {
      return;
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [enableKeyboardNavigation, handleKeyDown]);

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    if (!shouldShowCurrentTimeLine) return;

    const updateCurrentTime = () => setCurrentTime(new Date());
    updateCurrentTime(); // 初回実行

    const timer = setInterval(updateCurrentTime, 60000); // 1分ごと

    return () => clearInterval(timer);
  }, [shouldShowCurrentTimeLine]);

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
    [onTimeClick, HOUR_HEIGHT, showTimeColumn, timeColumnWidth],
  );

  // 折りたたみ時の現在時刻線位置を計算
  const collapsedCurrentTimePosition = useMemo(() => {
    if (!collapsedLayout || !sleepHours) return currentTimePosition;

    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const { wakeTime, bedtime, totalHours } = sleepHours;

    // 睡眠時間帯内かどうか判定
    const isCrossingMidnight = bedtime >= wakeTime;
    const isInSleepHours = isCrossingMidnight
      ? currentHour >= bedtime || currentHour < wakeTime
      : currentHour >= bedtime && currentHour < wakeTime;

    if (isInSleepHours) {
      // 睡眠時間帯内の場合、折りたたみセクション内に比例配置
      let hoursIntoSleep: number;
      if (isCrossingMidnight) {
        // 日跨ぎ: bedtime(23)から深夜0時、そして0時からwakeTime(7)まで
        if (currentHour >= bedtime) {
          hoursIntoSleep = currentHour - bedtime + currentMinutes / 60;
        } else {
          hoursIntoSleep = 24 - bedtime + currentHour + currentMinutes / 60;
        }
      } else {
        hoursIntoSleep = currentHour - bedtime + currentMinutes / 60;
      }
      const ratio = hoursIntoSleep / totalHours;
      return ratio * COLLAPSED_SECTION_HEIGHT;
    }

    // 起きている時間帯の場合
    const hoursFromWake = currentHour - wakeTime + currentMinutes / 60;
    return collapsedLayout.awakeStartY + hoursFromWake * HOUR_HEIGHT;
  }, [collapsedLayout, currentTimePosition, currentTime, sleepHours, HOUR_HEIGHT]);

  return (
    <ScrollArea className={cn('relative min-h-0 flex-1', className)} data-calendar-scroll>
      <div
        ref={scrollContainerRef}
        className="relative flex w-full pr-4"
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
                  className="bg-accent-container relative z-10 flex w-full items-center gap-1 pl-2"
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
                        className="hover:bg-state-hover flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors"
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
                        className="hover:bg-state-hover flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors"
                        aria-label="睡眠時間帯を折りたたむ"
                      >
                        <ChevronDown className="text-muted-foreground size-4" />
                      </button>
                    </HoverTooltip>
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
                      <div
                        className={cn(
                          'border-background pointer-events-none absolute z-40 h-2 w-2 rounded-full border shadow-md',
                          !currentTimeLineColor && 'bg-primary',
                        )}
                        style={{
                          top: `${collapsedCurrentTimePosition - 4}px`,
                          left: todayColumnPosition.left === 0 ? '-4px' : todayColumnPosition.left,
                          ...(currentTimeLineColor && { backgroundColor: currentTimeLineColor }),
                        }}
                      />
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
                      className="bg-accent-state-selected pointer-events-none absolute inset-x-0 z-[5]"
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
                      className="bg-accent-state-selected pointer-events-none absolute inset-x-0 z-[5]"
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

                      {/* 点 - 今日の列の左端 */}
                      <div
                        className={cn(
                          'border-background pointer-events-none absolute z-40 h-2 w-2 rounded-full border shadow-md',
                          !currentTimeLineColor && 'bg-primary',
                        )}
                        style={{
                          top: `${currentTimePosition - 4}px`,
                          left: todayColumnPosition.left === 0 ? '-4px' : todayColumnPosition.left,
                          ...(currentTimeLineColor && { backgroundColor: currentTimeLineColor }),
                        }}
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
