import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { getReview } from '@/data'
import { Banknote, Calendar, ChevronLeft, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RefundReview } from './refund'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let review = await getReview(params.id)

  return {
    title: review && `Review #${review.id}`,
  }
}

export default async function Review({ params }: { params: { id: string } }) {
  let review = await getReview(params.id)

  if (!review) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/review" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeft className="size-4 text-zinc-400 dark:text-zinc-500" data-slot="icon" />
          Reviews
        </Link>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Heading>Review #{review.id}</Heading>
          <Badge color="lime">Successful</Badge>
        </div>
        <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <Banknote className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span>US{review.amount.usd}</span>
            </span>
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <CreditCard className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span className="inline-flex gap-3">
                {review.payment.card.type}{' '}
                <span>
                  <span aria-hidden="true">••••</span> {review.payment.card.number}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <Calendar className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" data-slot="icon" />
              <span>{review.date}</span>
            </span>
          </div>
          <div className="flex gap-4">
            <RefundReview outline amount={review.amount.usd}>
              Refund
            </RefundReview>
            <Button>Resend Invoice</Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Subheading>Summary</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Customer</DescriptionTerm>
          <DescriptionDetails>{review.customer.name}</DescriptionDetails>
          <DescriptionTerm>Event</DescriptionTerm>
          <DescriptionDetails>
            <Link href={review.event.url} className="flex items-center gap-2">
              <Avatar src={review.event.thumbUrl} className="size-6" />
              <span>{review.event.name}</span>
            </Link>
          </DescriptionDetails>
          <DescriptionTerm>Amount</DescriptionTerm>
          <DescriptionDetails>US{review.amount.usd}</DescriptionDetails>
          <DescriptionTerm>Amount after exchange rate</DescriptionTerm>
          <DescriptionDetails>
            US{review.amount.usd} &rarr; CA{review.amount.cad}
          </DescriptionDetails>
          <DescriptionTerm>Fee</DescriptionTerm>
          <DescriptionDetails>CA{review.amount.fee}</DescriptionDetails>
          <DescriptionTerm>Net</DescriptionTerm>
          <DescriptionDetails>CA{review.amount.net}</DescriptionDetails>
        </DescriptionList>
      </div>
      <div className="mt-12">
        <Subheading>Payment method</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Transaction ID</DescriptionTerm>
          <DescriptionDetails>{review.payment.transactionId}</DescriptionDetails>
          <DescriptionTerm>Card number</DescriptionTerm>
          <DescriptionDetails>•••• {review.payment.card.number}</DescriptionDetails>
          <DescriptionTerm>Card type</DescriptionTerm>
          <DescriptionDetails>{review.payment.card.type}</DescriptionDetails>
          <DescriptionTerm>Card expiry</DescriptionTerm>
          <DescriptionDetails>{review.payment.card.expiry}</DescriptionDetails>
          <DescriptionTerm>Owner</DescriptionTerm>
          <DescriptionDetails>{review.customer.name}</DescriptionDetails>
          <DescriptionTerm>Email address</DescriptionTerm>
          <DescriptionDetails>{review.customer.email}</DescriptionDetails>
          <DescriptionTerm>Address</DescriptionTerm>
          <DescriptionDetails>{review.customer.address}</DescriptionDetails>
          <DescriptionTerm>Country</DescriptionTerm>
          <DescriptionDetails>
            <span className="inline-flex gap-3">
              <img src={review.customer.countryFlagUrl} alt={review.customer.country} />
              {review.customer.country}
            </span>
          </DescriptionDetails>
          <DescriptionTerm>CVC</DescriptionTerm>
          <DescriptionDetails>
            <Badge color="lime">Passed successfully</Badge>
          </DescriptionDetails>
        </DescriptionList>
      </div>
    </>
  )
}
