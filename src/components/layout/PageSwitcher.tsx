'use client';

import { BarChart3, CalendarDays } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { HoverTooltip } from '@/components/ui/tooltip';
import { isCalendarViewPath } from '@/features/calendar';
import { cn } from '@/lib/utils';

interface PageSwitcherProps {
  className?: string;
}

/**
 * ページ切替アイコンタブ（Calendar / Stats）
 *
 * ヘッダー右側に配置し、CalendarとStatsの2セクションを切り替える。
 * アクティブ状態は bg-muted でハイライト。
 */
export function PageSwitcher({ className }: PageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activePage = useMemo(() => {
    // locale部分を除去してパス判定
    const segments = pathname?.split('/') ?? [];
    // as-needed: デフォルトlocale(en)はプレフィックスなし、ja は /ja/... 形式
    const pathWithoutLocale =
      segments.length >= 2 && (segments[1] === 'ja' || segments[1] === 'en')
        ? '/' + segments.slice(2).join('/')
        : (pathname ?? '/');

    if (isCalendarViewPath(pathWithoutLocale)) return 'calendar' as const;
    if (pathWithoutLocale.startsWith('/stats')) return 'stats' as const;
    return 'calendar' as const;
  }, [pathname]);

  return (
    <div
      className={cn(
        'border-border flex items-center gap-0.5 rounded-lg border px-1 py-0.5',
        className,
      )}
      role="tablist"
      aria-label="Page navigation"
    >
      <HoverTooltip content="Calendar" side="bottom">
        <button
          role="tab"
          aria-selected={activePage === 'calendar'}
          aria-label="Calendar"
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-md transition-colors',
            activePage === 'calendar'
              ? 'bg-primary-state-selected text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
          onClick={() => activePage !== 'calendar' && router.push('/calendar/day')}
        >
          <CalendarDays className="size-4" />
        </button>
      </HoverTooltip>
      <HoverTooltip content="Stats" side="bottom">
        <button
          role="tab"
          aria-selected={activePage === 'stats'}
          aria-label="Stats"
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-md transition-colors',
            activePage === 'stats'
              ? 'bg-primary-state-selected text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
          onClick={() => activePage !== 'stats' && router.push('/stats')}
        >
          <BarChart3 className="size-4" />
        </button>
      </HoverTooltip>
    </div>
  );
}
