import { GalleryVerticalEnd } from 'lucide-react'

import { LoginForm } from '@/features/auth'
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white">
              <GalleryVerticalEnd className="size-4" />
            </div>
            BoxLog
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-neutral-200 lg:block dark:bg-neutral-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20">
          <div className="flex h-full items-center justify-center p-8">
            <div className="flex flex-col gap-4 text-center">
              <div className="text-6xl font-bold text-neutral-600 opacity-60 dark:text-neutral-400">📦</div>
              <h2 className="text-3xl font-bold text-neutral-600 dark:text-neutral-400">{t('auth.welcome.title')}</h2>
              <p className="max-w-md text-lg text-neutral-600 opacity-80 dark:text-neutral-400">
                {t('auth.welcome.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
