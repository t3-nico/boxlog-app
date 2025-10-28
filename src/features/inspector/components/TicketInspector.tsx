'use client'

import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'
import { SessionFormWrapper } from '@/features/tickets/components/session-form-wrapper'
import { TicketFormWrapper } from '@/features/tickets/components/ticket-form-wrapper'
import { Suspense, useMemo } from 'react'
import { SidePanel } from './SidePanel'

export function TicketInspector() {
  const { isOpen, mode, ticketId, sessionId, close } = useTicketInspectorStore()

  const tabs: SidebarTab[] = useMemo(
    () => [
      {
        value: 'overview',
        label: '概要',
        content: (
          <Suspense fallback={<div className="py-8 text-center">読み込み中...</div>}>
            {(mode === 'create-ticket' || mode === 'edit-ticket' || mode === 'view-ticket') && (
              <TicketFormWrapper ticketId={ticketId ?? undefined} onSuccess={close} />
            )}
            {(mode === 'create-session' || mode === 'edit-session' || mode === 'view-session') && (
              <SessionFormWrapper
                sessionId={sessionId ?? undefined}
                ticketId={ticketId ?? undefined}
                onSuccess={close}
              />
            )}
          </Suspense>
        ),
      },
      {
        value: 'activity',
        label: 'アクティビティ',
        content: <div className="text-muted-foreground py-4 text-center">アクティビティ履歴（実装予定）</div>,
      },
      {
        value: 'related',
        label: '関連',
        content: <div className="text-muted-foreground py-4 text-center">関連項目（実装予定）</div>,
      },
    ],
    [mode, ticketId, sessionId, close]
  )

  return (
    <SidePanel
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      tabs={tabs}
      defaultTab="overview"
      defaultWidth={700}
      minWidth={400}
      maxWidth={1200}
    />
  )
}
