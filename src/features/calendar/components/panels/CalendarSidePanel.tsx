'use client';

import { useTranslations } from 'next-intl';

import type { PanelType } from '../layout/Header/PanelSwitcher';

import { PlanListPanel } from './PlanListPanel';

interface CalendarSidePanelProps {
  panelType: PanelType;
}

/**
 * カレンダーサイドパネル
 *
 * panelTypeに応じてPlan/Record/Statsパネルを切り替え表示
 */
export function CalendarSidePanel({ panelType }: CalendarSidePanelProps) {
  const t = useTranslations('calendar');

  switch (panelType) {
    case 'plan':
      return <PlanListPanel />;
    case 'record':
      // Phase 2: RecordListPanel
      return (
        <div className="flex h-full flex-col">
          <div className="border-border flex h-12 items-center border-b px-4">
            <h2 className="font-medium">{t('panel.record')}</h2>
          </div>
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            <p className="text-sm">Coming soon...</p>
          </div>
        </div>
      );
    case 'stats':
      // 後日実装
      return (
        <div className="flex h-full flex-col">
          <div className="border-border flex h-12 items-center border-b px-4">
            <h2 className="font-medium">{t('panel.stats')}</h2>
          </div>
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            <p className="text-sm">Coming soon...</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}
