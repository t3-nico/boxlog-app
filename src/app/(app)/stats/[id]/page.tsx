import { notFound } from 'next/navigation'

import { Banknote, Calendar, ChevronLeft, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'

import { DescriptionDetails, DescriptionList, DescriptionTerm , Heading, Subheading , Link } from '@/components/custom'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import { Separator } from '@/components/shadcn-ui/separator'
import { colors, typography } from '@/config/theme'
import { getReview } from '@/lib/data'

import { RefundReview } from './refund'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const review = await getReview(params.id)

  return {
    title: review && `Review #${review.id}`,
  }
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const review = await getReview(params.id)

  if (!review) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/review" className={`inline-flex items-center gap-2 ${typography.body.sm} ${colors.text.tertiary}`}>
          <ChevronLeft className={`size-4 ${colors.text.muted}`} data-slot="icon" />
          Reviews
        </Link>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Heading>Review #{review.id}</Heading>
          <Badge color="lime">Successful</Badge>
        </div>
        <div className="isolate mt-3 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-2">
            <span className={`flex items-center gap-3 ${typography.body.base} sm:${typography.body.sm} ${colors.text.primary}`}>
              <Banknote className={`size-4 shrink-0 ${colors.text.muted}`} />
              <span>US{review.amount.usd}</span>
            </span>
            <span className={`flex items-center gap-3 ${typography.body.base} sm:${typography.body.sm} ${colors.text.primary}`}>
              <CreditCard className={`size-4 shrink-0 ${colors.text.muted}`} />
              <span className="inline-flex gap-3">
                {review.payment.card.type}{' '}
                <span>
                  <span aria-hidden="true">••••</span> {review.payment.card.number}
                </span>
              </span>
            </span>
            <span className={`flex items-center gap-3 ${typography.body.base} sm:${typography.body.sm} ${colors.text.primary}`}>
              <Calendar className={`size-4 shrink-0 ${colors.text.muted}`} data-slot="icon" />
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
        <Separator className="mt-4" />
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
