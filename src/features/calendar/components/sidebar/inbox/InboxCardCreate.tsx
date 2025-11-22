import { TicketQuickCreate } from '@/features/plans/components/shared/PlanQuickCreate'

interface InboxCardCreateProps {
  isCreating: boolean
  onStartCreate: () => void
  onFinishCreate: () => void
}

/**
 * InboxCardCreate - Calendar Sidebar Inbox用の新規作成ラッパー
 *
 * TicketQuickCreateを使用してbacklogステータスのチケットを作成
 */
export function InboxCardCreate({ isCreating, onStartCreate, onFinishCreate }: InboxCardCreateProps) {
  return (
    <TicketQuickCreate
      status="backlog"
      isCreating={isCreating}
      onStartCreate={onStartCreate}
      onFinishCreate={onFinishCreate}
    />
  )
}
