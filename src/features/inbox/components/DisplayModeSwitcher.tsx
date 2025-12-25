'use client';

import { Columns3, Table2 } from 'lucide-react';

import { PillSwitcher } from '@/components/ui/pill-switcher';

import { useInboxViewStore } from '../stores/useInboxViewStore';

/**
 * Display Mode Switcher
 *
 * Board/Tableビューを切り替えるトグルボタン
 */
export function DisplayModeSwitcher() {
  const { displayMode, setDisplayMode } = useInboxViewStore();

  return (
    <PillSwitcher
      options={[
        { value: 'board' as const, label: 'Board', icon: <Columns3 className="h-4 w-4" /> },
        { value: 'table' as const, label: 'Table', icon: <Table2 className="h-4 w-4" /> },
      ]}
      value={displayMode}
      onValueChange={setDisplayMode}
    />
  );
}
