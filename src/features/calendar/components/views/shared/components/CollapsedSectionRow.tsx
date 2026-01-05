/**
 * 折りたたまれた時間セクションの表示コンポーネント
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

import { cn } from '@/lib/utils';

import type { GridSection } from '../../../../types/collapsedSection.types';

interface CollapsedSectionRowProps {
  /** グリッドセクションデータ */
  section: GridSection;
  /** クリックハンドラー（将来の展開機能用） */
  onClick?: () => void;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 折りたたまれた時間セクションを表示
 * 例: "00:00 - 07:00" のラベルと展開アイコンを含む
 */
export const CollapsedSectionRow = memo(function CollapsedSectionRow({
  section,
  onClick,
  className,
}: CollapsedSectionRowProps) {
  const t = useTranslations('calendar.collapsedSection');

  if (section.type !== 'collapsed' || !section.collapsedData) {
    return null;
  }

  const { label } = section.collapsedData;

  return (
    <div
      className={cn(
        'bg-muted/30 border-border/50 flex items-center justify-center border-y',
        'text-muted-foreground hover:bg-muted/50 cursor-pointer text-xs transition-colors',
        className,
      )}
      style={{
        height: `${section.heightPx}px`,
        position: 'absolute',
        top: `${section.offsetPx}px`,
        left: 0,
        right: 0,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={t('expandLabel', { timeRange: label })}
    >
      <div className="flex items-center gap-2">
        <ChevronDown className="size-3" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
});
