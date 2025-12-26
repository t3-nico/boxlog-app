'use client';

import { useMemo } from 'react';

import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { TranslatedString } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { SidebarHeading } from './SidebarHeading';

/**
 * ネットワーク条件に基づいてprefetchを有効にするか判断
 * - 遅いネットワーク（2G, slow-2g）では無効
 * - Data Saverモードでは無効
 * - それ以外は有効
 */
function useShouldPrefetch(): boolean {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return true;

    // Network Information API対応チェック
    const connection =
      (navigator as Navigator & { connection?: NetworkInformation }).connection ??
      (navigator as Navigator & { mozConnection?: NetworkInformation }).mozConnection ??
      (navigator as Navigator & { webkitConnection?: NetworkInformation }).webkitConnection;

    if (!connection) return true;

    // 遅いネットワークまたはData Saverモードではprefetch無効
    const slowConnections = ['slow-2g', '2g'];
    if (slowConnections.includes(connection.effectiveType ?? '')) {
      return false;
    }

    if (connection.saveData) {
      return false;
    }

    return true;
  }, []);
}

// Network Information APIの型定義
interface NetworkInformation {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?: boolean;
}

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
  const shouldPrefetch = useShouldPrefetch();

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
                prefetch={shouldPrefetch}
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
