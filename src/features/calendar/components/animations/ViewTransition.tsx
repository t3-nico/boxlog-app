'use client'

import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react'

import { AnimatePresence, LayoutGroup, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

import { cn } from '@/lib/utils'

// ビュータイプの定義
export type CalendarView =
  | 'day'
  | 'split-day'
  | '3day'
  | '5day'
  | 'week'
  | 'week-no-weekend'
  | '2week'
  | 'schedule'
  | 'month'

// 方向の定義
export type SlideDirection = 'left' | 'right' | 'up' | 'down'

// GPU加速用のスタイル定数
const GPU_OPTIMIZED_STYLES = {
  willChange: 'transform, opacity' as const,
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
  transformStyle: 'preserve-3d' as const,
}

// アニメーション設定
const ANIMATION_CONFIG = {
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
} as const

// 高度なビュー切り替えのプロパティ
interface AdvancedViewTransitionProps {
  currentView: CalendarView
  children: ReactNode
  className?: string
  onTransitionComplete?: () => void
}

// スライド遷移のプロパティ
interface AdvancedSlideTransitionProps {
  direction: SlideDirection
  children: ReactNode
  className?: string
  duration?: number
  onComplete?: () => void
}

// イベント展開/折りたたみのプロパティ
interface EventCollapseProps {
  isExpanded: boolean
  children: ReactNode
  maxHeight?: number
  className?: string
}

// 高度なビュー切り替えアニメーション
export const AdvancedViewTransition = ({
  currentView,
  children,
  className,
  onTransitionComplete,
}: AdvancedViewTransitionProps) => {
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
      case 'month':
        return {
          ...baseAnimation,
          initial: { ...baseAnimation.initial, scale: 0.9 },
          exit: { ...baseAnimation.exit, scale: 1.1 },
        }
      case '2week':
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
      <AnimatePresence mode="wait" onExitComplete={onTransitionComplete}>
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

// 高度なスライド遷移コンポーネント
export const AdvancedSlideTransition = ({
  direction,
  children,
  className,
  duration = ANIMATION_CONFIG.slideTransition.duration,
  onComplete,
}: AdvancedSlideTransitionProps) => {
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
      <AnimatePresence mode="wait" onExitComplete={onComplete}>
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

// イベント展開/折りたたみコンポーネント
export const EventCollapse = ({ isExpanded, children, maxHeight = 300, className }: EventCollapseProps) => {
  const prefersReducedMotion = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)

  // コンテンツの高さを測定
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight
      setContentHeight(Math.min(height, maxHeight))
    }
  }, [children, maxHeight])

  const animationConfig = prefersReducedMotion ? ANIMATION_CONFIG.reduced : ANIMATION_CONFIG.eventExpansion

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
  )
}

// 旧ViewTransitionを残す（下位互換性のため）
interface ViewTransitionProps {
  children: ReactNode
  viewType: string
  className?: string
}

export const ViewTransition = ({ children, viewType, className = '' }: ViewTransitionProps) => {
  return (
    <AdvancedViewTransition currentView={viewType as CalendarView} className={className}>
      {children}
    </AdvancedViewTransition>
  )
}

// タスクドラッグ時のアニメーション
interface TaskDragAnimationProps {
  isDragging: boolean
  children: ReactNode
}

export const TaskDragAnimation = ({ isDragging, children }: TaskDragAnimationProps) => {
  return (
    <div
      className={`transition-all duration-150 ${
        isDragging ? 'scale-105 opacity-80 shadow-lg' : 'scale-100 opacity-100 shadow-sm'
      }`}
    >
      {children}
    </div>
  )
}

// スムーズなホバーエフェクト
interface HoverEffectProps {
  children: ReactNode
  isHovered: boolean
  disabled?: boolean
}

export const HoverEffect = ({ children, isHovered, disabled = false }: HoverEffectProps) => {
  if (disabled) return <>{children}</>

  return (
    <div
      className={`transition-all duration-150 ${
        isHovered ? 'scale-102 shadow-md brightness-110' : 'scale-100 shadow-sm brightness-100'
      }`}
    >
      {children}
    </div>
  )
}

