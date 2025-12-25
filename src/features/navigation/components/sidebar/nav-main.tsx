'use client';

import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { TranslatedString } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { SidebarHeading } from './SidebarHeading';

export function NavMain({
  items,
}: {
  items: {
    title: TranslatedString;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2">
      {/* Navigation Items */}
      <div className="flex flex-col">
        <SidebarHeading>{t('sidebar.views')}</SidebarHeading>
        <div className="flex flex-col">
          {items.map((item) => {
            // パス比較: 両方のパスを正規化して比較
            const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
            return (
              <Link
                key={item.title}
                href={item.url}
                prefetch={true}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-state-active text-state-active-foreground'
                    : 'hover:bg-state-hover',
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
