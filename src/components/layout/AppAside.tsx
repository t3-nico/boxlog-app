'use client';

import { ArrowLeft, PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';

export type AsideType = 'none' | 'plan' | 'record' | 'chat' | 'reflection';

const asideOptions = [
  { value: 'plan' as const, label: 'Plan' },
  { value: 'record' as const, label: 'Record' },
  { value: 'chat' as const, label: 'Chat' },
];

interface AppAsideProps {
  asideType: AsideType;
  onAsideChange: (aside: AsideType) => void;
  /** カスタムコンテンツレンダラー。未指定時はデフォルトの空表示 */
  renderContent?: ((asideType: AsideType) => React.ReactNode) | undefined;
}

/**
 * アプリケーション共通アサイドシェル
 *
 * 共通ヘッダー（AsideSwitcher + 閉じるボタン）を持ち、
 * renderContent で各ページ固有のパネルコンテンツを注入する。
 */
export function AppAside({ asideType, onAsideChange, renderContent }: AppAsideProps) {
  const t = useTranslations('calendar');

  if (asideType === 'none') return null;

  return (
    <div className="flex h-full flex-col">
      {/* アサイドヘッダー（CalendarHeader h-12 px-4 py-2 + h-8 と同じ構造） */}
      <div className="h-12 shrink-0 px-4 py-2">
        <div className="flex h-8 items-center justify-between">
          <SegmentedControl
            options={asideOptions}
            value={asideType as 'plan' | 'record' | 'chat'}
            onChange={onAsideChange}
          />
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
      <div className="min-h-0 flex-1">{renderContent?.(asideType)}</div>
    </div>
  );
}
