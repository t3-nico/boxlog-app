'use client';

import { useCallback, useState } from 'react';

import { format, getWeek } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

import type { CalendarViewType } from '../../../types/calendar.types';

export type MobileNavigationDirection = 'prev' | 'next' | 'today';

interface MobileHeaderProps {
  viewType: CalendarViewType;
  currentDate: Date;
  onNavigate: (direction: MobileNavigationDirection) => void;
  onMenuToggle?: () => void;
  onViewChange?: (view: CalendarViewType) => void;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

/**
 * モバイル用ヘッダー
 * コンパクトな表示でタッチ操作に最適化
 */
export const MobileHeader = ({
  viewType,
  currentDate,
  onNavigate,
  onMenuToggle,
  onViewChange,
  title,
  showBackButton = false,
  onBack,
  className,
}: MobileHeaderProps) => {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateFnsLocale = locale === 'ja' ? ja : enUS;
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 });

  const getViewLabel = (view: CalendarViewType): string => {
    const labels: Record<string, string> = {
      day: t('calendar.mobile.header.viewLabels.day'),
      week: t('calendar.mobile.header.viewLabels.week'),
      agenda: t('calendar.mobile.header.viewLabels.agenda'),
    };
    if (labels[view]) return labels[view];
    // MultiDayView（2day〜9day）
    const match = view.match(/^(\d+)day$/);
    if (match) return t('calendar.views.multiday', { count: parseInt(match[1]!) });
    return view;
  };

  // jsx-no-bind optimization: Navigation handlers
  const handleViewMenuOpen = useCallback(() => {
    setIsViewMenuOpen(true);
  }, []);

  const handleNavigatePrev = useCallback(() => {
    onNavigate('prev');
  }, [onNavigate]);

  const handleNavigateNext = useCallback(() => {
    onNavigate('next');
  }, [onNavigate]);

  const handleViewMenuClose = useCallback(() => {
    setIsViewMenuOpen(false);
  }, []);

  const handleViewMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsViewMenuOpen(false);
    }
  }, []);

  // jsx-no-bind optimization: View change handler creator
  const createViewChangeHandler = useCallback(
    (value: CalendarViewType) => {
      return () => {
        onViewChange?.(value);
        setIsViewMenuOpen(false);
      };
    },
    [onViewChange],
  );

  // 日付の表示形式をモバイル用に短縮（翻訳ファイルから取得）
  const getDateDisplay = () => {
    const withDayOfWeekFormat = tCommon('dates.formats.withDayOfWeek');
    switch (viewType) {
      case 'day':
        return format(currentDate, withDayOfWeekFormat, { locale: dateFnsLocale });
      case 'week':
        // 週表示: "1月 W3" / "Jan W3"
        return locale === 'ja'
          ? `${format(currentDate, 'M月')} W${weekNumber}`
          : `${format(currentDate, 'MMM', { locale: dateFnsLocale })} W${weekNumber}`;
      default:
        return format(currentDate, withDayOfWeekFormat, { locale: dateFnsLocale });
    }
  };

  return (
    <header
      className={cn(
        'bg-background relative h-14',
        'flex items-center justify-between px-4',
        'sticky top-0 z-40',
        className,
      )}
    >
      {/* 左側: メニューボタンまたは戻るボタン */}
      <div className="flex items-center">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="hover:bg-state-hover -ml-2 rounded-full p-2 transition-colors"
            aria-label={t('calendar.mobile.header.back')}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onMenuToggle}
            className="hover:bg-state-hover -ml-2 rounded-full p-2 transition-colors"
            aria-label={t('calendar.mobile.header.openMenu')}
          >
            <Menu className="size-6" />
          </button>
        )}
      </div>

      {/* 中央: 日付とビュー表示 */}
      <div className="flex min-w-0 flex-1 flex-col items-center">
        {title ? (
          <h1 className="truncate text-lg font-bold">{title}</h1>
        ) : (
          <>
            {/* 日付表示 */}
            <div className="text-lg font-bold">{getDateDisplay()}</div>
            {/* ビュー表示 */}
            <button
              type="button"
              onClick={handleViewMenuOpen}
              className="text-muted-foreground hover:bg-state-hover rounded px-2 py-1 text-xs transition-colors"
            >
              {getViewLabel(viewType)}
              {t('calendar.mobile.header.viewSuffix')}
            </button>
          </>
        )}
      </div>

      {/* 右側: ナビゲーション */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleNavigatePrev}
          className="hover:bg-state-hover rounded-full p-2 transition-colors"
          aria-label={t('calendar.mobile.header.prevPeriod')}
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          onClick={handleNavigateNext}
          className="hover:bg-state-hover rounded-full p-2 transition-colors"
          aria-label={t('calendar.mobile.header.nextPeriod')}
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* ビュー切り替えメニュー */}
      {isViewMenuOpen && onViewChange ? (
        <>
          {/* オーバーレイ */}
          <div
            className="bg-overlay fixed inset-0 z-50"
            onClick={handleViewMenuClose}
            onKeyDown={handleViewMenuKeyDown}
            role="button"
            tabIndex={0}
            aria-label={t('calendar.mobile.header.closeMenu')}
          />

          {/* メニュー */}
          <div className="bg-background border-border absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-2xl border shadow-lg">
            <div className="py-2">
              {(['day', 'week', '3day', '5day', 'agenda'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={createViewChangeHandler(value)}
                  className={cn(
                    'hover:bg-state-hover w-full px-4 py-4 text-left text-sm transition-colors',
                    viewType === value && 'bg-state-selected text-foreground font-normal',
                  )}
                >
                  {getViewLabel(value)}
                  {t('calendar.mobile.header.viewSuffix')}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
};
