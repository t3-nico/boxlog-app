'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';
import { SETTINGS_CATEGORIES } from '@/features/settings/constants';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

/**
 * 設定ページ用サイドバー
 *
 * SidebarShellを使用して他のfeatureと統一された構造を持つ。
 * カテゴリリストを表示し、選択中のカテゴリをハイライト。
 */
export function SettingsSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  // 現在のカテゴリを判定
  const currentCategory = SETTINGS_CATEGORIES.find((cat) =>
    pathname?.includes(`/settings/${cat.id}`),
  )?.id;

  return (
    <SidebarShell>
      {/* カテゴリリスト */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-1">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = currentCategory === category.id;
            const href = `/${locale}/settings/${category.id}`;

            return (
              <Link
                key={category.id}
                href={href}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-state-selected text-foreground'
                    : 'text-muted-foreground hover:bg-state-hover',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4 shrink-0" />
                <span className="font-normal">{t(category.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </SidebarShell>
  );
}
