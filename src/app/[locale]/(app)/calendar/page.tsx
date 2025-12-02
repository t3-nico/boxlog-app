import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface CalendarPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { locale } = await params
  const [today] = new Date().toISOString().split('T') // YYYY-MM-DD
  redirect(`/${locale}/calendar/day?date=${today}`)
}
