'use client';

import { ArrowLeft, PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { AIInspectorContent } from '@/features/ai/components/AIInspectorContent';

import { AsideSwitcher, type AsideType } from '../layout/Header/AsideSwitcher';

import { StatsPanel } from '@/features/stats/components/StatsPanel';
import { PlanListPanel } from './PlanListPanel';
import { RecordListPanel } from './RecordListPanel';

interface CalendarAsideProps {
  asideType: AsideType;
  onAsideChange: (aside: AsideType) => void;
}

/**
 * カレンダーアサイド
 *
 * 共通ヘッダー（AsideSwitcher + 閉じるボタン）を持ち、
 * asideTypeに応じてPlan/Record/Statsパネルを切り替え表示
 */
export function CalendarAside({ asideType, onAsideChange }: CalendarAsideProps) {
  const t = useTranslations('calendar');

  if (asideType === 'none') return null;

  const renderContent = () => {
    switch (asideType) {
      case 'plan':
        return <PlanListPanel />;
      case 'record':
        return <RecordListPanel />;
      case 'stats':
        return <StatsPanel />;
      case 'chat':
        return <AIInspectorContent />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* アサイドヘッダー（CalendarHeader h-12 px-4 py-2 + h-8 と同じ構造） */}
      <div className="h-12 shrink-0 px-4 py-2">
        <div className="flex h-8 items-center justify-between">
          <AsideSwitcher currentAside={asideType} onChange={onAsideChange} />
          <Button
            variant="ghost"
            icon
            className="-mr-2 size-8"
            onClick={() => onAsideChange('none')}
            aria-label={t('actions.close')}
          >
            {/* モバイル: 戻る矢印、デスクトップ: パネル閉じアイコン */}
            <ArrowLeft className="size-4 md:hidden" />
            <PanelRight className="hidden size-4 md:block" />
          </Button>
        </div>
      </div>

      {/* アサイドコンテンツ */}
      <div className="min-h-0 flex-1">{renderContent()}</div>
    </div>
  );
}
