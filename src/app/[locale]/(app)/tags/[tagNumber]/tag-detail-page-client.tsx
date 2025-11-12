'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { useTags } from '@/features/tags/hooks/use-tags'
import { TicketCard } from '@/features/tickets/components/display/TicketCard'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import type { Ticket } from '@/features/tickets/types/ticket'
import { api } from '@/lib/trpc'

interface TagDetailPageClientProps {
  tagNumber: string
}

export function TagDetailPageClient({ tagNumber }: TagDetailPageClientProps) {
  const { data: tags = [], isLoading } = useTags(true)
  const router = useRouter()
  const { openInspector } = useTicketInspectorStore()

  const tag = tags.find((t) => t.tag_number === Number(tagNumber))

  // タグに紐づくチケットを取得
  const { data: ticketsData = [], isLoading: isLoadingTickets } = api.tickets.list.useQuery(
    { tagId: tag?.id },
    { enabled: !!tag?.id }
  )
  const tickets = ticketsData as Ticket[]

  useEffect(() => {
    if (!isLoading && !tag) {
      // タグが見つからない場合はタグ一覧にリダイレクト
      router.push('/tags')
    }
  }, [isLoading, tag, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tag) {
    return null
  }

  // 子タグの数を計算（level === 1 かつ parent_id がこのタグのID）
  const childTagCount = tags.filter((t) => t.parent_id === tag.id && t.level === 1 && t.is_active).length

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <TagsPageHeader title={tag.name} count={childTagCount} />

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-6 w-6 rounded-full" style={{ backgroundColor: tag.color || '#3B82F6' }} />
              <p className="text-muted-foreground">t-{tag.tag_number}</p>
            </div>
          </div>

          {tag.description && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">説明</h2>
              <p className="text-muted-foreground">{tag.description}</p>
            </div>
          )}

          {/* チケット一覧 */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">紐づいたチケット ({tickets.length})</h2>
            {isLoadingTickets ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="border-border rounded-lg border p-6">
                <p className="text-muted-foreground text-center">このタグに紐づくチケットはありません</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onClick={(t) => openInspector(t.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
