'use client';

import { useCallback } from 'react';

import { format } from 'date-fns';

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { logger } from '@/lib/logger';

import type { CalendarPlan, CalendarViewType } from '../../../types/calendar.types';

interface UseCalendarHandlersOptions {
  viewType: CalendarViewType;
  currentDate: Date;
}

export function useCalendarHandlers({ viewType, currentDate }: UseCalendarHandlersOptions) {
  const openInspector = usePlanInspectorStore((state) => state.openInspector);
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const inspectorIsOpen = usePlanInspectorStore((state) => state.isOpen);
  const { createPlan } = usePlanMutations();

  // Inspector で開いているプランIDをDnD無効化用に計算
  // Inspector が開いている場合のみ planId を返す
  const disabledPlanId = inspectorIsOpen ? inspectorPlanId : null;

  // プラン関連のハンドラー
  const handlePlanClick = useCallback(
    (plan: CalendarPlan) => {
      // プランIDでplan Inspectorを開く
      openInspector(plan.id);
      logger.log('📋 Opening plan Inspector:', { planId: plan.id, title: plan.title });
    },
    [openInspector],
  );

  const handleCreatePlan = useCallback(
    (date?: Date, time?: string) => {
      logger.log('➕ Create plan requested:', {
        date: date?.toISOString(),
        dateString: date?.toDateString(),
        time,
        currentDate: currentDate.toISOString(),
        viewType,
      });

      // 時刻の解析
      let startTime: Date | undefined;
      let endTime: Date | undefined;

      if (date) {
        if (time) {
          if (time.includes('-')) {
            const [start, end] = time.split('-');
            const [startHour, startMin] = start?.split(':').map(Number) ?? [9, 0];
            const [endHour, endMin] = end?.split(':').map(Number) ?? [10, 0];

            startTime = new Date(date);
            startTime.setHours(startHour ?? 9, startMin ?? 0, 0, 0);

            endTime = new Date(date);
            endTime.setHours(endHour ?? 10, endMin ?? 0, 0, 0);
          } else {
            const [hour, min] = time.split(':').map(Number);
            startTime = new Date(date);
            startTime.setHours(hour ?? 9, min ?? 0, 0, 0);

            endTime = new Date(date);
            endTime.setHours((hour ?? 9) + 1, min ?? 0, 0, 0); // デフォルト1時間
          }
        } else {
          startTime = new Date(date);
          startTime.setHours(9, 0, 0, 0); // デフォルト9:00

          endTime = new Date(date);
          endTime.setHours(10, 0, 0, 0); // デフォルト10:00
        }
      }

      // プランを作成してInspectorで編集
      if (startTime && endTime && date) {
        createPlan.mutate(
          {
            title: '新規プラン',
            status: 'todo',
            due_date: format(date, 'yyyy-MM-dd'),
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          },
          {
            onSuccess: (newPlan) => {
              openInspector(newPlan.id);
              logger.log('✅ Created plan:', {
                planId: newPlan.id,
                title: newPlan.title,
                dueDate: newPlan.due_date,
              });
            },
          },
        );
      }
    },
    [viewType, currentDate, createPlan, openInspector],
  );

  // 空き時間クリック用のハンドラー（ダブルクリックで使用）
  const handleEmptyClick = useCallback(
    (date: Date, time: string) => {
      logger.log('🖱️ Empty time clicked:', { date, time });
      handleCreatePlan(date, time);
    },
    [handleCreatePlan],
  );

  // 統一された時間範囲選択ハンドラー（全ビュー共通、ドラッグまたはダブルクリックで呼ばれる）
  const handleDateTimeRangeSelect = useCallback(
    (selection: {
      date: Date;
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
    }) => {
      // 指定された日付に時間を設定
      const startTime = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.startHour,
        selection.startMinute,
      );
      const endTime = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.endHour,
        selection.endMinute,
      );

      logger.log('📅 Calendar Drag Selection:', {
        date: selection.date.toDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
      });

      // プランを作成してからInspectorで編集
      createPlan.mutate(
        {
          title: '新規プラン',
          status: 'todo',
          due_date: format(selection.date, 'yyyy-MM-dd'),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        },
        {
          onSuccess: (newplan) => {
            // 作成されたプランをInspectorで開く
            openInspector(newplan.id);
            logger.log('✅ Created plan from drag selection:', {
              planId: newplan.id,
              title: newplan.title,
              dueDate: newplan.due_date,
            });
          },
        },
      );
    },
    [createPlan, openInspector],
  );

  return {
    handlePlanClick,
    handleCreatePlan,
    handleEmptyClick,
    handleDateTimeRangeSelect,
    /** DnDを無効化するプランID（Inspector表示中のプラン） */
    disabledPlanId,
  };
}
