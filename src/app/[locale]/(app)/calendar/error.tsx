'use client';

import { useEffect } from 'react';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * カレンダーページ用エラーバウンダリ
 *
 * SSR prefetch失敗時やランタイムエラー時に表示される。
 * FeatureErrorBoundary（クライアント側）より上位で捕捉。
 */
export default function CalendarError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Calendar Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8">
      <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive size-8" />
      </div>

      <div className="max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold">カレンダーの読み込みに失敗しました</h2>
        <p className="text-muted-foreground text-sm">
          ネットワーク接続を確認して、もう一度お試しください。
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="border-border bg-surface-container mt-4 rounded-lg border p-4 text-left">
            <p className="text-destructive font-mono text-xs">{error.message}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={reset} variant="primary">
          再読み込み
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          ページをリロード
        </Button>
      </div>
    </div>
  );
}
