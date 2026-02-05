'use client';

import { BarChart3, Calendar, CircleCheckBig, Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { NavigationTabItem } from './NavigationTabItem';
import type { NavTabItem } from './types';

/**
 * ナビゲーションタブ
 *
 * PageHeader中央に配置する水平タブナビゲーション
 * - Calendar / Plan / Record / Stats の切り替え
 */
export function NavigationTabs() {
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
    <nav
      className="bg-surface-container ring-border flex h-10 items-center rounded-full p-1 ring-1 ring-inset"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <NavigationTabItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          url={item.url}
          isActive={pathname?.startsWith(item.url) ?? false}
        />
      ))}
    </nav>
  );
}
