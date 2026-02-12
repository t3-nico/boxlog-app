'use client';

import React, { useCallback, useState } from 'react';

import type { DragEndEvent, DragMoveEvent, DragStartEvent, Over } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { fromZonedTime } from 'date-fns-tz';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useplans } from '@/features/plans/hooks/usePlans';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface DnDProviderProps {
  children: React.ReactNode;
}

/**
 * DnDProvider - dnd-kit を使用したドラッグ・アンド・ドロップコンテキスト
 *
 * **変更履歴**:
 * - react-dnd から @dnd-kit/core に移行（planKanbanBoardとの統一のため）
 * - onDragEnd ハンドラーを追加（Calendarへのドロップ対応）
 *
 * **機能**:
 * - planCard（Sidebar）からCalendar グリッドへのドラッグが可能
 * - PointerSensor: 8px移動したらドラッグ開始（誤動作防止）
 * - ドロップ位置から日付・時刻を計算してplan更新
 *
 * **エッジケース対応**:
 * - 時間なしプラン → due_date のみ更新
 * - 時間指定プラン → due_date + start_time + end_time を更新
 * - 無効なドロップ先 → エラーメッセージ表示
 * - 重複プラン → 既存の時間幅を保持
 */
export const DnDProvider = ({ children }: DnDProviderProps) => {
  const t = useTranslations();
  const { updatePlan } = usePlanMutations();
  const { timezone } = useCalendarSettingsStore();
  const { formatDate: formatDateWithSettings } = useDateFormat();
  const { tap, success } = useHapticFeedback();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragPreviewTime, setDragPreviewTime] = useState<{ date: string; time?: string } | null>(
    null,
  );

  // ドラッグ中のplan情報を取得（リアルタイム性最適化済み）
  const { data: plans } = useplans();
  const activeplan = plans?.find((t) => t.id === activeId);

  // ドラッグセンサー設定
  const sensors = useSensors(
    // マウス操作: 8px移動でドラッグ開始（誤操作防止）
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    // タッチ操作: 250msロングプレスでドラッグ開始（スクロールとの区別）
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  /**
   * ドラッグ開始時の処理
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
      setDragPreviewTime(null); // リセット
      // ドラッグ開始時の軽いHaptic Feedback
      tap();
    },
    [tap],
  );

  /**
   * ドラッグ移動中の処理（時間表示をリアルタイム更新）
   */
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { over } = event;

    if (!over) {
      setDragPreviewTime(null);
      return;
    }

    // ドロップ先のデータを取得
    const dropData = over.data?.current;
    if (!dropData || !dropData.date) {
      setDragPreviewTime(null);
      return;
    }

    // 日付を文字列に変換
    let dateStr: string;
    if (dropData.date instanceof Date) {
      const year = dropData.date.getFullYear();
      const month = String(dropData.date.getMonth() + 1).padStart(2, '0');
      const day = String(dropData.date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    } else {
      dateStr = dropData.date;
    }

    // プレビュー時間を更新
    setDragPreviewTime({
      date: dateStr,
      time: dropData.time, // 'HH:mm' または undefined
    });
  }, []);

  /**
   * planドロップの共通処理
   */
  const handleplanDrop = useCallback(
    (planId: string, over: Over) => {
      // ドロップ先のデータ
      const dropData = over.data?.current;
      if (!dropData || !dropData.date) {
        toast.error(t('calendar.toast.dropInvalid'));
        setActiveId(null);
        return;
      }

      try {
        // 1. 日付を取得（Date型 または YYYY-MM-DD文字列）
        let due_date: string;
        if (dropData.date instanceof Date) {
          // Date型の場合、ローカルタイムゾーンで年月日を取得
          const year = dropData.date.getFullYear();
          const month = String(dropData.date.getMonth() + 1).padStart(2, '0');
          const day = String(dropData.date.getDate()).padStart(2, '0');
          due_date = `${year}-${month}-${day}`;
        } else if (typeof dropData.date === 'string') {
          // 文字列の場合、そのまま使用
          due_date = dropData.date;
        } else {
          throw new Error(t('errors.calendar.invalidDateFormat'));
        }

        // 3. 時刻を取得
        let start_time: string | null = null;
        let end_time: string | null = null;

        if (dropData.time) {
          // 時間指定あり（例: "14:30"）
          const timeMatch = dropData.time.match(/^(\d{1,2}):(\d{2})$/);
          if (!timeMatch) {
            throw new Error(t('errors.calendar.invalidTimeFormat'));
          }

          const [, hourStr, minuteStr] = timeMatch;
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          // 時刻の妥当性チェック
          if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error(t('errors.calendar.timeOutOfRange'));
          }

          // ユーザーのタイムゾーンでDateオブジェクトを作成
          const [year, month, day] = due_date.split('-').map(Number);
          // ユーザーのタイムゾーンの時刻として作成
          const zonedStart = new Date(year!, month! - 1, day!, hour, minute, 0);
          const zonedEnd = new Date(year!, month! - 1, day!, hour + 1, minute, 0);

          // ユーザーのタイムゾーンの時刻をUTCに変換
          const startDate = fromZonedTime(zonedStart, timezone);
          const endDate = fromZonedTime(zonedEnd, timezone);

          // ISO 8601形式（UTC）に変換
          start_time = startDate.toISOString();
          end_time = endDate.toISOString();
        } else {
          // 時間指定なし
          start_time = null;
          end_time = null;
        }

        // 4. plan更新
        // 注意: optional()フィールドでは undefined = 更新しない、null = NULL値に更新
        const updateData: {
          due_date: string;
          start_time: string | null;
          end_time: string | null;
        } = {
          due_date,
          start_time,
          end_time,
        };

        updatePlan.mutate({
          id: planId,
          data: updateData,
        });
        // カレンダーへのドロップ成功時のHaptic Feedback
        success();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('calendar.toast.dropFailed'));
      } finally {
        // ドラッグ終了時にactiveIdをクリア
        setActiveId(null);
        setDragPreviewTime(null);
      }
    },
    [updatePlan, timezone, t, success],
  );

  /**
   * ドラッグ終了時の処理
   *
   * **ドロップ先データ形式**:
   * - over.data.current.date: Date | string (YYYY-MM-DD)
   * - over.data.current.time: string (HH:mm) | undefined
   *
   * **対応するドラッグタイプ**:
   * - planカード（Sidebar等）
   * - カレンダープラン（calendar-event）
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // ドロップ先がない場合は何もしない
      if (!over) {
        setActiveId(null);
        return;
      }

      // ドラッグ元のデータを取得
      const dragData = active.data?.current;
      const dragType = dragData?.type;

      // ドラッグするプランのIDを取得
      let currentPlanId: string;

      // カレンダープランの場合
      if (dragType === 'calendar-event') {
        const calendarEvent = dragData?.event;
        if (!calendarEvent?.id) {
          setActiveId(null);
          return;
        }
        // planとして扱う（CalendarPlanはplanベース）
        currentPlanId = calendarEvent.id;
      } else {
        // 通常のplanカードの場合
        currentPlanId = active.id as string;
      }

      // 共通処理を実行
      handleplanDrop(currentPlanId, over);
    },
    [handleplanDrop],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {children}

      {/* ドラッグ中のプレビュー */}
      <DragOverlay>
        {activeplan ? (
          <div className="bg-card border-primary flex h-20 w-64 flex-col gap-1 rounded-2xl border-2 p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-8 w-1 rounded-full" />
              <div className="text-foreground flex-1 text-sm font-bold">{activeplan.title}</div>
            </div>
            <div className="text-muted-foreground ml-4 space-y-1 text-xs">
              {/* ドラッグ中の時間をリアルタイム表示 */}
              {dragPreviewTime ? (
                <>
                  <div>
                    📅 {formatDateWithSettings(new Date(dragPreviewTime.date + 'T00:00:00'))}
                  </div>
                  {dragPreviewTime.time && (
                    <div>
                      🕐 {dragPreviewTime.time} -{' '}
                      {(() => {
                        // 終了時間を計算（開始時刻 + 1時間）
                        const [hour, minute] = dragPreviewTime.time.split(':').map(Number);
                        const endHour = String(hour! + 1).padStart(2, '0');
                        const endMinute = String(minute!).padStart(2, '0');
                        return `${endHour}:${endMinute}`;
                      })()}
                    </div>
                  )}
                </>
              ) : (
                // ドロップ先がない場合は元の日付を表示
                activeplan.due_date && (
                  <div>
                    📅 {formatDateWithSettings(new Date(activeplan.due_date + 'T00:00:00'))}
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
