'use client';

import { useTranslations } from 'next-intl';

import { FeatureErrorBoundary } from '@/components/error-boundary';
import type { AsideType } from '@/components/layout/AppAside';
import { AppHeader } from '@/components/layout/AppHeader';
import { ResizableAsidePanel } from '@/components/layout/ResizableAsidePanel';
import { DateNavigator } from '@/core/components/DateNavigator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLayoutStore } from '@/stores/useLayoutStore';

import type { StatsGranularity } from '../stores/useStatsFilterStore';
import { useStatsFilterStore } from '../stores/useStatsFilterStore';
import { StatsDateDisplay } from './layout/StatsDateDisplay';
import { StatsGranularitySelector } from './layout/StatsGranularitySelector';
import { StatsView } from './StatsView';

interface StatsPageContentProps {
  /** アサイドパネルのコンテンツレンダラー（page.tsxから注入） */
  renderAsideContent?: (asideType: AsideType) => React.ReactNode;
  /** ヘッダー右側のカスタムスロット（PageSwitcher など） */
  headerSlot?: React.ReactNode;
}

const TODAY_LABEL_KEYS: Record<StatsGranularity, string> = {
  day: 'common.time.today',
  week: 'common.time.thisWeek',
  month: 'common.time.thisMonth',
  year: 'calendar.stats.thisYear',
};

/**
 * Stats ページのクライアントエントリポイント
 *
 * CalendarController を経由せず、Stats を直接レンダリングする。
 * CalendarLayout と同じヘッダー + Aside 構造を持つ。
 */
export function StatsPageContent({ renderAsideContent, headerSlot }: StatsPageContentProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // アサイド状態（Zustand永続化）
  const currentAside = useLayoutStore.use.asideType();
  const setCurrentAside = useLayoutStore.use.setAside();

  // Stats ナビゲーション
  const granularity = useStatsFilterStore((s) => s.granularity);
  const currentDate = useStatsFilterStore((s) => s.currentDate);
  const setGranularity = useStatsFilterStore((s) => s.setGranularity);
  const navigate = useStatsFilterStore((s) => s.navigate);

  const todayLabel = t(TODAY_LABEL_KEYS[granularity]);

  return (
    <div className="bg-background flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ResizableAsidePanel
        asideType={currentAside}
        onAsideChange={setCurrentAside}
        renderContent={renderAsideContent ?? (() => null)}
        isMobile={isMobile}
      >
        {/* ヘッダー */}
        <AppHeader
          controls={
            <>
              <DateNavigator onNavigate={navigate} todayLabel={todayLabel} arrowSize="md" />
              <StatsGranularitySelector
                className="ml-4"
                granularity={granularity}
                onGranularityChange={setGranularity}
              />
            </>
          }
          rightSlot={headerSlot}
          aside={{ currentAside, onAsideChange: setCurrentAside }}
        >
          <StatsDateDisplay currentDate={currentDate} granularity={granularity} />
        </AppHeader>

        {/* Stats コンテンツ */}
        <FeatureErrorBoundary featureName="stats">
          <StatsView />
        </FeatureErrorBoundary>
      </ResizableAsidePanel>
    </div>
  );
}
