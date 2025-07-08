'use client'

import { useState, useEffect } from 'react'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { useChatContext } from '@/contexts/chat-context'

interface ReviewType {
  id: string
  date: string
  customer: { name: string }
  event: { name: string; thumbUrl: string }
  amount: { usd: string }
  url: string
}

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const { toggleChat, state } = useChatContext()

  useEffect(() => {
    // モックデータ
    const mockReviews = [
      {
        id: '001',
        date: '2024-01-15',
        customer: { name: 'John Doe' },
        event: { name: 'Sample Event', thumbUrl: '/teams/catalyst.svg' },
        amount: { usd: '$125' },
        url: '/review/001'
      }
    ]
    setReviews(mockReviews)
  }, [])

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 p-4 md:p-6 lg:p-10 transition-all duration-300 ${state.isOpen ? 'mr-80' : ''}`}>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <Heading>Reviews</Heading>
            <Button className="-my-0.5">Create review</Button>
          </div>
          <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
            <TableHead>
              <TableRow>
                <TableHeader>Review number</TableHeader>
                <TableHeader>Purchase date</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Event</TableHeader>
                <TableHeader className="text-right">Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} href={review.url} title={`Review #${review.id}`}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell className="text-zinc-500">{review.date}</TableCell>
                  <TableCell>{review.customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={review.event.thumbUrl} className="size-6" />
                      <span>{review.event.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">US{review.amount.usd}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}