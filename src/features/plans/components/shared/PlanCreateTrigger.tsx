'use client';

import { format } from 'date-fns';
import { cloneElement, isValidElement, type ReactNode } from 'react';

import { toLocalISOString } from '@/features/plans/utils/datetime';

import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore';

interface PlanCreateTriggerProps {
  triggerElement: ReactNode;
  onSuccess?: () => void;
  /** 初期日付 */
  initialDate?: Date;
  /** 初期開始時刻（HH:mm形式） */
  initialStartTime?: string;
  /** 初期終了時刻（HH:mm形式） */
  initialEndTime?: string;
}

export function PlanCreateTrigger({
  triggerElement,
  onSuccess,
  initialDate,
  initialStartTime,
  initialEndTime,
}: PlanCreateTriggerProps) {
  const { openInspectorWithDraft } = usePlanInspectorStore();

  const handleClick = () => {
    // ドラフトモードでInspectorを開く（DB未保存）
    // 任意の入力があった時点で初めてDBに保存される
    openInspectorWithDraft({
      title: '',
      due_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : null,
      start_time:
        initialDate && initialStartTime
          ? toLocalISOString(format(initialDate, 'yyyy-MM-dd'), initialStartTime)
          : null,
      end_time:
        initialDate && initialEndTime
          ? toLocalISOString(format(initialDate, 'yyyy-MM-dd'), initialEndTime)
          : null,
    });
    onSuccess?.();
  };

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
