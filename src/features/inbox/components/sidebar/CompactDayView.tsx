'use client';

import { addDays, format, isToday, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Moon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MiniCalendar } from '@/components/common/MiniCalendar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSleepHours } from '@/features/calendar/hooks/useSleepHours';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

// コンパクト版の定数（カレンダーDayViewに近い設定）
const COMPACT_HOUR_HEIGHT = 64; // 1時間あたりの高さ
const COMPACT_TIME_COLUMN_WIDTH = 40; // 時間ラベル列の幅
const COMPACT_MIN_EVENT_HEIGHT = 20;
const COMPACT_COLLAPSED_SLEEP_HEIGHT = 32; // 折りたたみ時の睡眠セクション高さ

interface CompactDayViewProps {
  /** 表示する日付 */
  date: Date;
  /** 日付変更ハンドラー */
  onDateChange: (date: Date) => void;
  /** プラン一覧 */
  plans?: CalendarPlan[];
  /** プランクリック時 */
  onPlanClick?: (plan: CalendarPlan) => void;
  /** 空き時間クリック時 */
  onEmptyClick?: (date: Date, time: string) => void;
  /** ドロップ受付時 */
  onDrop?: (planId: string, date: Date, time: string) => void;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * サイドバー用コンパクトDayView
 *
 * Google Calendarのサイドパネルのような、コンパクトな日表示カレンダー。
 * - 日付ヘッダー（今日/前日/翌日ナビゲーション）
 * - 24時間タイムグリッド
 * - 現在時刻インジケーター
 * - プラン表示
 * - ドロップゾーン（Inboxからのドラッグ＆ドロップ）
 */
export const CompactDayView = memo(function CompactDayView({
  date,
  onDateChange,
  plans = [],
  onPlanClick,
  onEmptyClick,
  onDrop,
  className,
}: CompactDayViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [draggingPlanId, setDraggingPlanId] = useState<string | null>(null);

  // Inspector連携
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const isInspectorOpen = usePlanInspectorStore((state) => state.isOpen);

  // 睡眠時間帯
  const sleepHours = useSleepHours();
  const sleepHoursCollapsed = useCalendarSettingsStore((state) => state.sleepHoursCollapsed);
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

  // 睡眠時間帯の折りたたみトグル
  const handleToggleSleepHours = useCallback(() => {
    updateSettings({ sleepHoursCollapsed: !sleepHoursCollapsed });
  }, [updateSettings, sleepHoursCollapsed]);

  // 折りたたみ時のレイアウト計算
  const collapsedLayout = useMemo(() => {
    if (!sleepHours || !sleepHoursCollapsed) {
      return null;
    }

    const { wakeTime, totalHours } = sleepHours;
    const awakeHours = 24 - totalHours;
    const awakeHeight = awakeHours * COMPACT_HOUR_HEIGHT;

    return {
      collapsedHeight: COMPACT_COLLAPSED_SLEEP_HEIGHT,
      awakeHeight,
      awakeStartY: COMPACT_COLLAPSED_SLEEP_HEIGHT,
      totalHeight: COMPACT_COLLAPSED_SLEEP_HEIGHT + awakeHeight,
      wakeTime,
    };
  }, [sleepHours, sleepHoursCollapsed]);

  // グリッド高さ
  const gridHeight = collapsedLayout ? collapsedLayout.totalHeight : 24 * COMPACT_HOUR_HEIGHT;

  const isTodayDate = useMemo(() => isToday(date), [date]);

  // 現在時刻の位置（px）
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours + minutes / 60) * COMPACT_HOUR_HEIGHT;
  }, [currentTime]);

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    if (!isTodayDate) return;

    const updateTime = () => setCurrentTime(new Date());
    updateTime();

    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [isTodayDate]);

  // 初期スクロール位置（今日は現在時刻付近、他の日は8時付近）
  useEffect(() => {
    if (scrollRef.current) {
      let scrollTop: number;
      if (isTodayDate) {
        const currentHour = new Date().getHours();
        scrollTop = Math.max(0, (currentHour - 1) * COMPACT_HOUR_HEIGHT);
      } else {
        scrollTop = Math.max(0, (8 - 1) * COMPACT_HOUR_HEIGHT);
      }
      scrollRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [date, isTodayDate]);

  // ナビゲーション
  const handlePrev = useCallback(() => {
    onDateChange(subDays(date, 1));
  }, [date, onDateChange]);

  const handleNext = useCallback(() => {
    onDateChange(addDays(date, 1));
  }, [date, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  // 時間グリッドクリック
  const handleTimeClick = useCallback(
    (hour: number) => {
      const timeString = `${String(hour).padStart(2, '0')}:00`;
      onEmptyClick?.(date, timeString);
    },
    [date, onEmptyClick],
  );

  // ドラッグ＆ドロップ
  const handleDragOver = useCallback((e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    setDragOverHour(hour);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    setDragOverHour(null);
  }, []);

  // プランのドラッグ開始
  const handlePlanDragStart = useCallback((e: React.DragEvent, planId: string) => {
    e.dataTransfer.setData('text/plain', planId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPlanId(planId);
  }, []);

  // プランのドラッグ終了
  const handlePlanDragEnd = useCallback(() => {
    setDraggingPlanId(null);
  }, []);

  const handleDropOnHour = useCallback(
    (e: React.DragEvent, hour: number) => {
      e.preventDefault();
      setIsDragOver(false);
      setDragOverHour(null);

      const planId = e.dataTransfer.getData('text/plain');
      if (planId && onDrop) {
        const timeString = `${String(hour).padStart(2, '0')}:00`;
        onDrop(planId, date, timeString);
      }
    },
    [date, onDrop],
  );

  // 時間ラベル生成
  const timeLabels = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
    }));
  }, []);

  // この日のプランをフィルタリング＆位置計算
  const dayPlans = useMemo(() => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plans
      .filter((plan) => {
        if (!plan.startDate) return false;
        const planDateStr = format(new Date(plan.startDate), 'yyyy-MM-dd');
        return planDateStr === dateStr;
      })
      .map((plan) => {
        const start = new Date(plan.startDate!);
        const end = plan.endDate
          ? new Date(plan.endDate)
          : new Date(start.getTime() + 60 * 60 * 1000);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        const duration = Math.max(endHour - startHour, 0.5);

        // 折りたたみ時の位置計算
        let top: number;
        if (collapsedLayout && sleepHours) {
          // 睡眠時間帯内のプランは非表示（折りたたみセクション内）
          const isInSleepHours =
            startHour < collapsedLayout.wakeTime || startHour >= sleepHours.bedtime;
          if (isInSleepHours) {
            top = -1000; // 画面外に配置（非表示）
          } else {
            // 起きている時間帯のプラン
            top =
              COMPACT_COLLAPSED_SLEEP_HEIGHT +
              (startHour - collapsedLayout.wakeTime) * COMPACT_HOUR_HEIGHT;
          }
        } else {
          top = startHour * COMPACT_HOUR_HEIGHT;
        }

        return {
          plan,
          top,
          height: Math.max(duration * COMPACT_HOUR_HEIGHT, COMPACT_MIN_EVENT_HEIGHT),
        };
      });
  }, [plans, date, collapsedLayout, sleepHours]);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* ヘッダー: 日付 + ナビゲーション */}
      <div className="flex shrink-0 items-center justify-between py-2 pr-1 pl-2">
        <MiniCalendar
          asPopover
          popoverTrigger={
            <button
              type="button"
              className="hover:bg-state-hover flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors"
            >
              <span>{format(date, 'M月d日', locale === 'ja' ? { locale: ja } : {})}</span>
              <span className="text-muted-foreground">
                ({format(date, 'E', locale === 'ja' ? { locale: ja } : {})})
              </span>
              <ChevronDown className="text-muted-foreground size-3" />
            </button>
          }
          selectedDate={date}
          onDateSelect={(newDate) => newDate && onDateChange(newDate)}
          popoverAlign="start"
        />

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleToday}>
            {t('time.today')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="h-10 w-10 sm:h-6 sm:w-6"
            aria-label="前日"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-10 w-10 sm:h-6 sm:w-6"
            aria-label="翌日"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* タイムグリッド */}
      <ScrollArea className="min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="relative w-full"
          style={{ height: gridHeight }}
          onDragLeave={handleDragLeave}
        >
          {/* 時間列 + グリッド */}
          <div className="flex w-full">
            {/* 時間ラベル列 */}
            <div
              className="border-border sticky left-0 z-10 shrink-0 border-r bg-inherit"
              style={{ width: COMPACT_TIME_COLUMN_WIDTH }}
            >
              {collapsedLayout && sleepHours ? (
                // 折りたたみ時の時間列
                <>
                  {/* 折りたたみセクション（睡眠時間） */}
                  <div
                    className="bg-accent/10 flex items-center justify-center"
                    style={{ height: COMPACT_COLLAPSED_SLEEP_HEIGHT }}
                  >
                    <Moon className="text-muted-foreground size-3" />
                  </div>
                  {/* 起きている時間帯 */}
                  <div className="relative" style={{ height: collapsedLayout.awakeHeight }}>
                    {/* 展開ボタン（最上部） */}
                    <button
                      type="button"
                      onClick={handleToggleSleepHours}
                      className="hover:bg-state-hover absolute -top-1 right-0 z-20 flex size-6 items-center justify-center rounded transition-colors"
                      aria-label="睡眠時間帯を展開"
                    >
                      <ChevronUp className="text-muted-foreground size-4" />
                    </button>
                    {timeLabels
                      .filter(
                        ({ hour }) => hour >= collapsedLayout.wakeTime && hour < sleepHours.bedtime,
                      )
                      .map(({ hour, label }) => (
                        <div
                          key={hour}
                          className="text-muted-foreground relative text-right text-[10px]"
                          style={{ height: COMPACT_HOUR_HEIGHT }}
                        >
                          <span className="absolute -top-2 right-1">{label}</span>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                // 通常時の時間列
                <div className="relative h-full">
                  {timeLabels.map(({ hour, label }) => (
                    <div
                      key={hour}
                      className="text-muted-foreground relative text-right text-[10px]"
                      style={{ height: COMPACT_HOUR_HEIGHT }}
                    >
                      <span className="absolute -top-2 right-1">{hour > 0 ? label : ''}</span>
                    </div>
                  ))}
                  {/* 折りたたみボタン（起床時間の位置） */}
                  {sleepHours && (
                    <button
                      type="button"
                      onClick={handleToggleSleepHours}
                      className="hover:bg-state-hover absolute right-0 z-20 flex size-6 items-center justify-center rounded transition-colors"
                      style={{ top: sleepHours.wakeTime * COMPACT_HOUR_HEIGHT - 28 }}
                      aria-label="睡眠時間帯を折りたたむ"
                    >
                      <ChevronDown className="text-muted-foreground size-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* グリッド領域 */}
            <div className="relative flex-1">
              {collapsedLayout && sleepHours ? (
                // 折りたたみ時のグリッド
                <>
                  {/* 折りたたみセクション */}
                  <div
                    className="bg-accent/10 border-border flex w-full items-center justify-center border-b"
                    style={{ height: COMPACT_COLLAPSED_SLEEP_HEIGHT }}
                  >
                    <span className="text-muted-foreground text-[10px]">
                      {sleepHours.bedtime}:00 - {sleepHours.wakeTime}:00
                    </span>
                  </div>
                  {/* 起きている時間帯のグリッド線 */}
                  {timeLabels
                    .filter(
                      ({ hour }) => hour >= collapsedLayout.wakeTime && hour < sleepHours.bedtime,
                    )
                    .map(({ hour }) => (
                      <div
                        key={hour}
                        className={cn(
                          'border-border border-b transition-colors',
                          isDragOver && dragOverHour === hour && 'bg-primary-state-hover',
                        )}
                        style={{ height: COMPACT_HOUR_HEIGHT }}
                        onClick={() => handleTimeClick(hour)}
                        onDragOver={(e) => handleDragOver(e, hour)}
                        onDrop={(e) => handleDropOnHour(e, hour)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleTimeClick(hour);
                          }
                        }}
                      />
                    ))}
                </>
              ) : (
                // 通常時のグリッド
                <>
                  {/* 睡眠時間帯の背景オーバーレイ */}
                  {sleepHours && (
                    <>
                      {/* 上部の睡眠時間帯（0:00〜起床時間） */}
                      {sleepHours.morningRange && (
                        <div
                          className="bg-accent/20 pointer-events-none absolute inset-x-0 z-[1]"
                          style={{
                            top: 0,
                            height: sleepHours.morningRange.endHour * COMPACT_HOUR_HEIGHT,
                          }}
                          aria-hidden="true"
                        />
                      )}
                      {/* 下部の睡眠時間帯（就寝時間〜24:00） */}
                      {sleepHours.eveningRange && (
                        <div
                          className="bg-accent/20 pointer-events-none absolute inset-x-0 z-[1]"
                          style={{
                            top: sleepHours.eveningRange.startHour * COMPACT_HOUR_HEIGHT,
                            height: (24 - sleepHours.eveningRange.startHour) * COMPACT_HOUR_HEIGHT,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}

                  {/* 時間グリッド線 */}
                  {timeLabels.map(({ hour }) => (
                    <div
                      key={hour}
                      className={cn(
                        'border-border border-b transition-colors',
                        isDragOver && dragOverHour === hour && 'bg-primary-state-hover',
                      )}
                      style={{ height: COMPACT_HOUR_HEIGHT }}
                      onClick={() => handleTimeClick(hour)}
                      onDragOver={(e) => handleDragOver(e, hour)}
                      onDrop={(e) => handleDropOnHour(e, hour)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleTimeClick(hour);
                        }
                      }}
                    />
                  ))}
                </>
              )}

              {/* 現在時刻線 */}
              {isTodayDate && !collapsedLayout && (
                <>
                  <div
                    className="bg-primary pointer-events-none absolute right-0 left-0 z-20 h-[2px]"
                    style={{ top: currentTimePosition }}
                  />
                  <div
                    className="bg-primary pointer-events-none absolute z-20 h-2 w-2 rounded-full"
                    style={{ top: currentTimePosition - 4, left: -4 }}
                  />
                </>
              )}

              {/* プラン表示 */}
              {dayPlans.map(({ plan, top, height }) => {
                const isActive = isInspectorOpen && inspectorPlanId === plan.id;
                const planColor = plan.tags?.[0]?.color || plan.color;

                return (
                  <div
                    key={plan.id}
                    draggable={!!onDrop}
                    onDragStart={(e) => handlePlanDragStart(e, plan.id)}
                    onDragEnd={handlePlanDragEnd}
                    className={cn(
                      'absolute right-1 left-1 overflow-hidden rounded px-1 text-left text-[10px] leading-tight',
                      'border-l-2 transition-colors',
                      'focus:ring-ring focus:ring-1 focus:outline-none',
                      onDrop && 'cursor-grab active:cursor-grabbing',
                      draggingPlanId === plan.id && 'opacity-50',
                      isActive && 'ring-primary ring-2',
                      !planColor &&
                        'bg-primary-container hover:bg-primary-state-hover border-primary',
                    )}
                    style={{
                      top,
                      height,
                      minHeight: COMPACT_MIN_EVENT_HEIGHT,
                      ...(planColor && {
                        backgroundColor: `${planColor}20`,
                        borderLeftColor: planColor,
                      }),
                    }}
                    onClick={() => onPlanClick?.(plan)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onPlanClick?.(plan);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={plan.title}
                  >
                    <span className="line-clamp-2 font-medium">{plan.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
});
