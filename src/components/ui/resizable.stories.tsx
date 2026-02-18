import { useCallback, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { useResizeHandle } from '@/features/calendar/hooks/useResizeHandle';
import { cn } from '@/lib/utils';

/**
 * Resizable - カスタムリサイズパネル（useResizeHandle）
 *
 * マウスドラッグで%ベースのリサイズを行うカスタム実装。
 *
 * ## 仕様
 *
 * - デフォルト: 28%, min: 25%, max: 40%, min-width: 288px
 * - ハンドル: 1px境界線（bg-border）、ホバー/ドラッグ中に bg-primary
 * - ドラッグ中はカーソルが col-resize に変化
 * - サイズは localStorage に永続化（useAppAsideStore）
 *
 * ## 使用箇所
 *
 * - CalendarLayout のアサイド
 *
 * ## 注意
 *
 * shadcn/ui Resizable（react-resizable-panels）は
 * Next.js 15 RSC環境で動作しないため、カスタム実装を使用。
 */
const meta = {
  title: 'Components/Resizable',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────

function CustomResizeDemo() {
  const [savedPercent, setSavedPercent] = useState(28);
  const { percent, isResizing, handleMouseDown, containerRef } = useResizeHandle({
    initialPercent: savedPercent,
    onResizeEnd: setSavedPercent,
  });

  const handleReset = useCallback(() => {
    setSavedPercent(28);
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <p className="text-sm">
          <span className="text-muted-foreground">現在: </span>
          <span className="font-mono font-medium">{percent}%</span>
          {isResizing && <span className="text-primary ml-2 text-xs">リサイズ中...</span>}
        </p>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-xs underline"
          onClick={handleReset}
        >
          リセット（28%）
        </button>
      </div>

      {/* containerRef はflex containerに直接配置（%計算の基準を合わせるため） */}
      <div ref={containerRef} className="border-border flex h-[400px] rounded-lg border">
        {/* メインコンテンツ */}
        <div className="bg-background flex min-w-0 flex-1 items-center justify-center">
          <span className="text-muted-foreground text-sm">Main Content</span>
        </div>

        {/* リサイズハンドル */}
        <div
          role="separator"
          aria-orientation="vertical"
          className={cn(
            'bg-border w-px shrink-0 cursor-col-resize',
            'hover:bg-primary active:bg-primary',
            'after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2',
            'relative',
            isResizing && 'bg-primary',
          )}
          onMouseDown={handleMouseDown}
        />

        {/* アサイド */}
        <aside
          className={cn(
            'shrink-0 overflow-hidden',
            !isResizing && 'transition-[width] duration-200 ease-in-out',
          )}
          style={{ width: `${percent}%` }}
        >
          <div className="bg-container flex h-full items-center justify-center">
            <span className="text-muted-foreground text-sm">Side Panel</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => <CustomResizeDemo />,
};
