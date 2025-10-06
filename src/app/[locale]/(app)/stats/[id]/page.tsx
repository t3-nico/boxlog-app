import Image from 'next/image'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { Banknote, Calendar, ChevronLeft, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'


import { Heading, Subheading } from '@/components/app'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getReview } from '@/lib/data'

import { RefundReview } from './refund'

interface Review {
  id: string
  amount: { usd: string; cad: string; fee: string; net: string }
  payment: { card: { type: string; number: string; expiry: string }; transactionId: string }
  date: string
  customer: { name: string; email: string; avatar: string; address: string; country: string; countryFlagUrl: string }
  event: { type: string; description: string; url: string; thumbUrl: string; name: string }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const review = (await getReview(id)) as Review | null

  return {
    title: review ? `Review #${review.id}` : undefined,
  }
}

const ReviewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const review = (await getReview(id)) as Review | null

  if (!review) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <NextLink href="/review" className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <ChevronLeft className="size-4 text-neutral-600 dark:text-neutral-400" data-slot="icon" />
          Reviews
        </NextLink>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Heading>Review #{review.id}</Heading>
          <Badge color="lime">Successful</Badge>
        </div>
        <div className="isolate mt-3 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-2">
            <span className="flex items-center gap-3 text-base sm:text-sm text-neutral-900 dark:text-neutral-100">
              <Banknote className="size-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
              <span>US{review.amount.usd}</span>
            </span>
            <span className="flex items-center gap-3 text-base sm:text-sm text-neutral-900 dark:text-neutral-100">
              <CreditCard className="size-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
              <span className="inline-flex gap-3">
                {review.payment.card.type}{' '}
                <span>
                  <span aria-hidden="true">••••</span> {review.payment.card.number}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-3 text-base sm:text-sm text-neutral-900 dark:text-neutral-100">
              <Calendar className="size-4 shrink-0 text-neutral-600 dark:text-neutral-400" data-slot="icon" />
              <span>{review.date}</span>
            </span>
          </div>
          <div className="flex gap-4">
            <RefundReview variant="outline" amount={review.amount.usd}>
              Refund
            </RefundReview>
            <Button>Resend Invoice</Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Subheading>Summary</Subheading>
        <Separator className="mt-4" />
        <dl className="grid grid-cols-1 text-base sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm">
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 first:border-none sm:py-3">Customer</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">{review.customer.name}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:py-3">Event</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">
            <NextLink href={review.event.url} className="flex items-center gap-2">
              <Avatar src={review.event.thumbUrl} alt={review.event.name} className="size-6" />
              <span>{review.event.name}</span>
            </NextLink>
          </dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:py-3">Amount</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">US{review.amount.usd}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:py-3">Amount after exchange rate</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">
            US{review.amount.usd} &rarr; CA{review.amount.cad}
          </dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:py-3">Fee</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">CA{review.amount.fee}</dd>
          <dt className="col-start-1 border-t border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:py-3">Net</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">CA{review.amount.net}</dd>
        </dl>
      </div>
      <div className="mt-12">
        <Subheading>Payment method</Subheading>
        <Separator className="mt-4" />
        <dl className="grid grid-cols-1 text-base sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm">
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 first:border-none sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Transaction ID</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">{review.payment.transactionId}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Card number</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">•••• {review.payment.card.number}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Card type</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">{review.payment.card.type}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Card expiry</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">{review.payment.card.expiry}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Owner</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">{review.customer.name}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Email address</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">{review.customer.email}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Address</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">{review.customer.address}</dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">Country</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">
            <span className="inline-flex gap-3">
              <Image
                src={review.customer.countryFlagUrl}
                alt={review.customer.country}
                width={20}
                height={15}
                sizes="20px"
              />
              {review.customer.country}
            </span>
          </dd>
          <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">CVC</dt>
          <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none">
            <Badge color="lime">Passed successfully</Badge>
          </dd>
        </dl>
      </div>
    </>
  )
}

export default ReviewPage
