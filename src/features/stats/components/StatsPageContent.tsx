'use client';

import { useTranslations } from 'next-intl';

import { FeatureErrorBoundary } from '@/components/error-boundary';
import type { AsideType } from '@/components/layout/AppAside';
import { AppHeader } from '@/components/layout/AppHeader';
import { ResizableAsidePanel } from '@/components/layout/ResizableAsidePanel';
import { Tabs, TabsContent, TabsList, UnderlineTabsTrigger } from '@/components/ui/tabs';
import { DateNavigator } from '@/core/components/DateNavigator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLayoutStore } from '@/stores/useLayoutStore';

import type { StatsGranularity, StatsTab } from '../stores/useStatsFilterStore';
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
 * Overview / Insights の2タブ構成。
 * CalendarLayout と同じヘッダー + Aside 構造を持つ。
 */
export function StatsPageContent({ renderAsideContent, headerSlot }: StatsPageContentProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // アサイド状態（Zustand永続化）
  const currentAside = useLayoutStore.use.asideType();
  const setCurrentAside = useLayoutStore.use.setAside();

  // Stats ナビゲーション
  const activeTab = useStatsFilterStore((s) => s.activeTab);
  const setActiveTab = useStatsFilterStore((s) => s.setActiveTab);
  const granularity = useStatsFilterStore((s) => s.granularity);
  const currentDate = useStatsFilterStore((s) => s.currentDate);
  const setGranularity = useStatsFilterStore((s) => s.setGranularity);
  const navigate = useStatsFilterStore((s) => s.navigate);

  const todayLabel = t(TODAY_LABEL_KEYS[granularity]);
  const isOverview = activeTab === 'overview';

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
            isOverview ? (
              <>
                <DateNavigator onNavigate={navigate} todayLabel={todayLabel} arrowSize="md" />
                <StatsGranularitySelector
                  className="ml-4"
                  granularity={granularity}
                  onGranularityChange={setGranularity}
                />
              </>
            ) : undefined
          }
          rightSlot={headerSlot}
          aside={{ currentAside, onAsideChange: setCurrentAside }}
        >
          <StatsDateDisplay currentDate={currentDate} granularity={granularity} />
        </AppHeader>

        {/* タブバー */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as StatsTab)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="h-10 w-full justify-start gap-4 rounded-none border-none bg-transparent px-4">
            <UnderlineTabsTrigger value="overview" className="text-base">
              {t('calendar.stats.tabOverview')}
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="insights" className="text-base">
              {t('calendar.stats.tabInsights')}
            </UnderlineTabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex min-h-0 flex-1 flex-col">
            <FeatureErrorBoundary featureName="stats">
              <StatsView />
            </FeatureErrorBoundary>
          </TabsContent>

          <TabsContent value="insights" className="flex min-h-0 flex-1 flex-col">
            <div className="text-muted-foreground flex flex-1 items-center justify-center">
              <p className="text-sm">Insights — coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </ResizableAsidePanel>
    </div>
  );
}
