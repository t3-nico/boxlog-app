import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface SettingsPageProps {
  params: { locale: Locale }
}

/**
 * 設定トップページ
 * Next.js公式: Server Componentでredirect()使用
 */
export default async function SettingsIndexPage({ params }: SettingsPageProps) {
  const { locale } = await params
  redirect(`/${locale}/settings/account`)
}
