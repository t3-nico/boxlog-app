/**
 * 統一されたスクロール可能カレンダーレイアウト
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalendarScrollStore } from '@/features/calendar/stores';
import { cn } from '@/lib/utils';

import { TimeColumn } from '../grid/TimeColumn/TimeColumn';

import { useResponsiveHourHeight } from '../hooks/useResponsiveHourHeight';

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

const TIME_COLUMN_WIDTH = 48;

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
  return (
    <div className="flex h-12 shrink-0 flex-col justify-center py-2">
      <div className="flex items-center px-4">
        {/* 左スペーサー（時間列と揃えるため） */}
        {showTimeColumn ? (
          <div
            className="flex shrink-0 items-center justify-center"
            style={{ width: timeColumnWidth }}
          >
            {/* 週番号バッジ（Googleカレンダースタイル） - 丸いバッジ */}
            {weekNumber != null ? (
              <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-xs font-medium">
                {weekNumber}
              </span>
            ) : null}
            {/* タイムゾーン表示（showTimezone=trueの場合のみ、週番号がない場合） */}
            {showTimezone && timezone && weekNumber == null ? (
              <TimezoneOffset timezone={timezone} className="text-xs" />
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

  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  });

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

  return (
    <ScrollArea className={cn('relative min-h-0 flex-1', className)} data-calendar-scroll>
      <div
        ref={scrollContainerRef}
        className="relative flex w-full px-4"
        style={{ height: `${24 * HOUR_HEIGHT}px` }}
        onClick={handleGridClick}
        onKeyDown={handleKeyDown}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
        role={enableKeyboardNavigation ? 'grid' : undefined}
        aria-label={enableKeyboardNavigation ? `${viewMode} view calendar` : undefined}
      >
        {/* 時間軸列 */}
        {showTimeColumn && (
          <div className="sticky left-0 z-10 shrink-0" style={{ width: timeColumnWidth }}>
            <TimeColumn
              startHour={0}
              endHour={24}
              hourHeight={HOUR_HEIGHT}
              format="24h"
              className="h-full"
            />
          </div>
        )}

        {/* グリッドコンテンツエリア */}
        <div className="relative flex flex-1">
          {/* メインコンテンツ */}
          {children}

          {/* 現在時刻線 - 全ての列に表示 */}
          {shouldShowCurrentTimeLine && displayDates && displayDates.length > 0 ? (
            <>
              {/* 全列に薄い線を表示 */}
              <div
                className={cn('bg-primary/50 pointer-events-none absolute z-40 h-px')}
                style={{
                  top: `${currentTimePosition}px`,
                  left: 0,
                  right: 0,
                }}
              />

              {/* 今日の列のみ濃い線を上書き */}
              {hasToday && todayColumnPosition ? (
                <>
                  {/* 横線 - 今日の列のみ濃く */}
                  <div
                    className={cn('bg-primary pointer-events-none absolute z-40 h-[2px] shadow-sm')}
                    style={{
                      top: `${currentTimePosition}px`,
                      left: todayColumnPosition.left,
                      width: todayColumnPosition.width,
                    }}
                  />

                  {/* 点 - 今日の列の左端 */}
                  <div
                    className={cn(
                      'border-background bg-primary pointer-events-none absolute z-40 h-2 w-2 rounded-full border shadow-md',
                    )}
                    style={{
                      top: `${currentTimePosition - 4}px`,
                      left: todayColumnPosition.left === 0 ? '-4px' : todayColumnPosition.left,
                    }}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </ScrollArea>
  );
};
