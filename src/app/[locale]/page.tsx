import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface PageProps {
  params: { locale: Locale }
}

// ロケール付きのホームページ
export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params
  // カレンダーページにリダイレクト
  redirect(`/${locale}/calendar`)
}

// 静的生成無効化
export const dynamic = 'force-dynamic'
