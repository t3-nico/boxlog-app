'use client'

import { useRef } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import type { AdvancedSlideTransitionProps, FadeTransitionProps, SlideDirection, SlideTransitionProps } from '../types'
import { ANIMATION_CONFIG, GPU_OPTIMIZED_STYLES } from '../types'

// 高度なスライド遷移コンポーネント
export function AdvancedSlideTransition({
  direction,
  children,
  className,
  duration = ANIMATION_CONFIG.slideTransition.duration,
  onComplete,
}: AdvancedSlideTransitionProps) {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  // スライド方向の設定
  const getSlideVariants = (dir: SlideDirection) => {
    const distance = 100 // %単位

    const variants = {
      left: {
        initial: { x: `${distance}%`, opacity: 0.8 },
        animate: { x: 0, opacity: 1 },
        exit: { x: `-${distance}%`, opacity: 0.8 },
      },
      right: {
        initial: { x: `-${distance}%`, opacity: 0.8 },
        animate: { x: 0, opacity: 1 },
        exit: { x: `${distance}%`, opacity: 0.8 },
      },
      up: {
        initial: { y: `${distance}%`, opacity: 0.8 },
        animate: { y: 0, opacity: 1 },
        exit: { y: `-${distance}%`, opacity: 0.8 },
      },
      down: {
        initial: { y: `-${distance}%`, opacity: 0.8 },
        animate: { y: 0, opacity: 1 },
        exit: { y: `${distance}%`, opacity: 0.8 },
      },
    }

    return dir in variants ? variants[dir as keyof typeof variants] : variants.left
  }

  const animationConfig = prefersReducedMotion
    ? ANIMATION_CONFIG.reduced
    : { ...ANIMATION_CONFIG.slideTransition, duration }

  return (
    <motion.div ref={containerRef} className={cn('relative overflow-hidden', className)} style={GPU_OPTIMIZED_STYLES}>
      <AnimatePresence mode="wait" {...(onComplete && { onExitComplete: onComplete })}>
        <motion.div
          key={direction}
          variants={getSlideVariants(direction)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={animationConfig}
          style={GPU_OPTIMIZED_STYLES}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// フェードイン/アウトアニメーション
export function FadeTransition({ show, children, duration = 200, className = '' }: FadeTransitionProps) {
  return (
    <div
      className={`transition-opacity duration-${duration} ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// スライドアニメーション
export function SlideTransition({
  show,
  direction = 'up',
  children,
  duration = 200,
  className = '',
}: SlideTransitionProps) {
  const getTransform = () => {
    if (show) return 'translate-0'

    switch (direction) {
      case 'up':
        return 'translate-y-2'
      case 'down':
        return '-translate-y-2'
      case 'left':
        return 'translate-x-2'
      case 'right':
        return '-translate-x-2'
      default:
        return 'translate-y-2'
    }
  }

  return (
    <div
      className={`transition-all duration-${duration} ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      } ${getTransform()} ${className}`}
    >
      {children}
    </div>
  )
}
