'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:gap-12 md:p-16">
      <Image
        src="https://ui.shadcn.com/placeholder.svg"
        alt="placeholder image"
        width={960}
        height={540}
        className="aspect-video w-240 rounded-xl object-cover dark:invert"
      />
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">{t('errors.401.title')}</h1>
        <h2 className="mb-4 text-2xl font-semibold">{t('errors.401.heading')}</h2>
        <p className="text-muted-foreground">{t('errors.401.description')}</p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          <Button className="cursor-pointer" onClick={() => router.push('/')}>
            {t('errors.401.secondaryAction')}
          </Button>
          <Button
            variant="outline"
            className="flex cursor-pointer items-center gap-1"
            onClick={() => router.push('/auth/login')}
          >
            {t('errors.401.action')}
          </Button>
        </div>
      </div>
    </div>
  )
}
