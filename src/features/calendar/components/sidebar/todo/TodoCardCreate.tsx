import { PlanQuickCreate } from '@/features/plans/components/shared/PlanQuickCreate'

interface TodoCardCreateProps {
  isCreating: boolean
  onStartCreate: () => void
  onFinishCreate: () => void
}

/**
 * TodoCardCreate - Calendar Sidebar Todo用の新規作成ラッパー
 *
 * PlanQuickCreateを使用してtodoステータスのプランを作成
 */
export function TodoCardCreate({ isCreating, onStartCreate, onFinishCreate }: TodoCardCreateProps) {
  return (
    <PlanQuickCreate
      status="todo"
      isCreating={isCreating}
      onStartCreate={onStartCreate}
      onFinishCreate={onFinishCreate}
    />
  )
}
