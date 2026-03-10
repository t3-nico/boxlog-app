'use client';

/**
 * GhostRenderer — React Portal でドラッグゴーストを描画
 *
 * DOM cloneNode を廃止し、React の宣言的レンダリングで
 * ゴースト要素を管理。PlanCard と同じスタイルを自動的に維持。
 *
 * 現行の dragElement.ts (cloneNode + document.body.appendChild) を置き換える。
 */

import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import type { InteractionState, TimeRange } from './types';

// ========================================
// Types
// ========================================

interface GhostRendererProps {
  /** Current interaction state */
  state: InteractionState;
  /** Hour height in pixels (for position calculation) */
  hourHeight: number;
  /** Grid container element (for converting grid coords to viewport coords) */
  gridContainer: HTMLElement | null;
  /** Children to render as ghost content (typically a PlanCard) */
  renderGhost?: (params: GhostRenderParams) => React.ReactNode;
}

export interface GhostRenderParams {
  entryId: string;
  previewTime: TimeRange;
  isOverlapping: boolean;
  /** 'dragging' or 'resizing' */
  mode: 'dragging' | 'resizing';
}

// ========================================
// Component
// ========================================

export function GhostRenderer({
  state,
  hourHeight: _hourHeight,
  gridContainer,
  renderGhost,
}: GhostRendererProps) {
  if (state.mode !== 'dragging' || !gridContainer) return null;

  // Convert grid-relative snappedTop to viewport coordinates
  const gridRect = gridContainer.getBoundingClientRect();
  const viewportTop = gridRect.top + state.snappedTop - gridContainer.scrollTop;

  // Calculate width and left for multi-column views
  // For single-column (day view), use full width
  const style: React.CSSProperties = {
    position: 'fixed',
    top: viewportTop,
    left: gridRect.left,
    width: gridRect.width,
    height: state.originalPosition.height,
    zIndex: 9999,
    pointerEvents: 'none',
    opacity: 0.85,
    transition: 'top 50ms ease-out',
  };

  const content = renderGhost?.({
    entryId: state.entryId,
    previewTime: state.previewTime,
    isOverlapping: state.isOverlapping,
    mode: 'dragging',
  });

  return createPortal(
    <div
      className={cn('rounded-lg shadow-lg', state.isOverlapping && 'ring-destructive ring-2')}
      style={style}
    >
      {content ?? (
        <div className="bg-container rounded-lg px-2 py-1 text-sm">
          {state.previewTime.start.getHours()}:
          {String(state.previewTime.start.getMinutes()).padStart(2, '0')}
          {' - '}
          {state.previewTime.end.getHours()}:
          {String(state.previewTime.end.getMinutes()).padStart(2, '0')}
        </div>
      )}
    </div>,
    document.body,
  );
}
