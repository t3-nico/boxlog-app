/**
 * ルートレベル Error ページ
 *
 * @description
 * Route Group外でエラーが発生した場合に表示。
 * NextIntlClientProviderが利用できないため、静的テキストを使用。
 *
 * 注意: このページはProvidersの外で動作するため、
 * i18n、Theme、その他のコンテキストは利用不可。
 */
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // エラーをログに記録（Sentryなど）
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:gap-12 md:p-16">
      <Image
        src="https://ui.shadcn.com/placeholder.svg"
        alt="placeholder image"
        width={960}
        height={540}
        priority
        className="aspect-video w-240 rounded-xl object-cover dark:invert"
      />
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Error</h1>
        <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="border-border bg-surface-container mt-4 rounded-xl border p-4 text-left">
            <p className="text-destructive font-mono text-sm">{error.message}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          <Button className="cursor-pointer" onClick={() => reset()}>
            Try Again
          </Button>
          <Button
            variant="outline"
            className="flex cursor-pointer items-center gap-1"
            onClick={() => router.push('/')}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
