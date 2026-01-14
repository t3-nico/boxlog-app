'use client';

import { X, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';

const STORAGE_KEY = 'onboarding-banner-dismissed';

/**
 * オンボーディングバナー
 *
 * - クロノタイプ未設定の場合にカレンダー上部に表示
 * - 「設定する」→ 設定ページへ遷移
 * - 「×」→ バナーを閉じる（localStorageで記憶）
 */
export function OnboardingBanner() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const locale = useLocale();
  const chronotype = useCalendarSettingsStore((state) => state.chronotype);

  const [isDismissed, setIsDismissed] = useState(true); // 初期値はtrue（SSR対策）
  const [isVisible, setIsVisible] = useState(false);

  // クライアントサイドでlocalStorageをチェック
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsDismissed(dismissed);
  }, []);

  // 表示条件: クロノタイプ未設定 AND 未dismiss
  useEffect(() => {
    const isChronotypeSet = chronotype?.enabled && chronotype?.type;
    setIsVisible(!isChronotypeSet && !isDismissed);
  }, [chronotype, isDismissed]);

  const handleSetup = useCallback(() => {
    router.push(`/${locale}/settings/personalization`);
  }, [router, locale]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-surface-container border-border flex items-center justify-between border-b px-4 py-2',
        'text-sm',
      )}
      role="banner"
      aria-label={t('banner.ariaLabel')}
    >
      <div className="flex items-center gap-2">
        <Zap className="text-primary h-4 w-4" />
        <span className="text-foreground">{t('banner.message')}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleSetup} className="h-7 text-xs">
          {t('banner.setup')}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-7 w-7"
          aria-label={t('banner.dismiss')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
