'use client';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { NotificationDropdown } from '@/features/notifications';
import { PlanCreateTrigger } from '@/features/plans/components/shared/PlanCreateTrigger';
import { Moon, Plus, Search, Sun } from 'lucide-react';
import { useCallback } from 'react';
import { Item } from './Item';

interface ActionsProps {
  onSearch: () => void;
  onToggleTheme: (theme: 'light' | 'dark') => void;
  resolvedTheme: 'light' | 'dark' | undefined;
  t: (key: string) => string;
}

/**
 * AppBarアクションセクション
 *
 * Search、Theme、Notificationsのアクションボタンを表示
 * useCallbackを使用してjsx-no-bind警告を回避
 */
export function Actions({ onSearch, onToggleTheme, resolvedTheme, t }: ActionsProps) {
  // useCallbackでイベントハンドラを定義（jsx-no-bind対策）
  const handleSearchClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSearch();
    },
    [onSearch],
  );

  const handleThemeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onToggleTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    },
    [onToggleTheme, resolvedTheme],
  );

  return (
    <div className="flex flex-col items-center gap-1 px-2" onClick={(e) => e.stopPropagation()}>
      <HoverTooltip content={t('actions.create')} side="right">
        <div>
          <PlanCreateTrigger
            triggerElement={
              <Button variant="ghost" size="icon" aria-label={t('actions.create')}>
                <Plus className="h-6 w-6 shrink-0" aria-hidden="true" />
              </Button>
            }
          />
        </div>
      </HoverTooltip>
      <HoverTooltip content={t('notification.title')} side="right">
        <div className="flex items-center justify-center">
          <NotificationDropdown />
        </div>
      </HoverTooltip>
      <Item
        icon={Search}
        label={t('actions.search')}
        url="#"
        isActive={false}
        onClick={handleSearchClick}
      />
      <Item
        icon={resolvedTheme === 'light' ? Moon : Sun}
        label={t('sidebar.theme')}
        url="#"
        isActive={false}
        onClick={handleThemeClick}
      />
    </div>
  );
}