// フェードイン/アウトアニメーション
interface FadeTransitionProps {
  show: boolean
  children: ReactNode
  duration?: number
  className?: string
}

export const FadeTransition = ({ show, children, duration = 200, className = '' }: FadeTransitionProps) => {
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
interface SlideTransitionProps {
  show: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
  children: ReactNode
  duration?: number
  className?: string
}

export const SlideTransition = ({
  show,
  direction = 'up',
  children,
  duration = 200,
  className = '',
}: SlideTransitionProps) => {
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

// タスク作成時のアニメーション
interface TaskCreateAnimationProps {
  children: ReactNode
  isNew?: boolean
}

export const TaskCreateAnimation = ({ children, isNew = false }: TaskCreateAnimationProps) => {
  return (
    <div className={`${isNew ? 'ring-primary/50 animate-pulse shadow-lg ring-2' : ''} transition-all duration-300`}>
      {children}
    </div>
  )
}

// カレンダービュー切り替え時のアニメーション
interface CalendarViewAnimationProps {
  children: ReactNode
  viewType: 'day' | 'split-day' | '3day' | '5day' | 'week' | 'week-no-weekend' | '2week' | 'schedule' | 'month'
  previousViewType?: 'day' | 'split-day' | '3day' | '5day' | 'week' | 'week-no-weekend' | '2week' | 'schedule' | 'month'
}

export const CalendarViewAnimation = ({ children, viewType, previousViewType }: CalendarViewAnimationProps) => {
  const getAnimationClass = () => {
    if (!previousViewType) return ''

    // ズーム系の切り替え
    if ((previousViewType === 'month' && viewType === 'week') || (previousViewType === 'week' && viewType === 'day')) {
      return 'calendar-zoom-in'
    }

    if ((previousViewType === 'day' && viewType === 'week') || (previousViewType === 'week' && viewType === 'month')) {
      return 'calendar-zoom-out'
    }

    return 'calendar-slide-in'
  }

  return <div className={`${getAnimationClass()} flex min-h-0 flex-1 flex-col`}>{children}</div>
}

// 読み込み時のスケルトンアニメーション
interface SkeletonAnimationProps {
  show: boolean
  count?: number
  height?: string
  className?: string
}

export const SkeletonAnimation = ({ show, count = 3, height = 'h-8', className = '' }: SkeletonAnimationProps) => {
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

// タスクホバー時の詳細表示アニメーション
interface TaskHoverTooltipProps {
  show: boolean
  children: ReactNode
  position?: { x: number; y: number }
}

export const TaskHoverTooltip = ({ show, children, position }: TaskHoverTooltipProps) => {
  if (!show) return null

  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-150"
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="border-border bg-popover max-w-xs rounded-xl border p-3 shadow-lg">{children}</div>
    </div>
  )
}

// パフォーマンス最適化：アニメーションの有効/無効を制御
interface AnimationWrapperProps {
  children: ReactNode
  disabled?: boolean
  className?: string
}

export const AnimationWrapper = ({ children, disabled = false, className = '' }: AnimationWrapperProps) => {
  return <div className={`${disabled ? '' : 'transition-all duration-150'} ${className}`}>{children}</div>
}

// アニメーション設定のコンテキスト
interface AnimationContextType {
  enabled: boolean
  reducedMotion: boolean
  duration: 'fast' | 'normal' | 'slow'
}

const AnimationContext = createContext<AnimationContextType>({
  enabled: true,
  reducedMotion: false,
  duration: 'normal',
})

export function useAnimation() {
  return useContext(AnimationContext)
}

interface AnimationProviderProps {
  children: ReactNode
  config?: Partial<AnimationContextType>
}

export const AnimationProvider = ({ children, config = {} }: AnimationProviderProps) => {
  const defaultConfig: AnimationContextType = {
    enabled: true,
    reducedMotion: false,
    duration: 'normal',
    ...config,
  }

  return <AnimationContext.Provider value={defaultConfig}>{children}</AnimationContext.Provider>
}

// ステガード（段階的）アニメーション
interface StaggeredAnimationProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export const StaggeredAnimation = ({ children, staggerDelay = 0.05, className }: StaggeredAnimationProps) => {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={GPU_OPTIMIZED_STYLES}
    >
      {children.map((child, index) => (
        <motion.div
           
          key={index}
          variants={itemVariants}
          style={GPU_OPTIMIZED_STYLES}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// スプリングアニメーション（高性能な物理ベースアニメーション）
interface SpringAnimationProps {
  children: React.ReactNode
  isActive: boolean
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
  className?: string
}

export const SpringAnimation = ({
  children,
  isActive,
  springConfig = { stiffness: 300, damping: 30, mass: 1 },
  className,
}: SpringAnimationProps) => {
  const scaleValue = useMotionValue(1)
  const springScale = useSpring(scaleValue, springConfig)

  useEffect(() => {
    scaleValue.set(isActive ? 1.05 : 1)
  }, [isActive, scaleValue])

  return (
    <motion.div
      className={className}
      style={{
        scale: springScale,
        ...GPU_OPTIMIZED_STYLES,
      }}
    >
      {children}
    </motion.div>
  )
}

// パララックス効果
interface ParallaxProps {
  children: React.ReactNode
  offset: number
  className?: string
}

export const Parallax = ({ children, offset, className }: ParallaxProps) => {
  const prefersReducedMotion = useReducedMotion()
  const y = useMotionValue(0)
  const springY = useSpring(y, { stiffness: 400, damping: 90 })

  useEffect(() => {
    if (!prefersReducedMotion) {
      const handleScroll = () => {
        const scrolled = window.scrollY
        y.set(scrolled * offset)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [offset, y, prefersReducedMotion])

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{
        y: springY,
        ...GPU_OPTIMIZED_STYLES,
      }}
    >
      {children}
    </motion.div>
  )
}

// 高性能インジケーター（ローディング、プログレス等）
interface PerformanceIndicatorProps {
  isLoading: boolean
  progress?: number
  className?: string
}

export const PerformanceIndicator = ({ isLoading, progress = 0, className }: PerformanceIndicatorProps) => {
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

// カスタムフック：アニメーション制御
export function useViewTransition() {
  const [currentView, setCurrentView] = useState<CalendarView>('week')
  const [direction, setDirection] = useState<SlideDirection>('right')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const changeView = (newView: CalendarView, slideDirection: SlideDirection = 'right') => {
    if (newView === currentView || isTransitioning) return

    setIsTransitioning(true)
    setDirection(slideDirection)
    setCurrentView(newView)
  }

  const handleTransitionComplete = () => {
    setIsTransitioning(false)
  }

  return {
    currentView,
    direction,
    isTransitioning,
    changeView,
    handleTransitionComplete,
  }
}

// パフォーマンス監視フック
export function useAnimationPerformance() {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const [fps, setFps] = useState(60)

  useEffect(() => {
    let animationId: number

    const measureFPS = () => {
      frameCount.current++
      const now = performance.now()

      if (now - lastTime.current >= 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / (now - lastTime.current))
        setFps(currentFPS)
        frameCount.current = 0
        lastTime.current = now
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return { fps }
}

// モバイル対応のタッチアニメーション
interface TouchAnimationProps {
  children: React.ReactNode
  onTap?: () => void
  className?: string
}

export const TouchAnimation = ({ children, onTap, className }: TouchAnimationProps) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      transition={{ duration: 0.1, ease: 'easeInOut' }}
      onTap={onTap}
      style={GPU_OPTIMIZED_STYLES}
    >
      {children}
    </motion.div>
  )
}

// パフォーマンス最適化されたリストアニメーション
interface OptimizedListAnimationProps {
  children: React.ReactNode[]
  itemHeight: number
  visibleItems: number
  className?: string
}

export const OptimizedListAnimation = ({
  children,
  itemHeight,
  visibleItems,
  className,
}: OptimizedListAnimationProps) => {
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
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
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
