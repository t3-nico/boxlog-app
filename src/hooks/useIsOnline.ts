import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * オンライン状態を監視するシンプルなhook
 *
 * @example
 * ```tsx
 * const isOnline = useIsOnline()
 *
 * if (!isOnline && isLoading) {
 *   return <OfflineLoadingFallback />
 * }
 * ```
 *
 * @returns オンライン状態
 */
export function useIsOnline(): boolean {
  // SSR対応: サーバーサイドではtrue（オンライン）と仮定
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // クライアントサイドでのみnavigator.onLineを使用
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * useSyncExternalStore版（React 18+推奨）
 * より正確な状態同期が可能
 */
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // SSRではオンラインと仮定
}

export function useIsOnlineSync(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
