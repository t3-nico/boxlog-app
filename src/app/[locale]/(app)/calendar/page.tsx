import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface CalendarPageProps {
  params: { locale: Locale }
}

export default function CalendarPage({ params: { locale } }: CalendarPageProps) {
  const [today] = new Date().toISOString().split('T') // YYYY-MM-DD
  redirect(`/${locale}/calendar/day?date=${today}`)
}
