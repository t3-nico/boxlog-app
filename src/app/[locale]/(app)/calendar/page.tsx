import { format } from 'date-fns';
import { redirect } from 'next/navigation';

import type { Locale } from '@/lib/i18n';

interface CalendarPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ date?: string }>;
}

/**
 * カレンダールートページ
 *
 * /calendar → /day?date=today にリダイレクト（後方互換）
 */
export default async function CalendarPage({ params, searchParams }: CalendarPageProps) {
  const { locale } = await params;
  const { date } = await searchParams;

  // 日付パラメータがなければ今日の日付を使用
  const dateString = date || format(new Date(), 'yyyy-MM-dd');
  redirect(`/${locale}/day?date=${dateString}`);
}
