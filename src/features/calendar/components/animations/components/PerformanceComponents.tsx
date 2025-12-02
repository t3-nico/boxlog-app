'use client'

import React, { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import type {
  AnimationWrapperProps,
  OptimizedListAnimationProps,
  PerformanceIndicatorProps,
  SkeletonAnimationProps,
} from '../types'
import { GPU_OPTIMIZED_STYLES } from '../types'

// 読み込み時のスケルトンアニメーション
export function SkeletonAnimation({ show, count = 3, height = 'h-8', className = '' }: SkeletonAnimationProps) {
  if (!show) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`skeleton-${Date.now()}-${index}`}
          className={`${height} bg-muted animate-pulse rounded`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

// パフォーマンス最適化：アニメーションの有効/無効を制御
export function AnimationWrapper({ children, disabled = false, className = '' }: AnimationWrapperProps) {
  return <div className={`${disabled ? '' : 'transition-all duration-150'} ${className}`}>{children}</div>
}

// 高性能インジケーター（ローディング、プログレス等）
export function PerformanceIndicator({ isLoading, progress = 0, className }: PerformanceIndicatorProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isLoading === true && (
        <motion.div
          className={cn('relative', className)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          style={GPU_OPTIMIZED_STYLES}
        >
          {/* プログレスバー */}
          <motion.div
            className="bg-primary h-1"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.3,
              ease: 'easeOut',
            }}
            style={GPU_OPTIMIZED_STYLES}
          />

          {/* スピナー */}
          <motion.div
            className="border-primary h-4 w-4 rounded-full border-2 border-t-transparent"
            animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
            transition={{
              duration: 1,
              repeat: prefersReducedMotion ? 0 : Infinity,
              ease: 'linear',
            }}
            style={GPU_OPTIMIZED_STYLES}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// パフォーマンス最適化されたリストアニメーション
export function OptimizedListAnimation({
  children,
  itemHeight,
  visibleItems,
  className,
}: OptimizedListAnimationProps) {
  const prefersReducedMotion = useReducedMotion()
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollY(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const startIndex = Math.floor(scrollY / itemHeight)
  const endIndex = Math.min(startIndex + visibleItems + 1, children.length)
  const visibleChildren = children.slice(startIndex, endIndex)

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)} style={{ height: visibleItems * itemHeight }}>
      <div style={{ height: children.length * itemHeight, position: 'relative' }}>
        <AnimatePresence mode="popLayout">
          {visibleChildren.map((child, index) => (
            <motion.div
              key={`list-item-${startIndex + index}-${Date.now()}`}
              {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 20 }, exit: { opacity: 0, y: -20 } })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              style={{
                position: 'absolute',
                top: (startIndex + index) * itemHeight,
                width: '100%',
                height: itemHeight,
                ...GPU_OPTIMIZED_STYLES,
              }}
            >
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
