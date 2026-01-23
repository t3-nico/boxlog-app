'use client';

/**
 * 表示モード切り替えコンポーネント（Finderスタイル）
 *
 * ヘッダーのメニューアイコンの左側に配置
 * アイコン + 下矢印でクリックするとドロップダウンが表示される
 */

import { CheckIcon, ChevronDown, PanelRight, SquareMousePointer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import type { InspectorDisplayMode } from '@/features/inspector';

interface DisplayModeSwitcherProps {
  displayMode: InspectorDisplayMode;
  onDisplayModeChange: (mode: InspectorDisplayMode) => void;
}

export function DisplayModeSwitcher({
  displayMode,
  onDisplayModeChange,
}: DisplayModeSwitcherProps) {
  return (
    <DropdownMenu>
      <HoverTooltip content="表示モード" side="bottom">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
            {displayMode === 'sheet' ? (
              <PanelRight className="size-4" />
            ) : (
              <SquareMousePointer className="size-4" />
            )}
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
      </HoverTooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDisplayModeChange('sheet')}>
          <PanelRight className="size-4" />
          パネル
          {displayMode === 'sheet' && <CheckIcon className="text-primary ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDisplayModeChange('popover')}>
          <SquareMousePointer className="size-4" />
          ポップアップ
          {displayMode === 'popover' && <CheckIcon className="text-primary ml-auto size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
