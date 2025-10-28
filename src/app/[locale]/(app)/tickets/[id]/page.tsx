'use client'

import { ChevronLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { LoadingState, SessionList, SessionTimer, TicketStatusBadge } from '@/features/tickets/components'
import { useSessions, useTickets } from '@/features/tickets/hooks'
import type { Session } from '@/features/tickets/types/session'

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params?.id as string

  const { getTicketById, isLoading: ticketsLoading } = useTickets()
  const { isLoading: sessionsLoading, deleteSession, startSession, stopSession, getSessionsByTicketId } = useSessions()

  const ticket = getTicketById(ticketId)
  const ticketSessions = getSessionsByTicketId(ticketId)

  const { open: openInspector } = useTicketInspectorStore()
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  const handleStartSession = async (session: Session) => {
    await startSession(session.id)
    setActiveSession(session)
  }

  const handleStopSession = async (session: Session) => {
    await stopSession(session.id)
    setActiveSession(null)
  }

  if (ticketsLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <LoadingState type="form" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">チケットが見つかりません</p>
            <Button asChild className="mt-4">
              <Link href="/tickets">チケット一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      {/* ヘッダー */}
      <div>
        <Link
          href="/tickets"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          チケット一覧に戻る
        </Link>
      </div>

      {/* チケット情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground font-mono text-sm">{ticket.ticket_number}</p>
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
            </div>
            <TicketStatusBadge status={ticket.status} size="md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.description && (
            <div>
              <h3 className="text-muted-foreground mb-2 text-sm font-medium">説明</h3>
              <p className="text-foreground">{ticket.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-medium">実績時間</h3>
            <p className="text-foreground text-2xl font-semibold">{ticket.actual_hours}h</p>
          </div>
        </CardContent>
      </Card>

      {/* セッション管理エリア */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* セッション一覧 */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">セッション</h2>
            <Button onClick={() => openInspector('create-session', ticketId)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              新規セッション
            </Button>
          </div>

          <SessionList
            sessions={ticketSessions}
            isLoading={sessionsLoading}
            onStart={handleStartSession}
            onStop={handleStopSession}
            onDelete={(session) => deleteSession(session.id)}
          />
        </div>

        {/* タイマー */}
        <div className="lg:col-span-1">
          <SessionTimer
            session={activeSession}
            onStart={() => activeSession && handleStartSession(activeSession)}
            onStop={() => activeSession && handleStopSession(activeSession)}
          />
        </div>
      </div>
    </div>
  )
}
