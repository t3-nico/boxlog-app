'use client';

import { useTranslations } from 'next-intl';

import { DateNavigator } from '@/components/common/DateNavigator';
import { FeatureErrorBoundary } from '@/components/common/error-boundary';
import { Tabs, TabsContent, TabsList, UnderlineTabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/shell/components/AppHeader';

import type { StatsGranularity, StatsTab } from '../stores/useStatsFilterStore';
import { useStatsFilterStore } from '../stores/useStatsFilterStore';
import { InsightsView } from './insights/InsightsView';
import { StatsDateDisplay } from './layout/StatsDateDisplay';
import { StatsGranularitySelector } from './layout/StatsGranularitySelector';
import { StatsView } from './StatsView';

interface StatsPageContentProps {
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
 */
export function StatsPageContent({ headerSlot }: StatsPageContentProps) {
  const t = useTranslations();

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
          <FeatureErrorBoundary featureName="stats-insights">
            <InsightsView />
          </FeatureErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
