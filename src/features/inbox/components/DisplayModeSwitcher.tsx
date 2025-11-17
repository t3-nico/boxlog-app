'use client'

import { Columns3, Table2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useInboxViewStore } from '../stores/useInboxViewStore'
import type { DisplayMode } from '../types/view'

/**
 * Display Mode Switcher
 *
 * Board/Tableビューを切り替えるトグルボタン
 */
export function DisplayModeSwitcher() {
  const { displayMode, setDisplayMode } = useInboxViewStore()

  const modes: Array<{ mode: DisplayMode; icon: React.ReactNode; label: string }> = [
    { mode: 'board', icon: <Columns3 className="h-4 w-4" />, label: 'Board' },
    { mode: 'table', icon: <Table2 className="h-4 w-4" />, label: 'Table' },
  ]

  return (
    <div className="flex items-center gap-1">
      {modes.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          variant={displayMode === mode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setDisplayMode(mode)}
          className="border-border h-7 border px-2"
        >
          {icon}
          <span className="ml-1 text-xs">{label}</span>
        </Button>
      ))}
    </div>
  )
}
