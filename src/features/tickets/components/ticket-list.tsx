'use client'

import { Package } from 'lucide-react'

import type { Ticket } from '../types/ticket'
import { EmptyState } from './empty-state'
import { LoadingState } from './loading-state'
import { TicketCard } from './ticket-card'

interface TicketListProps {
  tickets: Ticket[]
  isLoading?: boolean
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticket: Ticket) => void
  onClick?: (ticket: Ticket) => void
  onCreateNew?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

export function TicketList({
  tickets,
  isLoading = false,
  onEdit,
  onDelete,
  onClick,
  onCreateNew,
  emptyTitle = 'チケットがありません',
  emptyDescription = '新しいチケットを作成して作業を開始しましょう',
}: TicketListProps) {
  if (isLoading) {
    return <LoadingState count={5} type="card" />
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onCreateNew ? '新規チケット作成' : undefined}
        onAction={onCreateNew}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} onEdit={onEdit} onDelete={onDelete} onClick={onClick} />
      ))}
    </div>
  )
}
