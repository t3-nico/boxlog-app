'use client';

import { X, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

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
  const chronotype = useCalendarSettingsStore((state) => state.chronotype);
  const openModal = useSettingsModalStore((state) => state.openModal);

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
    openModal('personalization');
  }, [openModal]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn('bg-accent flex items-center justify-between px-4 py-2', 'text-xs')}
      role="banner"
      aria-label={t('banner.ariaLabel')}
    >
      <div className="flex items-center gap-2">
        <Zap className="text-accent-foreground h-3.5 w-3.5" />
        <span className="text-accent-foreground">{t('banner.message')}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="primary" size="sm" onClick={handleSetup} className="h-6 px-2 text-xs">
          {t('banner.setup')}
        </Button>
        <Button
          variant="ghost"
          icon
          onClick={handleDismiss}
          className="text-accent-foreground/70 hover:text-accent-foreground hover:bg-accent-foreground/10 h-6 w-6"
          aria-label={t('banner.dismiss')}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
