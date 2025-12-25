'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/common/PageHeader';
import { MobileStatsSettingsSheet } from '@/features/stats/components/MobileStatsSettingsSheet';
import { StatsToolbar } from '@/features/stats/components/stats-toolbar';

interface StatsLayoutProps {
  children: React.ReactNode;
}

/**
 * 統計ページ専用レイアウト
 *
 * 構成:
 * - ページヘッダー（タイトル + モバイルメニュー）
 * - 共通ツールバー（期間選択・フィルタ・エクスポート）
 * - スクロール可能なメインコンテンツ
 *
 * サイドバーナビゲーションは上位レイアウト（DesktopLayout/MobileLayout）で管理
 */
export default function StatsLayout({ children }: StatsLayoutProps) {
  const t = useTranslations();

  return (
    <div className="flex h-full flex-col">
      {/* ページヘッダー */}
      <PageHeader title={t('stats.sidebar.overview')} />

      {/* ツールバー: 高さ48px固定（8px + 32px + 8px） */}
      <div className="flex h-12 shrink-0 items-center gap-2 px-4 py-2">
        {/* デスクトップ: フルツールバー */}
        <div className="hidden flex-1 md:block">
          <StatsToolbar />
        </div>

        {/* モバイル: スペーサー + 設定シートボタン */}
        <div className="flex-1 md:hidden" />
        <div className="md:hidden">
          <MobileStatsSettingsSheet />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4">{children}</div>
    </div>
  );
}
