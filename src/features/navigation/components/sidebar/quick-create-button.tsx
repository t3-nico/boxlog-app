'use client'

import { PlusCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/features/i18n/lib/hooks'
import { TicketForm } from '@/features/tickets/components'
import { useTicketStore } from '@/features/tickets/stores'
import { trpc } from '@/lib/trpc'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'

export function QuickCreateButton() {
  const pathname = usePathname()
  const router = useRouter()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const { addTicket } = useTicketStore()

  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (newTicket) => {
      addTicket(newTicket)
      setIsTicketDialogOpen(false)
      router.push(`/${localeFromPath}/tickets/${newTicket.id}`)
    },
    onError: (error) => {
      console.error('チケット作成エラー:', error)
    },
  })

  const handleCreateTicket = async (data: CreateTicketInput) => {
    await createTicketMutation.mutateAsync(data)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsTicketDialogOpen(true)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex min-w-8 flex-1 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium duration-200 ease-linear"
      >
        <PlusCircle className="h-4 w-4" />
        <span>{t('sidebar.quickCreate')}</span>
      </button>

      {/* Ticket作成ダイアログ */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規チケット作成</DialogTitle>
            <DialogDescription>作業チケットを作成します。作成後、チケット詳細ページに移動します。</DialogDescription>
          </DialogHeader>
          <TicketForm
            onSubmit={handleCreateTicket}
            onCancel={() => setIsTicketDialogOpen(false)}
            submitLabel="チケットを作成"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
