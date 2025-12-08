/**
 * ルートレベル Not Found ページ
 *
 * @description
 * Route Group外で404エラーが発生した場合に表示。
 * NextIntlClientProviderが利用できないため、静的テキストを使用。
 *
 * 注意: このページはProvidersの外で動作するため、
 * i18n、Theme、その他のコンテキストは利用不可。
 */
'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function RootNotFound() {
  const router = useRouter()

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
        <h1 className="mb-4 text-3xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          <Button className="cursor-pointer" onClick={() => router.push('/')}>
            Go Home
          </Button>
          <Button
            variant="outline"
            className="flex cursor-pointer items-center gap-1"
            onClick={() => (window.location.href = 'mailto:support@boxlog.com')}
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}
