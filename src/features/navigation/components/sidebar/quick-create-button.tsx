// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import { PlusCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/features/i18n/lib/hooks'
import { TicketForm } from '@/features/tickets/components'
import { useTicketStore } from '@/features/tickets/stores'
import { api } from '@/lib/trpc'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'

export function QuickCreateButton() {
  const pathname = usePathname()
  const router = useRouter()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const { addTicket } = useTicketStore()

  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)

  // tRPC Utils（キャッシュ無効化用）
  const utils = api.useUtils()

  const createTicketMutation = api.tickets.create.useMutation({
    onMutate: async (newTicket) => {
      // 進行中のクエリをキャンセル（競合を防ぐ）
      await utils.tickets.list.cancel()

      // 以前のキャッシュを保存（ロールバック用）
      const previousTickets = utils.tickets.list.getData()

      // Optimistic Update：即座にキャッシュを更新
      utils.tickets.list.setData(undefined, (old) => {
        if (!old) return old
        // サーバーからのレスポンスを予測して仮のチケットを作成
        const optimisticTicket = {
          ...newTicket,
          id: 'temp-' + Date.now(), // 一時ID
          user_id: '', // サーバーで設定される
          ticket_number: '...', // サーバーで設定される
          actual_hours: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return [...old, optimisticTicket]
      })

      return { previousTickets }
    },
    onError: (err, newTicket, context) => {
      // エラー時：キャッシュをロールバック
      if (context?.previousTickets) {
        utils.tickets.list.setData(undefined, context.previousTickets)
      }
      console.error('[QuickCreateButton] onError called:', err)
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      toast.error('チケットの作成に失敗しました', {
        description: errorMessage,
      })
    },
    onSuccess: (newTicket) => {
      console.log('[QuickCreateButton] onSuccess called:', newTicket)
      // Zustand storeに追加
      addTicket(newTicket)
      // Toast通知を表示
      toast.success('チケットを作成しました', {
        description: `「${newTicket.title}」を作成しました`,
      })
      // ダイアログを閉じる
      setIsTicketDialogOpen(false)
      // チケット詳細ページに遷移
      router.push(`/${localeFromPath}/tickets/${newTicket.id}`)
    },
    onSettled: () => {
      // 最終的にサーバーと同期（バックグラウンドで実行）
      utils.tickets.list.invalidate()
    },
  })

  const handleCreateTicket = (data: CreateTicketInput) => {
    // Optimistic Updateが全て処理するため、シンプルにmutateを呼ぶだけ
    createTicketMutation.mutate(data)
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
