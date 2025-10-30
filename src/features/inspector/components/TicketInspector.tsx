'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'

export function TicketInspector() {
  const { isOpen, close } = useTicketInspectorStore()

  console.log('[TicketInspector] Rendering, isOpen:', isOpen)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Test</SheetTitle>
          <SheetDescription>Test Description</SheetDescription>
        </SheetHeader>
        <div className="bg-red-500 p-8 text-2xl text-white">TEST: Sheet is working!</div>
      </SheetContent>
    </Sheet>
  )
}
