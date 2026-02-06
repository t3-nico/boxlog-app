'use client';

import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Bot, Calendar, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useAIInspectorStore } from '@/features/ai';
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton';
import type { PeriodType } from '@/features/stats/stores';
import { useStatsPeriodStore } from '@/features/stats/stores';

interface StatsLayoutProps {
  children: React.ReactNode;
}

/**
 * 統計ページ専用レイアウト
 *
 * 独自ヘッダー構成（Calendar同様）:
 * [☰][Stats][📅 期間選択▼] ─────────── [🤖][📅✓📊]
 */
export default function StatsLayout({ children }: StatsLayoutProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en';
  const dateLocale = localeFromPath === 'ja' ? ja : undefined;
  const openAIInspector = useAIInspectorStore((state) => state.openInspector);

  const { periodType, startDate, endDate, setPeriodType } = useStatsPeriodStore();

  // 日付範囲のフォーマット
  const formatDateRange = () => {
    const formatOptions = dateLocale ? { locale: dateLocale } : {};
    if (isSameDay(startDate, endDate)) {
      return format(startDate, 'M/d (E)', formatOptions);
    }
    return `${format(startDate, 'M/d', formatOptions)} - ${format(endDate, 'M/d', formatOptions)}`;
  };

  // 期間タイプの選択肢
  const periodOptions: { value: PeriodType; label: string }[] = [
    { value: 'today', label: t('stats.toolbar.today') },
    { value: 'week', label: t('stats.toolbar.thisWeek') },
    { value: 'month', label: t('stats.toolbar.thisMonth') },
    { value: 'year', label: t('stats.toolbar.thisYear') },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* 独自ヘッダー（48px固定） */}
      <header className="flex h-12 shrink-0 items-center justify-between px-4">
        {/* 左: モバイルメニュー + タイトル + 期間セレクター */}
        <div className="flex items-center gap-2">
          <MobileMenuButton className="md:hidden" />
          <h1 className="text-lg font-bold">{t('stats.sidebar.overview')}</h1>

          {/* 期間セレクター（GA4スタイル） */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-2">
                <Calendar className="size-4" />
                <span className="font-normal">{formatDateRange()}</span>
                <ChevronDown className="text-muted-foreground size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {periodOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setPeriodType(option.value)}
                  className={periodType === option.value ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Calendar className="mr-2 size-4" />
                {t('stats.toolbar.customRange')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 右: AIボタン（PC版のみ） */}
        <HoverTooltip content={t('aria.openAIAssistant')} side="bottom">
          <Button
            onClick={() => openAIInspector()}
            size="icon"
            variant="ghost"
            aria-label={t('aria.openAIAssistant')}
            className="text-muted-foreground hover:text-foreground hidden shrink-0 md:flex"
          >
            <Bot className="size-5" />
          </Button>
        </HoverTooltip>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
    </div>
  );
}
