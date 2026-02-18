'use client';

import { SegmentedControl } from '@/components/ui/segmented-control';

export type AsideType = 'none' | 'plan' | 'record' | 'stats' | 'chat' | 'reflection';

const asideOptions = [
  { value: 'plan' as const, label: 'Plan' },
  { value: 'record' as const, label: 'Record' },
  { value: 'stats' as const, label: 'Stats' },
  { value: 'chat' as const, label: 'Chat' },
];

interface AsideSwitcherProps {
  currentAside: AsideType;
  onChange: (aside: AsideType) => void;
  className?: string;
}

/**
 * アサイド切り替えセグメントコントロール
 * Plan / Record / Stats / Chat をタブ風に切り替え
 */
export function AsideSwitcher({ currentAside, onChange, className }: AsideSwitcherProps) {
  return (
    <SegmentedControl
      options={asideOptions}
      value={currentAside as 'plan' | 'record' | 'stats' | 'chat'}
      onChange={onChange}
      className={className}
    />
  );
}
