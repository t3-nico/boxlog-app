import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface AuthPageProps {
  params: { locale: Locale }
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale } = await params
  redirect(`/${locale}/auth/login`)
}
