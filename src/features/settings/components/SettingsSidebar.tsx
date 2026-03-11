'use client';

import { usePathname } from 'next/navigation';

import { Link } from '@/i18n/navigation';

import { useTranslations } from 'next-intl';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { SETTINGS_CATEGORIES } from '../constants';

interface SettingsSidebarProps {
  className?: string;
}

/**
 * 設定サイドバー
 *
 * カテゴリナビゲーションを表示（Link ベース）
 * ルーティングページとダイアログの両方で再利用
 */
export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname() ?? '/';

  // パスからカテゴリを抽出: /[locale]/settings/[category] or /settings/[category]
  const currentCategory = pathname.split('/settings/')[1]?.split('/')[0] ?? 'profile';

  return (
    <aside className={cn('bg-surface-container flex flex-col', className)}>
      <div className="flex h-12 items-center px-6 pt-4">
        <h2 className="text-lg font-bold">{t('settings.dialog.title')}</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = currentCategory === category.id;

            return (
              <Link
                key={category.id}
                href={`/settings/${category.id}`}
                className={cn(
                  'flex w-full items-center gap-4 rounded-lg px-4 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-state-selected text-foreground'
                    : 'text-muted-foreground hover:bg-state-hover',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="font-normal">{t(category.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
