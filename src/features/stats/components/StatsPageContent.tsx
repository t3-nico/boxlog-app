'use client';

import { FeatureErrorBoundary } from '@/components/error-boundary';

import { StatsView } from './StatsView';

/**
 * Stats ページのクライアントエントリポイント
 *
 * CalendarController を経由せず、Stats を直接レンダリングする。
 * D&D、コンテキストメニュー、日付ナビゲーション等の不要なオーバーヘッドを排除。
 */
export function StatsPageContent() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FeatureErrorBoundary featureName="stats">
        <StatsView />
      </FeatureErrorBoundary>
    </div>
  );
}
