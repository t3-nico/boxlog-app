'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BarChart3 } from 'lucide-react';

import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * 統計ページ専用サイドバー
 *
 * 現在は「概要」のみのシンプル構成
 * 将来的に機能が増えたらセクション分けを検討
 */
export function StatsSidebar() {
  const pathname = usePathname();
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en';
  const t = useTranslations();

  const baseUrl = `/${localeFromPath}/stats`;

  // 現在のパスがアクティブかどうかを判定
  const isActive = (href: string) => {
    return pathname === href || pathname === baseUrl;
  };

  // ナビゲーションアイテム（フラットリスト）
  const navItems: NavItem[] = [
    {
      href: baseUrl,
      label: t('stats.sidebar.overview'),
      icon: <BarChart3 className="size-4" />,
    },
  ];

  return (
    <SidebarShell>
      {/* Navigation */}
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
    </SidebarShell>
  );
}
