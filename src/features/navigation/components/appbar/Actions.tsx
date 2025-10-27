'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NotificationDropdown } from '@/features/notifications'
import { TicketForm } from '@/features/tickets/components'
import { useTicketStore } from '@/features/tickets/stores'
import { api } from '@/lib/trpc'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'
import { Moon, PlusCircle, Search, Sun } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Item } from './Item'

interface ActionsProps {
  onSearch: () => void
  onToggleTheme: (theme: 'light' | 'dark') => void
  resolvedTheme: 'light' | 'dark' | undefined
  t: (key: string) => string
}

/**
 * AppBarアクションセクション
 *
 * Ticket作成、Search、Theme、Notificationsのアクションボタンを表示
 * useCallbackを使用してjsx-no-bind警告を回避
 */
export function Actions({ onSearch, onToggleTheme, resolvedTheme, t }: ActionsProps) {
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

  // useCallbackでイベントハンドラを定義（jsx-no-bind対策）
  const handleCreateTicketClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsTicketDialogOpen(true)
  }, [])

  const handleTicketSubmit = useCallback(
    async (data: CreateTicketInput) => {
      await createTicketMutation.mutateAsync(data)
    },
    [createTicketMutation]
  )

  const handleSearchClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onSearch()
    },
    [onSearch]
  )

  const handleThemeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onToggleTheme(resolvedTheme === 'light' ? 'dark' : 'light')
    },
    [onToggleTheme, resolvedTheme]
  )

  return (
    <>
      <div className="bg-sidebar flex flex-col items-center gap-2 px-2">
        <Item icon={PlusCircle} label="チケット作成" url="#" isActive={false} onClick={handleCreateTicketClick} />
        <Item icon={Search} label={t('actions.search')} url="#" isActive={false} onClick={handleSearchClick} />
        <Item
          icon={resolvedTheme === 'light' ? Moon : Sun}
          label={t('sidebar.theme')}
          url="#"
          isActive={false}
          onClick={handleThemeClick}
        />
        <div className="flex flex-col items-center gap-1">
          <NotificationDropdown />
          <span className="text-center text-[11px] leading-tight">{t('notifications.title')}</span>
        </div>
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
