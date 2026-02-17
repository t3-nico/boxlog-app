'use client';

import { SegmentedControl } from '@/components/ui/segmented-control';

export type PanelType = 'none' | 'plan' | 'record' | 'chat';

const panelOptions = [
  { value: 'plan' as const, label: 'Plan' },
  { value: 'record' as const, label: 'Record' },
  { value: 'chat' as const, label: 'Chat' },
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
      value={currentPanel as 'plan' | 'record' | 'chat'}
      onChange={onChange}
      className={className}
    />
  );
}
