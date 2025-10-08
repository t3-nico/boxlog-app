import { GalleryVerticalEnd } from 'lucide-react'

import { AuthPageLayout, LoginForm } from '@/features/auth'
import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

interface PageProps {
  params: { locale?: Locale }
}

const LoginPage = async ({ params }: PageProps) => {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  return (
    <AuthPageLayout
      logo={
        <>
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          BoxLog
        </>
      }
      backgroundGradient="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"
      emoji="📦"
      title={t('auth.welcome.title')}
      description={t('auth.welcome.description')}
    >
      <LoginForm />
    </AuthPageLayout>
  )
}

export default LoginPage
