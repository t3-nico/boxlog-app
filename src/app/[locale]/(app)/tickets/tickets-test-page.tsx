'use client'

import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { api } from '@/lib/trpc'

export function TicketsTestPage() {
  const { data: tickets, isLoading } = api.tickets.getAll.useQuery()
  const { open: openInspector } = useTicketInspectorStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Tickets テスト</h1>
          <p className="text-muted-foreground mt-2">クリックしてInspectorで詳細を確認</p>
        </div>

        <div className="grid gap-4">
          {tickets?.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => openInspector('edit-ticket', ticket.id)}
              className="hover:bg-accent cursor-pointer rounded-lg border p-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs">{ticket.ticket_number}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        ticket.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : ticket.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {ticket.status === 'open'
                        ? '未着手'
                        : ticket.status === 'in_progress'
                          ? '進行中'
                          : ticket.status === 'completed'
                            ? '完了'
                            : 'キャンセル'}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">{ticket.title}</h3>
                  {ticket.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{ticket.description}</p>
                  )}
                  <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
                    {ticket.due_date && (
                      <span>
                        期限:{' '}
                        {new Date(ticket.due_date).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                    <span>作成: {new Date(ticket.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!tickets || tickets.length === 0 ? (
            <div className="text-muted-foreground flex h-64 items-center justify-center">
              <p>Ticketがありません。Plus アイコンから作成してください。</p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
