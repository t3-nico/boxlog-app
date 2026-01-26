'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * PlanSidebarList - Plan用ナビゲーション
 */
export function PlanSidebarList() {
  const t = useTranslations('plan.sidebar.list');
  const pathname = usePathname();
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en';

  const baseUrl = `/${localeFromPath}/plan`;

  // アクティブ判定
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  // ナビゲーションアイテム
  const navItems: NavItem[] = [
    {
      href: baseUrl,
      label: t('nav.plan'),
      icon: <ClipboardList className="size-4" />,
    },
  ];

  return (
    <nav className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-2 py-2">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch={true}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-state-selected text-foreground'
                  : 'text-muted-foreground hover:bg-state-hover',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
