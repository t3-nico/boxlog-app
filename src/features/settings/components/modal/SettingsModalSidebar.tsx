'use client';

import { useTranslations } from 'next-intl';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { SETTINGS_CATEGORIES } from '../../constants';
import { useSettingsModalStore } from '../../stores/useSettingsModalStore';

interface SettingsModalSidebarProps {
  className?: string;
}

/**
 * 設定モーダルのサイドバー
 *
 * カテゴリナビゲーションを表示
 */
export function SettingsModalSidebar({ className }: SettingsModalSidebarProps) {
  const t = useTranslations();
  const selectedCategory = useSettingsModalStore((state) => state.selectedCategory);
  const setCategory = useSettingsModalStore((state) => state.setCategory);

  return (
    <aside className={cn('bg-card flex flex-col', className)}>
      <div className="flex h-12 items-center px-4">
        <h2 className="text-lg font-bold">{t('settings.dialog.title')}</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategory(category.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-state-selected text-foreground'
                    : 'text-muted-foreground hover:bg-state-hover',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="font-normal">{t(category.labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
