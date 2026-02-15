import { ReactNode } from 'react';

// ビュータイプの定義
export type CalendarView =
  | 'day'
  | 'split-day'
  | '3day'
  | '5day'
  | 'week'
  | 'week-no-weekend'
  | 'schedule'
  | 'agenda';

// 方向の定義
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

// GPU加速用のスタイル定数
export const GPU_OPTIMIZED_STYLES = {
  willChange: 'transform, opacity' as const,
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
  transformStyle: 'preserve-3d' as const,
};

// アニメーション設定
export const ANIMATION_CONFIG = {
  // ビュー切り替え
  viewTransition: {
    duration: 0.4,
    ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
    staggerChildren: 0.05,
  },

  // スライド遷移
  slideTransition: {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },

  // イベント展開
  eventExpansion: {
    duration: 0.25,
    ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
  },

  // 高速アニメーション（reducedMotion時）
  reduced: {
    duration: 0.1,
    ease: 'linear' as const,
  },
} as const;

// Props型定義
export interface AdvancedViewTransitionProps {
  currentView: CalendarView;
  children: ReactNode;
  className?: string;
  onTransitionComplete?: () => void;
}

export interface AdvancedSlideTransitionProps {
  direction: SlideDirection;
  children: ReactNode;
  className?: string;
  duration?: number;
  onComplete?: () => void;
}

export interface EventCollapseProps {
  isExpanded: boolean;
  children: ReactNode;
  maxHeight?: number;
  className?: string;
}

export interface ViewTransitionProps {
  children: ReactNode;
  viewType: string;
  className?: string;
}

export interface TaskDragAnimationProps {
  isDragging: boolean;
  children: ReactNode;
}

export interface HoverEffectProps {
  children: ReactNode;
  isHovered: boolean;
  disabled?: boolean;
}

export interface FadeTransitionProps {
  show: boolean;
  children: ReactNode;
  duration?: number;
  className?: string;
}

export interface SlideTransitionProps {
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  children: ReactNode;
  duration?: number;
  className?: string;
}

export interface TaskCreateAnimationProps {
  children: ReactNode;
  isNew?: boolean;
}

export interface CalendarViewAnimationProps {
  children: ReactNode;
  viewType: string;
  previousViewType?: string;
}

export interface SkeletonAnimationProps {
  show: boolean;
  count?: number;
  height?: string;
  className?: string;
}

export interface TaskHoverTooltipProps {
  show: boolean;
  children: ReactNode;
  position?: { x: number; y: number };
}

export interface AnimationWrapperProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface AnimationContextType {
  enabled: boolean;
  reducedMotion: boolean;
  duration: 'fast' | 'normal' | 'slow';
}

export interface AnimationProviderProps {
  children: ReactNode;
  config?: Partial<AnimationContextType>;
}

export interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export interface SpringAnimationProps {
  children: React.ReactNode;
  isActive: boolean;
  springConfig?: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  className?: string;
}

export interface ParallaxProps {
  children: React.ReactNode;
  offset: number;
  className?: string;
}

export interface PerformanceIndicatorProps {
  isLoading: boolean;
  progress?: number;
  className?: string;
}

export interface TouchAnimationProps {
  children: React.ReactNode;
  onTap?: () => void;
  className?: string;
}

export interface OptimizedListAnimationProps {
  children: React.ReactNode[];
  itemHeight: number;
  visibleItems: number;
  className?: string;
}
