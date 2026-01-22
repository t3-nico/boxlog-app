'use client';

import { WifiOff } from 'lucide-react';

/**
 * オフラインフォールバックページ
 *
 * Service Workerがオフライン時に表示
 */
export default function OfflinePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <WifiOff className="text-muted-foreground h-10 w-10" />
        </div>
        <h1 className="text-foreground mb-2 text-2xl font-bold">オフラインです</h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          インターネットに接続されていません。接続を確認してからもう一度お試しください。
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center justify-center rounded-xl px-6 py-3 font-normal transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
