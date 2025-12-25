'use client';

import { useEffect, useState } from 'react';

import { RefreshCw } from 'lucide-react';

import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * Service Worker プロバイダー
 *
 * Service Workerの登録と更新通知UIを提供
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // 更新が利用可能になったらバナーを表示
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateBanner(true);
    }
  }, [updateAvailable]);

  return (
    <>
      {children}

      {/* 更新バナー */}
      {showUpdateBanner && (
        <div className="animate-in slide-in-from-bottom-4 fixed right-4 bottom-20 z-50 md:bottom-4">
          <div className="bg-card border-border flex items-center gap-3 rounded-lg border p-4 shadow-lg">
            <RefreshCw className="text-primary h-5 w-5" />
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">アップデートがあります</p>
              <p className="text-muted-foreground text-xs">再読み込みして最新版を適用</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowUpdateBanner(false)}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                後で
              </button>
              <button
                type="button"
                onClick={applyUpdate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
