'use client';

import { BarChart3, Calendar, CircleCheckBig, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import type { NavTabItem } from './types';

/**
 * サイドバー用ナビゲーション
 *
 * サイドバー下部に配置する縦型ナビゲーション
 * - Calendar / Plan / Record / Stats の切り替え
 */
export function SidebarNavigation() {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale() as 'ja' | 'en';

  const navItems: NavTabItem[] = useMemo(
    () => [
      {
        id: 'calendar',
        icon: Calendar,
        label: t('sidebar.navigation.calendar'),
        url: `/${locale}/calendar`,
      },
      {
        id: 'plan',
        icon: CircleCheckBig,
        label: t('sidebar.navigation.plan'),
        url: `/${locale}/plan`,
      },
      {
        id: 'record',
        icon: Clock,
        label: t('sidebar.navigation.record'),
        url: `/${locale}/record`,
      },
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
