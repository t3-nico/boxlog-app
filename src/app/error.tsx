'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    // エラーをログに記録（Sentryなど）
    console.error('Application error:', error)
  }, [error])

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
        <h1 className="mb-4 text-3xl font-bold">{t('error.500.title')}</h1>
        <h2 className="mb-4 text-2xl font-semibold">{t('error.500.heading')}</h2>
        <p className="text-muted-foreground">{t('error.500.description')}</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="border-border bg-muted mt-4 rounded-xl border p-4 text-left">
            <p className="text-destructive font-mono text-sm">{error.message}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          <Button className="cursor-pointer" onClick={() => reset()}>
            {t('error.common.reload')}
          </Button>
          <Button variant="outline" className="flex cursor-pointer items-center gap-1" onClick={() => router.push('/')}>
            {t('error.common.goHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
