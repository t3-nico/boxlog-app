import Image from 'next/image'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { Banknote, Calendar, ChevronLeft, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'

import { Heading, Subheading } from '@/components/app'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createTranslation, getDictionary } from '@/features/i18n/lib'
import { getReview } from '@/lib/data'
import type { Locale } from '@/types/i18n'

import { RefundReview } from './refund'

interface Review {
  id: string
  amount: { usd: string; cad: string; fee: string; net: string }
  payment: { card: { type: string; number: string; expiry: string }; transactionId: string }
  date: string
  customer: { name: string; email: string; avatar: string; address: string; country: string; countryFlagUrl: string }
  event: { type: string; description: string; url: string; thumbUrl: string; name: string }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale?: Locale }>
}): Promise<Metadata> {
  const { id } = await params
  const review = (await getReview(id)) as Review | null

  return {
    title: review ? `Review #${review.id}` : undefined,
  }
}

const ReviewPage = async ({ params }: { params: Promise<{ id: string; locale?: Locale }> }) => {
  const { id, locale = 'ja' } = await params
  const review = (await getReview(id)) as Review | null
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  if (!review) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <NextLink
          href={`/${locale}/review`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
        >
          <ChevronLeft className="size-4 text-neutral-600 dark:text-neutral-400" data-slot="icon" />
          {t('table.backLinks.reviews')}
        </NextLink>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Heading>Review #{review.id}</Heading>
          <Badge color="lime">{t('table.status.successful')}</Badge>
        </div>
        <div className="isolate mt-3 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-2">
            <span className="flex items-center gap-3 text-base text-neutral-900 sm:text-sm dark:text-neutral-100">
              <Banknote className="size-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
              <span>US{review.amount.usd}</span>
            </span>
            <span className="flex items-center gap-3 text-base text-neutral-900 sm:text-sm dark:text-neutral-100">
              <CreditCard className="size-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
              <span className="inline-flex gap-3">
                {review.payment.card.type}{' '}
                <span>
                  <span aria-hidden="true">••••</span> {review.payment.card.number}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-3 text-base text-neutral-900 sm:text-sm dark:text-neutral-100">
              <Calendar className="size-4 shrink-0 text-neutral-600 dark:text-neutral-400" data-slot="icon" />
              <span>{review.date}</span>
            </span>
          </div>
          <div className="flex gap-4">
            <RefundReview variant="outline" amount={review.amount.usd}>
              {t('table.buttons.refund')}
            </RefundReview>
            <Button>{t('table.buttons.resendInvoice')}</Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Subheading>{t('table.details.summary')}</Subheading>
        <Separator className="mt-4" />
        <dl className="grid grid-cols-1 text-base sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm">
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 first:border-none sm:py-3  dark:text-neutral-200">
            {t('table.details.customer')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 dark:text-neutral-100 sm:">
            {review.customer.name}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:py-3  dark:text-neutral-200">
            {t('table.details.event')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 dark:text-neutral-100 sm:">
            <NextLink href={review.event.url} className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={review.event.thumbUrl} alt={review.event.name} />
                <AvatarFallback>{review.event.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{review.event.name}</span>
            </NextLink>
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:py-3  dark:text-neutral-200">
            {t('table.details.amount')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 dark:text-neutral-100 sm:">
            US{review.amount.usd}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:py-3  dark:text-neutral-200">
            {t('table.details.amountAfterExchange')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 dark:text-neutral-100 sm:">
            US{review.amount.usd} &rarr; CA{review.amount.cad}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:py-3  dark:text-neutral-200">
            {t('table.details.fee')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 dark:text-neutral-100 sm:">
            CA{review.amount.fee}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:py-3  dark:text-neutral-200">
            {t('table.details.net')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 dark:text-neutral-100 sm:">
            CA{review.amount.net}
          </dd>
        </dl>
      </div>
      <div className="mt-12">
        <Subheading>{t('table.details.paymentMethod')}</Subheading>
        <Separator className="mt-4" />
        <dl className="grid grid-cols-1 text-base sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm">
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 first:border-none sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.transactionId')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            {review.payment.transactionId}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.cardNumber')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            •••• {review.payment.card.number}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.cardType')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            {review.payment.card.type}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.cardExpiry')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            {review.payment.card.expiry}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.owner')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            {review.customer.name}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.emailAddress')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            {review.customer.email}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.address')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            {review.customer.address}
          </dd>
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.country')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
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
          <dt className="col-start-1 border-t border-border pt-3 text-neutral-800 sm:border-t sm:border-border sm:py-3  dark:text-neutral-200 sm:">
            {t('table.details.cvc')}
          </dt>
          <dd className="pt-1 pb-3 text-neutral-900 sm:border-t sm:border-border sm:py-3 sm:nth-2:border-none dark:text-neutral-100 sm:">
            <Badge color="lime">{t('table.details.cvcStatus')}</Badge>
          </dd>
        </dl>
      </div>
    </>
  )
}

export default ReviewPage
