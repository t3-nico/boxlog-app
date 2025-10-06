import { redirect } from 'next/navigation'

import type { Locale } from '@/types/i18n'

interface AuthPageProps {
  params: { locale: Locale }
}

export default function AuthPage({ params: { locale } }: AuthPageProps) {
  redirect(`/${locale}/auth/login`)
}
