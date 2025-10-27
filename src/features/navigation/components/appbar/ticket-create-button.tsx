'use client'

import { PlusCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TicketForm } from '@/features/tickets/components'
import { useTicketStore } from '@/features/tickets/stores'
import { api } from '@/lib/trpc'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'

interface TicketCreateButtonProps {
  label: string
  onClick?: (e: React.MouseEvent) => void
}

/**
 * AppBar用Ticket作成ボタン
 *
 * tRPC Contextを必要とするため、Actions.tsxから分離
 */
export function TicketCreateButton({ label, onClick }: TicketCreateButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { addTicket } = useTicketStore()
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)

  // URLから locale を抽出
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'

  // Ticket作成mutation
  const createTicketMutation = api.tickets.create.useMutation({
    onSuccess: (newTicket) => {
      addTicket(newTicket)
      setIsTicketDialogOpen(false)
      router.push(`/${localeFromPath}/tickets/${newTicket.id}`)
    },
    onError: (error) => {
      console.error('Failed to create ticket:', error)
    },
  })

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsTicketDialogOpen(true)
    onClick?.(e)
  }

  const handleTicketSubmit = async (data: CreateTicketInput) => {
    await createTicketMutation.mutateAsync(data)
  }

  return (
    <>
      {/* アイコンボタン部分 */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={handleClick}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex size-10 items-center justify-center rounded-md transition-colors"
          aria-label={label}
        >
          <PlusCircle className="size-5" />
        </button>
        <span className="text-center text-[11px] leading-tight">{label}</span>
      </div>

      {/* Ticket作成ダイアログ */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規チケット作成</DialogTitle>
          </DialogHeader>
          <TicketForm
            onSubmit={handleTicketSubmit}
            onCancel={() => setIsTicketDialogOpen(false)}
            isLoading={createTicketMutation.isPending}
            submitLabel="作成"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
