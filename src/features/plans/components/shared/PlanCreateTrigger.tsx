'use client';

import { format } from 'date-fns';
import { cloneElement, isValidElement, useCallback, type ReactNode } from 'react';

import { api } from '@/lib/trpc';

import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore';

interface PlanCreateTriggerProps {
  triggerElement: ReactNode;
  onSuccess?: () => void;
  /** 初期日付 */
  initialDate?: Date;
}

export function PlanCreateTrigger({
  triggerElement,
  onSuccess,
  initialDate,
}: PlanCreateTriggerProps) {
  const { openInspectorWithDraft } = usePlanInspectorStore();
  const utils = api.useUtils();

  // 次の15分単位の時刻を取得
  const getNextQuarterHour = useCallback((date: Date): Date => {
    const result = new Date(date);
    const minutes = result.getMinutes();
    const nextQuarter = Math.ceil(minutes / 15) * 15;
    result.setMinutes(nextQuarter, 0, 0);
    if (nextQuarter >= 60) {
      result.setHours(result.getHours() + 1);
      result.setMinutes(0);
    }
    return result;
  }, []);

  // 時間が重複しているかチェック
  // バックエンド（PlanService.checkTimeOverlap）と同じロジック
  const checkOverlap = useCallback(
    (start: Date, end: Date): boolean => {
      const plans = utils.plans.list.getData();
      if (!plans || plans.length === 0) return false;

      return plans.some((p) => {
        if (!p.start_time || !p.end_time) return false;
        const pStart = new Date(p.start_time);
        const pEnd = new Date(p.end_time);
        // 時間重複条件: 既存の開始 < 新規の終了 AND 既存の終了 > 新規の開始
        return pStart < end && pEnd > start;
      });
    },
    [utils.plans.list],
  );

  // 空き時間を探す（最大2時間先まで）
  const findAvailableSlot = useCallback(
    (baseTime: Date): { start: Date; end: Date } => {
      let start = getNextQuarterHour(baseTime);
      let end = new Date(start.getTime() + 60 * 60 * 1000); // 1時間後

      // 最大8回（2時間分）試行
      for (let i = 0; i < 8; i++) {
        if (!checkOverlap(start, end)) {
          return { start, end };
        }
        // 15分ずらす
        start = new Date(start.getTime() + 15 * 60 * 1000);
        end = new Date(end.getTime() + 15 * 60 * 1000);
      }

      // 見つからなければ最初の候補を返す
      return {
        start: getNextQuarterHour(baseTime),
        end: new Date(getNextQuarterHour(baseTime).getTime() + 60 * 60 * 1000),
      };
    },
    [getNextQuarterHour, checkOverlap],
  );

  const handleClick = useCallback(() => {
    // 日付が指定されている場合は空き時間を探す
    const baseDate = initialDate || new Date();
    const { start, end } = findAvailableSlot(baseDate);

    // カレンダーに選択範囲を表示
    window.dispatchEvent(
      new CustomEvent('calendar-show-selection', {
        detail: {
          date: start,
          startHour: start.getHours(),
          startMinute: start.getMinutes(),
          endHour: end.getHours(),
          endMinute: end.getMinutes(),
        },
      }),
    );

    // ドラフトモードでInspectorを開く（DB未保存）
    openInspectorWithDraft({
      title: '',
      due_date: format(start, 'yyyy-MM-dd'),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });
    onSuccess?.();
  }, [initialDate, findAvailableSlot, openInspectorWithDraft, onSuccess]);

  // triggerElementにonClickを追加
  if (isValidElement(triggerElement)) {
    return cloneElement(triggerElement as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }

  // フォールバック: buttonでラップ（アクセシビリティ対応）
  return (
    <button
      type="button"
      onClick={handleClick}
      className="focus-visible:outline-ring inline-flex cursor-pointer appearance-none items-center justify-center border-none bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label="新しい予定を作成"
    >
      {triggerElement}
    </button>
  );
}
