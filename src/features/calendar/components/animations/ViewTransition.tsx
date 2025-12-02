'use client'

// Types
export type { CalendarView, SlideDirection } from './types'

// Context
export { useAnimation } from './context'

// Components
export {
  AdvancedViewTransition,
  ViewTransition,
  CalendarViewAnimation,
  AdvancedSlideTransition,
  FadeTransition,
  SlideTransition,
  EventCollapse,
  TaskDragAnimation,
  TaskCreateAnimation,
  TaskHoverTooltip,
  StaggeredAnimation,
  SpringAnimation,
  Parallax,
  TouchAnimation,
  SkeletonAnimation,
  AnimationWrapper,
  PerformanceIndicator,
  OptimizedListAnimation,
  HoverEffect,
  AnimationProvider,
} from './components'

// Hooks
export { useViewTransition, useAnimationPerformance } from './hooks'
