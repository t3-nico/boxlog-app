'use client'

import { Timer } from 'lucide-react'

import type { Session } from '../types/session'
import { EmptyState } from './empty-state'
import { LoadingState } from './loading-state'
import { SessionCard } from './session-card'

interface SessionListProps {
  sessions: Session[]
  isLoading?: boolean
  onEdit?: (session: Session) => void
  onDelete?: (session: Session) => void
  onStart?: (session: Session) => void
  onStop?: (session: Session) => void
  onClick?: (session: Session) => void
  onCreateNew?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

export function SessionList({
  sessions,
  isLoading = false,
  onEdit,
  onDelete,
  onStart,
  onStop,
  onClick,
  onCreateNew,
  emptyTitle = 'セッションがありません',
  emptyDescription = '新しいセッションを作成して作業を記録しましょう',
}: SessionListProps) {
  if (isLoading) {
    return <LoadingState count={3} type="card" />
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={<Timer className="h-12 w-12" />}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onCreateNew ? '新規セッション作成' : undefined}
        onAction={onCreateNew}
      />
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onEdit={onEdit}
          onDelete={onDelete}
          onStart={onStart}
          onStop={onStop}
          onClick={onClick}
        />
      ))}
    </div>
  )
}
