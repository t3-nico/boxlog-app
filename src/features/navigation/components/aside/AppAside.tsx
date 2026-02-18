'use client';

import { ArrowLeft, PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { AIInspectorContent } from '@/features/ai/components/AIInspectorContent';
import { PlanListPanel } from '@/features/calendar/components/aside/PlanListPanel';
import { RecordListPanel } from '@/features/calendar/components/aside/RecordListPanel';
import { ReflectionPanel } from '@/features/reflection/components/ReflectionPanel';
import { StatsPanel } from '@/features/stats/components/StatsPanel';

import { AsideSwitcher, type AsideType } from './AsideSwitcher';

interface AppAsideProps {
  asideType: AsideType;
  onAsideChange: (aside: AsideType) => void;
}

/**
 * アプリケーション共通アサイド
 *
 * 共通ヘッダー（AsideSwitcher + 閉じるボタン）を持ち、
 * asideTypeに応じてPlan/Record/Stats/Chat/Reflectionパネルを切り替え表示
 */
export function AppAside({ asideType, onAsideChange }: AppAsideProps) {
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
      case 'reflection':
        return <ReflectionPanel reflections={[]} />;
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
