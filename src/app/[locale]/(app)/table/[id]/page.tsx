// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'

import { Heading, Link, Subheading } from '@/components/custom'
import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn-ui/table'
import { getEvent, getEventReviews } from '@/lib/data'

interface Event {
  name: string
  imgUrl: string
  status: string
  date: string
  time: string
  location: string
  totalRevenue: string
  totalRevenueChange: string
  ticketsSold: number
  ticketsAvailable: string
  ticketsSoldChange: string
  pageViews: string
  pageViewsChange: string
  [key: string]: unknown
}

interface Review {
  id: string
  url: string
  date: string
  customer: { name: string }
  amount: { usd: string }
}

const Stat = dynamic(() => import('@/features/stats').then((mod) => ({ default: mod.Stat })), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse rounded bg-gray-200" />,
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const event = (await getEvent(id)) as Event | null

  return {
    title: event ? event.name : undefined,
  }
}

const EventPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const event = (await getEvent(id)) as Event | null
  const reviews = (await getEventReviews(id)) as Review[]

  if (!event) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link
          href="/box"
          className="inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200"
        >
          <ChevronLeft className="size-4 text-neutral-800 dark:text-neutral-200" data-slot="icon" />
          Box
        </Link>
      </div>
      <div
        className="mt-4 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-32 shrink-0">
            <Image
              className="aspect-3/2 rounded-md shadow-sm"
              src={event.imgUrl}
              alt={`${event.name} event image`}
              width={128}
              height={85}
              sizes="128px"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-4 gap-y-2">
              <Heading>{event.name}</Heading>
              <Badge color={event.status === 'On Sale' ? 'lime' : 'zinc'}>{event.status}</Badge>
            </div>
            <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
              {event.date} at {event.time} <span aria-hidden="true">·</span> {event.location}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">Edit</Button>
          <Button>View</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <Stat title="Total revenue" value={event.totalRevenue} change={event.totalRevenueChange} />
        <Stat
          title="Tickets sold"
          value={`${event.ticketsSold}/${event.ticketsAvailable}`}
          change={event.ticketsSoldChange}
        />
        <Stat title="Pageviews" value={event.pageViews} change={event.pageViewsChange} />
      </div>
      <Subheading className="mt-16">Recent reviews</Subheading>
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Review number</TableHeader>
            <TableHeader>Purchase date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id} href={review.url} title={`Review #${review.id}`}>
              <TableCell>{review.id}</TableCell>
              <TableCell className="text-neutral-800 dark:text-neutral-200">{review.date}</TableCell>
              <TableCell>{review.customer.name}</TableCell>
              <TableCell className="text-right">US{review.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default EventPage
