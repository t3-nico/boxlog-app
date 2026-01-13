'use client';

import { BarChart3, Calendar, CircleCheckBig } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { NavigationTabItem } from './NavigationTabItem';
import type { NavTabItem } from './types';

/**
 * ナビゲーションタブ
 *
 * PageHeader中央に配置する水平タブナビゲーション
 * - Calendar / Inbox / Stats の切り替え
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
        id: 'inbox',
        icon: CircleCheckBig,
        label: t('sidebar.navigation.inbox'),
        url: `/${locale}/inbox`,
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
      className="bg-surface-container border-border flex h-10 items-center rounded-full border p-1"
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
