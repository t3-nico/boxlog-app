import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface PageProps {
  params: { locale: Locale }
}

// ロケール付きのホームページ
export default function LocaleHomePage({ params: { locale } }: PageProps) {
  // カレンダーページにリダイレクト
  redirect(`/${locale}/calendar`)
}

// 静的生成無効化
export const dynamic = 'force-dynamic'
