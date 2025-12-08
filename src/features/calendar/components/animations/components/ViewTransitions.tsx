'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import type {
  AdvancedViewTransitionProps,
  CalendarView,
  CalendarViewAnimationProps,
  ViewTransitionProps,
} from '../types'
import { ANIMATION_CONFIG, GPU_OPTIMIZED_STYLES } from '../types'

// 高度なビュー切り替えアニメーション
export function AdvancedViewTransition({
  currentView,
  children,
  className,
  onTransitionComplete,
}: AdvancedViewTransitionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [previousView, setPreviousView] = useState<CalendarView>(currentView)

  // ビューが変更された時の処理
  useEffect(() => {
    if (currentView !== previousView) {
      setPreviousView(currentView)
    }
  }, [currentView, previousView])

  // アニメーション設定の選択
  const animationConfig = prefersReducedMotion ? ANIMATION_CONFIG.reduced : ANIMATION_CONFIG.viewTransition

  // ビュー固有のアニメーション設定
  const getViewAnimation = (view: CalendarView) => {
    const baseAnimation = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      transition: animationConfig,
    }

    switch (view) {
      case 'day':
      case 'split-day':
        return {
          ...baseAnimation,
          initial: { ...baseAnimation.initial, y: 20 },
          exit: { ...baseAnimation.exit, y: -20 },
        }
      case 'week':
      case 'week-no-weekend':
      case '3day':
        return {
          ...baseAnimation,
          initial: { ...baseAnimation.initial, x: -20 },
          exit: { ...baseAnimation.exit, x: 20 },
        }
      case 'agenda':
        return {
          ...baseAnimation,
          initial: { ...baseAnimation.initial, y: -20 },
          exit: { ...baseAnimation.exit, y: 20 },
        }
      case 'schedule':
        return {
          ...baseAnimation,
          initial: { ...baseAnimation.initial, y: -20 },
          exit: { ...baseAnimation.exit, y: 20 },
        }
      default:
        return baseAnimation
    }
  }

  return (
    <LayoutGroup>
      <AnimatePresence mode="wait" {...(onTransitionComplete && { onExitComplete: onTransitionComplete })}>
        <motion.div
          key={currentView}
          className={cn('relative h-full', className)}
          style={GPU_OPTIMIZED_STYLES}
          {...getViewAnimation(currentView)}
          layout
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  )
}

// 旧ViewTransitionを残す（下位互換性のため）
export function ViewTransition({ children, viewType, className = '' }: ViewTransitionProps) {
  return (
    <AdvancedViewTransition currentView={viewType as CalendarView} className={className}>
      {children}
    </AdvancedViewTransition>
  )
}

// カレンダービュー切り替え時のアニメーション
export function CalendarViewAnimation({ children, viewType, previousViewType }: CalendarViewAnimationProps) {
  const getAnimationClass = () => {
    if (!previousViewType) return ''

    // ズーム系の切り替え
    if (previousViewType === 'week' && viewType === 'day') {
      return 'calendar-zoom-in'
    }

    if (previousViewType === 'day' && viewType === 'week') {
      return 'calendar-zoom-out'
    }

    return 'calendar-slide-in'
  }

  return <div className={`${getAnimationClass()} flex min-h-0 flex-1 flex-col`}>{children}</div>
}
