import { redirect } from 'next/navigation'

import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

import { CalendarViewClient } from './client'

interface CalendarViewPageProps {
  params: {
    view: string
    locale?: Locale
  }
  searchParams: {
    date?: string
  }
}

// 有効なビュータイプかチェック
function isValidViewType(view: string): view is CalendarViewType {
  const validTypes: CalendarViewType[] = ['day', '3day', '5day', 'week', '2week', 'agenda']

  return validTypes.includes(view as CalendarViewType)
}

const CalendarViewPage = async ({ params, searchParams }: CalendarViewPageProps) => {
  const { view, locale = 'ja' } = await params
  const { date } = await searchParams

  // 有効なビュータイプかチェック
  if (!isValidViewType(view)) {
    redirect(`/${locale}/calendar/day`)
  }

  // 日付パラメータの解析
  let initialDate: Date | undefined
  if (date) {
    const parsedDate = new Date(date)
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate
    }
  }

  // サーバーサイドで翻訳辞書を取得
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  // 翻訳テキストを抽出
  const translations = {
    errorTitle: t('calendar.errors.loadFailed'),
    errorMessage: t('calendar.errors.displayFailed'),
    reloadButton: t('common.reload'),
  }

  return <CalendarViewClient view={view} initialDate={initialDate ?? null} translations={translations} />
}

export default CalendarViewPage
