'use client'

import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { SessionFormWrapper } from '@/features/tickets/components/session-form-wrapper'
import { TicketFormWrapper } from '@/features/tickets/components/ticket-form-wrapper'
import { Suspense } from 'react'
import { ResizableSheet } from './ResizableSheet'

export function TicketInspector() {
  const { isOpen, mode, ticketId, sessionId, close } = useTicketInspectorStore()

  const getTitle = () => {
    switch (mode) {
      case 'create-ticket':
        return '新規チケット作成'
      case 'edit-ticket':
      case 'view-ticket':
        return 'チケット詳細'
      case 'create-session':
        return '新規セッション作成'
      case 'edit-session':
      case 'view-session':
        return 'セッション詳細'
      default:
        return ''
    }
  }

  return (
    <ResizableSheet
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title={getTitle()}
      defaultWidth={700}
      minWidth={400}
      maxWidth={1200}
    >
      <Suspense fallback={<div className="py-8 text-center">読み込み中...</div>}>
        {(mode === 'create-ticket' || mode === 'edit-ticket' || mode === 'view-ticket') && (
          <TicketFormWrapper ticketId={ticketId ?? undefined} onSuccess={close} />
        )}
        {(mode === 'create-session' || mode === 'edit-session' || mode === 'view-session') && (
          <SessionFormWrapper sessionId={sessionId ?? undefined} ticketId={ticketId ?? undefined} onSuccess={close} />
        )}
      </Suspense>
    </ResizableSheet>
  )
}
