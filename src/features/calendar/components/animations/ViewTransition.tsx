'use client';

// Types
export type { CalendarView, SlideDirection } from './types';

// Context
export { useAnimation } from './context';

// Components
export {
  AdvancedSlideTransition,
  AdvancedViewTransition,
  AnimationProvider,
  AnimationWrapper,
  CalendarViewAnimation,
  EventCollapse,
  FadeTransition,
  HoverEffect,
  OptimizedListAnimation,
  Parallax,
  PerformanceIndicator,
  SkeletonAnimation,
  SlideTransition,
  SpringAnimation,
  StaggeredAnimation,
  TaskCreateAnimation,
  TaskDragAnimation,
  TaskHoverTooltip,
  TouchAnimation,
  ViewTransition,
} from './components';

// Hooks
export { useAnimationPerformance, useViewTransition } from './hooks';
