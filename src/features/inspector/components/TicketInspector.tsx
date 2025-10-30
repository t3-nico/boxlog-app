'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'

export function TicketInspector() {
  const { isOpen, mode, ticketId, close } = useTicketInspectorStore()

  console.log('[TicketInspector] Render:', { isOpen, mode, ticketId })

  if (!isOpen) {
    console.log('[TicketInspector] Not open, returning null')
    return null
  }

  console.log('[TicketInspector] Open! Rendering Sheet')

  const getTitle = () => {
    if (mode === 'create-ticket') return '新規チケット作成'
    if (mode === 'edit-ticket' || mode === 'view-ticket') return 'チケット編集'
    return ''
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-[700px] overflow-y-auto sm:max-w-[700px]">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription className="sr-only">チケットの詳細を編集します</SheetDescription>
        </SheetHeader>
        <div className="mt-6 bg-red-500 p-4 text-white">
          <h2>TEST: Inspector is rendering!</h2>
          <p>Mode: {mode}</p>
          <p>Ticket ID: {ticketId}</p>
          <button onClick={close} className="mt-4 rounded bg-white px-4 py-2 text-black">
            Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
