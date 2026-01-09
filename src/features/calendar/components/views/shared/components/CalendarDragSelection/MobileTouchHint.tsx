'use client';

/**
 * モバイルタッチ操作のヒント表示コンポーネント
 *
 * 初回モバイルアクセス時にロングプレス操作のヒントを表示
 * localStorage で表示済みフラグを管理
 */

import { memo, useCallback, useEffect, useState } from 'react';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'calendar-mobile-hint-dismissed';

interface MobileTouchHintProps {
  className?: string;
}

export const MobileTouchHint = memo(function MobileTouchHint({ className }: MobileTouchHintProps) {
  const t = useTranslations('calendar');
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // モバイルでない場合は表示しない
    if (!isMobile) {
      setIsVisible(false);
      return undefined;
    }

    // localStorage から表示済みフラグを確認
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // 少し遅延させて表示（初期レンダリング後）
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage アクセスエラーは無視
    }
    return undefined;
  }, [isMobile]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage アクセスエラーは無視
    }
  }, []);

  // 自動的に5秒後に非表示
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed right-4 bottom-20 left-4 z-50',
        'bg-primary text-primary-foreground',
        'rounded-lg px-4 py-3 shadow-lg',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{t('mobile.touchHint.title')}</p>
          <p className="mt-1 text-xs opacity-90">{t('mobile.touchHint.description')}</p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label={t('actions.close')}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
});
