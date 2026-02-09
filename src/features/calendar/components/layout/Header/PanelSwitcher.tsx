'use client';

import { SegmentedControl } from '@/components/ui/segmented-control';

export type PanelType = 'none' | 'plan' | 'record' | 'stats';

const panelOptions = [
  { value: 'plan' as const, label: 'Plan' },
  { value: 'record' as const, label: 'Record' },
  { value: 'stats' as const, label: 'Stats' },
];

interface PanelSwitcherProps {
  currentPanel: PanelType;
  onChange: (panel: PanelType) => void;
  className?: string;
}

/**
 * サイドパネル切り替えセグメントコントロール
 * Plan / Record / Stats をタブ風に切り替え
 */
export function PanelSwitcher({ currentPanel, onChange, className }: PanelSwitcherProps) {
  return (
    <SegmentedControl
      options={panelOptions}
      value={currentPanel as 'plan' | 'record' | 'stats'}
      onChange={onChange}
      className={className}
    />
  );
}
