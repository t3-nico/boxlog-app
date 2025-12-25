'use client';

import { useEffect, useRef, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

import type {
  EventCollapseProps,
  TaskCreateAnimationProps,
  TaskDragAnimationProps,
  TaskHoverTooltipProps,
} from '../types';
import { ANIMATION_CONFIG, GPU_OPTIMIZED_STYLES } from '../types';

// イベント展開/折りたたみコンポーネント
export function EventCollapse({
  isExpanded,
  children,
  maxHeight = 300,
  className,
}: EventCollapseProps) {
  const prefersReducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // コンテンツの高さを測定
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(Math.min(height, maxHeight));
    }
  }, [children, maxHeight]);

  const animationConfig = prefersReducedMotion
    ? ANIMATION_CONFIG.reduced
    : ANIMATION_CONFIG.eventExpansion;

  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
      initial={false}
      animate={{
        height: isExpanded ? contentHeight : 0,
        opacity: isExpanded ? 1 : 0,
      }}
      transition={animationConfig}
      style={GPU_OPTIMIZED_STYLES}
    >
      <div ref={contentRef} className="absolute inset-0">
        {children}
      </div>
    </motion.div>
  );
}

// タスクドラッグ時のアニメーション
export function TaskDragAnimation({ isDragging, children }: TaskDragAnimationProps) {
  return (
    <div
      className={`transition-all duration-150 ${
        isDragging ? 'scale-105 opacity-80 shadow-lg' : 'scale-100 opacity-100 shadow-sm'
      }`}
    >
      {children}
    </div>
  );
}

// タスク作成時のアニメーション
export function TaskCreateAnimation({ children, isNew = false }: TaskCreateAnimationProps) {
  return (
    <div
      className={`${isNew ? 'ring-primary/50 animate-pulse shadow-lg ring-2' : ''} transition-all duration-300`}
    >
      {children}
    </div>
  );
}

// タスクホバー時の詳細表示アニメーション
export function TaskHoverTooltip({ show, children, position }: TaskHoverTooltipProps) {
  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-150"
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="border-border bg-popover max-w-xs rounded-xl border p-3 shadow-lg">
        {children}
      </div>
    </div>
  );
}
