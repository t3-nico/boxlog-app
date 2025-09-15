import Image from 'next/image'
import { notFound } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'


import { Heading, Subheading , Link } from '@/components/custom'
import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn-ui/table'
import { colors, typography, spacing, rounded, elevation } from '@/config/theme'
import { Stat } from '@/features/stats'
import { getEvent, getEventReviews } from '@/lib/data'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await getEvent(params.id)

  return {
    title: event?.name,
  }
}

const EventPage = async ({ params }: { params: { id: string } }) => {
  const event = await getEvent(params.id)
  const reviews = await getEventReviews(params.id)

  if (!event) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/box" className={`inline-flex items-center ${spacing.component.gap.sm} ${typography.body.sm} ${colors.text.secondary}`}>
          <ChevronLeft className={`size-4 ${colors.icon.secondary}`} data-slot="icon" />
          Box
        </Link>
      </div>
      <div className={`${spacing.component.stack.md} flex flex-wrap items-end justify-between ${spacing.component.gap.md}`}>
        <div className={`flex flex-wrap items-center ${spacing.component.gap.lg}`}>
          <div className="w-32 shrink-0">
            <Image 
              className={`aspect-3/2 ${rounded.component.card.md} ${elevation.card.sm}`} 
              src={event.imgUrl} 
              alt={`${event.name} event image`}
              width={128}
              height={85}
              sizes="128px"
            />
          </div>
          <div>
            <div className={`flex flex-wrap items-center ${spacing.component.gap.md} gap-y-2`}>
              <Heading>{event.name}</Heading>
              <Badge color={event.status === 'On Sale' ? 'lime' : 'zinc'}>{event.status}</Badge>
            </div>
            <div className={`${spacing.component.stack.xs} ${typography.body.sm} ${colors.text.secondary}`}>
              {event.date} at {event.time} <span aria-hidden="true">·</span> {event.location}
            </div>
          </div>
        </div>
        <div className={`flex ${spacing.component.gap.md}`}>
          <Button variant="outline">Edit</Button>
          <Button>View</Button>
        </div>
      </div>
      <div className={`${spacing.component.stack.xl} grid ${spacing.component.gap.xl} sm:grid-cols-3`}>
        <Stat title="Total revenue" value={event.totalRevenue} change={event.totalRevenueChange} />
        <Stat
          title="Tickets sold"
          value={`${event.ticketsSold}/${event.ticketsAvailable}`}
          change={event.ticketsSoldChange}
        />
        <Stat title="Pageviews" value={event.pageViews} change={event.pageViewsChange} />
      </div>
      <Subheading className={spacing.component.stack.xxl}>Recent reviews</Subheading>
      <Table className={`${spacing.component.stack.md} [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]`}>
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
              <TableCell className={colors.text.secondary}>{review.date}</TableCell>
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
