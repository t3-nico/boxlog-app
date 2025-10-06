import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Banknote, Calendar, ChevronLeft, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'


import { DescriptionDetails, DescriptionList, DescriptionTerm , Heading, Subheading , Link } from '@/components/custom'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import { Separator } from '@/components/shadcn-ui/separator'
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
        <Link href="/review" className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <ChevronLeft className="size-4 text-neutral-600 dark:text-neutral-400" data-slot="icon" />
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
        <DescriptionList>
          <DescriptionTerm>Customer</DescriptionTerm>
          <DescriptionDetails>{review.customer.name}</DescriptionDetails>
          <DescriptionTerm>Event</DescriptionTerm>
          <DescriptionDetails>
            <Link href={review.event.url} className="flex items-center gap-2">
              <Avatar src={review.event.thumbUrl} alt={review.event.name} className="size-6" />
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
              <Image 
                src={review.customer.countryFlagUrl} 
                alt={review.customer.country}
                width={20}
                height={15}
                sizes="20px"
              />
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

export default ReviewPage
