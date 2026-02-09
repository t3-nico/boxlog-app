'use client';

import { PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { PanelSwitcher, type PanelType } from '../layout/Header/PanelSwitcher';

import { PlanListPanel } from './PlanListPanel';

interface CalendarSidePanelProps {
  panelType: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

/**
 * カレンダーサイドパネル
 *
 * 共通ヘッダー（PanelSwitcher + 閉じるボタン）を持ち、
 * panelTypeに応じてPlan/Record/Statsパネルを切り替え表示
 */
export function CalendarSidePanel({ panelType, onPanelChange }: CalendarSidePanelProps) {
  const t = useTranslations('calendar');

  if (panelType === 'none') return null;

  const renderContent = () => {
    switch (panelType) {
      case 'plan':
        return <PlanListPanel />;
      case 'record':
        return (
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            <p className="text-sm">Coming soon...</p>
          </div>
        );
      case 'stats':
        return (
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            <p className="text-sm">Coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* パネルヘッダー（CalendarHeader h-12 px-4 py-2 + h-8 と同じ構造） */}
      <div className="h-12 shrink-0 px-4 py-2">
        <div className="flex h-8 items-center justify-between">
          <PanelSwitcher currentPanel={panelType} onChange={onPanelChange} />
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 size-8"
            onClick={() => onPanelChange('none')}
            aria-label={t('actions.close')}
          >
            <PanelRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* パネルコンテンツ */}
      <div className="min-h-0 flex-1">{renderContent()}</div>
    </div>
  );
}
