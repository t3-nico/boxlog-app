import { PlanQuickCreate } from '@/features/plans/components/shared/PlanQuickCreate'

interface InboxCardCreateProps {
  isCreating: boolean
  onStartCreate: () => void
  onFinishCreate: () => void
}

/**
 * InboxCardCreate - Calendar Sidebar Inbox用の新規作成ラッパー
 *
 * PlanQuickCreateを使用してtodoステータスのプランを作成
 */
export function InboxCardCreate({ isCreating, onStartCreate, onFinishCreate }: InboxCardCreateProps) {
  return (
    <PlanQuickCreate
      status="todo"
      isCreating={isCreating}
      onStartCreate={onStartCreate}
      onFinishCreate={onFinishCreate}
    />
  )
}
