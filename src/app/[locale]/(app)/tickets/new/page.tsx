'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketForm } from '@/features/tickets/components'
import { useTickets } from '@/features/tickets/hooks'
import type { CreateTicketInput } from '@/schemas/tickets/ticket'

export default function NewTicketPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'ja'

  const { createTicket } = useTickets()

  const handleSubmit = async (data: CreateTicketInput) => {
    const newTicket = await createTicket(data)
    if (newTicket) {
      router.push(`/${locale}/tickets/${newTicket.id}`)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      {/* ヘッダー */}
      <div>
        <Link
          href={`/${locale}/board`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          ボードに戻る
        </Link>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新規チケット作成</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="チケットを作成" />
        </CardContent>
      </Card>
    </div>
  )
}
