import { redirect } from 'next/navigation';

import type { Locale } from '@/platform/i18n';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

// ロケール付きのホームページ
export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/calendar/day`);
}

// 静的生成無効化
export const dynamic = 'force-dynamic';
