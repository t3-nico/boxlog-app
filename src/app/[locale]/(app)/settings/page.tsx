'use client';

import { Link, useRouter } from '@/platform/i18n/navigation';
import { useEffect } from 'react';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ScrollArea } from '@/components/ui/scroll-area';
import { SETTINGS_CATEGORIES } from '@/features/settings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MEDIA_QUERIES } from '@/lib/breakpoints';

/**
 * 設定ページのルート
 *
 * PC: /settings/profile にリダイレクト
 * Mobile: カテゴリリスト表示
 */
export default function SettingsPage() {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);
  const t = useTranslations();
  const router = useRouter();

  // PC: デフォルトカテゴリにリダイレクト
  useEffect(() => {
    if (!isMobile) {
      router.replace('/settings/profile');
    }
  }, [isMobile, router]);

  if (!isMobile) {
    return null;
  }

  // Mobile: カテゴリリスト表示
  return (
    <>
      <header className="border-border flex h-14 shrink-0 items-center border-b px-4">
        <h1 className="text-lg font-bold">{t('settings.dialog.title')}</h1>
      </header>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/settings/${category.id}`}
                className="text-foreground hover:bg-state-hover active:bg-state-hover flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-sm transition-colors"
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1 font-normal">{t(category.labelKey)}</span>
                <ChevronRight className="text-muted-foreground size-4" />
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </>
  );
}
