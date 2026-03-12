import { redirect } from 'next/navigation';

import type { Locale } from '@/platform/i18n';

interface AuthPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/auth/login`);
}
