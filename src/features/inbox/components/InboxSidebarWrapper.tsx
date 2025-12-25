'use client';

import { useCallback, useMemo } from 'react';

import { planToCalendarPlan } from '@/features/calendar/utils/planDataAdapter';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useplans } from '@/features/plans/hooks/usePlans';
import type { Plan } from '@/features/plans/types/plan';

import { InboxSidebar } from './InboxSidebar';

/**
 * InboxSidebarWrapper - データを取得してInboxSidebarに渡す
 *
 * DesktopLayoutから呼び出され、カレンダープランデータを提供
 */
export function InboxSidebarWrapper() {
  const { data: plansData, isLoading } = useplans();
  const { createPlan, updatePlan } = usePlanMutations();

  // カレンダー表示用のプラン（start_time/end_timeが設定されているもの）
  const calendarPlans = useMemo(() => {
    if (!plansData) return [];

    return plansData
      .filter((plan) => plan.start_time && plan.end_time)
      .map((plan) => {
        // planToCalendarPlanはPlan型を期待するため、型アサーションで変換
        return planToCalendarPlan(plan as unknown as Plan);
      });
  }, [plansData]);

  // プランのスケジュール設定ハンドラー
  const handleSchedulePlan = useCallback(
    (planId: string, date: Date, time: string) => {
      // 時間文字列をパース（例: "09:00"）
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);

      // デフォルト1時間の予定
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      // プランを更新
      updatePlan.mutate({
        id: planId,
        data: {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          due_date: date.toISOString().split('T')[0],
        },
      });
    },
    [updatePlan],
  );

  // 空き時間クリックでプラン作成
  const handleCreatePlan = useCallback(
    (date: Date, time: string) => {
      // 時間文字列をパース（例: "09:00"）
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);

      // デフォルト1時間の予定
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      // 新規プラン作成
      createPlan.mutate({
        title: '',
        status: 'todo',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        due_date: date.toISOString().split('T')[0],
      });
    },
    [createPlan],
  );

  return (
    <InboxSidebar
      isLoading={isLoading}
      calendarPlans={calendarPlans}
      onSchedulePlan={handleSchedulePlan}
      onCreatePlan={handleCreatePlan}
    />
  );
}
