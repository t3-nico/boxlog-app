'use client';

import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface NavTabItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  url: string;
}

/**
 * サイドバー用ナビゲーション
 *
 * PC: Calendar/Plan/Record はカレンダー+サイドパネルに統合済み。
 * ここには Stats など独立ページへのリンクのみ配置。
 */
export function SidebarNavigation() {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale() as 'ja' | 'en';

  const navItems: NavTabItem[] = useMemo(
    () => [
      {
        id: 'stats',
        icon: BarChart3,
        label: t('sidebar.navigation.stats'),
        url: `/${locale}/stats`,
      },
    ],
    [t, locale],
  );

  return (
    <nav className="flex flex-col gap-1 px-2 py-2" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.url) ?? false;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.url}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-state-active text-state-active-foreground font-medium'
                : 'text-muted-foreground hover:bg-state-hover hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
