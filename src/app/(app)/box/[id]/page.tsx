import { Stat } from '@/app/stat'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getEvent, getEventReviews } from '@/data'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let event = await getEvent(params.id)

  return {
    title: event?.name,
  }
}

export default async function Event({ params }: { params: { id: string } }) {
  let event = await getEvent(params.id)
  let reviews = await getEventReviews(params.id)

  if (!event) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/box" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeft className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Box
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-32 shrink-0">
            <img className="aspect-3/2 rounded-lg shadow-sm" src={event.imgUrl} alt="" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{event.name}</Heading>
              <Badge color={event.status === 'On Sale' ? 'lime' : 'zinc'}>{event.status}</Badge>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              {event.date} at {event.time} <span aria-hidden="true">·</span> {event.location}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button outline>Edit</Button>
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
      <Subheading className="mt-12">Recent reviews</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
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
              <TableCell className="text-zinc-500">{review.date}</TableCell>
              <TableCell>{review.customer.name}</TableCell>
              <TableCell className="text-right">US{review.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
