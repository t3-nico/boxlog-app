'use client'

import { format } from 'date-fns'
import { cloneElement, isValidElement, type ReactNode } from 'react'

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { toLocalISOString } from '@/features/plans/utils/datetime'

import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore'

interface PlanCreateTriggerProps {
  triggerElement: ReactNode
  onSuccess?: () => void
  /** 初期日付 */
  initialDate?: Date
  /** 初期開始時刻（HH:mm形式） */
  initialStartTime?: string
  /** 初期終了時刻（HH:mm形式） */
  initialEndTime?: string
}

export function PlanCreateTrigger({
  triggerElement,
  onSuccess,
  initialDate,
  initialStartTime,
  initialEndTime,
}: PlanCreateTriggerProps) {
  const { openInspector } = usePlanInspectorStore()
  const { createPlan } = usePlanMutations()

  const handleClick = async () => {
    try {
      const planData = {
        title: '新しい予定',
        status: 'todo' as const,
        due_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : undefined,
        start_time:
          initialDate && initialStartTime
            ? toLocalISOString(format(initialDate, 'yyyy-MM-dd'), initialStartTime)
            : null,
        end_time:
          initialDate && initialEndTime ? toLocalISOString(format(initialDate, 'yyyy-MM-dd'), initialEndTime) : null,
      }

      const newPlan = await createPlan.mutateAsync(planData)

      if (newPlan?.id) {
        openInspector(newPlan.id)
        onSuccess?.()
      }
    } catch (error) {
      console.error('Failed to create plan:', error)
    }
  }

  // triggerElementにonClickを追加
  if (isValidElement(triggerElement)) {
    return cloneElement(triggerElement as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    })
  }

  // フォールバック: divでラップ
  return (
    <div onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
      {triggerElement}
    </div>
  )
}
