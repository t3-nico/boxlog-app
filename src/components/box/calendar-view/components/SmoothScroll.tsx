'use client'

import React, { 
  ReactNode, 
  useRef, 
  useEffect, 
  useState, 
  useCallback,
  forwardRef
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SmoothScrollProps {
  children: ReactNode
  className?: string
  showScrollIndicator?: boolean
  virtualizeThreshold?: number
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void
  autoHide?: boolean
  momentum?: boolean
}

interface ScrollIndicatorProps {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
  isVisible: boolean
}

// スクロールインジケーター
function ScrollIndicator({ scrollTop, scrollHeight, clientHeight, isVisible }: ScrollIndicatorProps) {
  const scrollPercentage = scrollHeight > clientHeight 
    ? (scrollTop / (scrollHeight - clientHeight)) * 100 
    : 0
  
  return (
    <AnimatePresence>
      {isVisible && scrollHeight > clientHeight && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
        >
          {/* スクロールトラック */}
          <div className="w-2 h-32 bg-gray-200 dark:bg-gray-700 rounded-full relative">
            {/* スクロールサム */}
            <motion.div
              className="w-full bg-blue-500 rounded-full absolute"
              style={{
                height: Math.max((clientHeight / scrollHeight) * 100, 10) + '%',
                top: scrollPercentage + '%'
              }}
              animate={{ y: `${scrollPercentage}%` }}
              transition={{ type: "spring", stiffness: 500, damping: 50 }}
            />
          </div>
          
          {/* パーセンテージ表示 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            {Math.round(scrollPercentage)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// メイン scroll コンポーネント
export const SmoothScroll = forwardRef<HTMLDivElement, SmoothScrollProps>(({
  children,
  className,
  showScrollIndicator = false,
  virtualizeThreshold = 1000,
  onScroll,
  autoHide = true,
  momentum = true
}, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0
  })
  const [showIndicator, setShowIndicator] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  
  // スクロール状態の更新
  const updateScrollState = useCallback(() => {
    const element = scrollRef.current
    if (!element) return
    
    const newState = {
      scrollTop: element.scrollTop,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight
    }
    
    setScrollState(newState)
    onScroll?.(newState.scrollTop, newState.scrollHeight, newState.clientHeight)
  }, [onScroll])
  
  // スクロールハンドラー
  const handleScroll = useCallback(() => {
    setIsScrolling(true)
    setShowIndicator(true)
    updateScrollState()
    
    // スクロール終了の検出
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      if (autoHide) {
        setShowIndicator(false)
      }
    }, 150)
  }, [updateScrollState, autoHide])
  
  // リサイズハンドラー
  const handleResize = useCallback(() => {
    updateScrollState()
  }, [updateScrollState])
  
  // スムーズスクロール関数
  const scrollTo = useCallback((options: {
    top?: number
    left?: number
    behavior?: 'auto' | 'smooth'
  }) => {
    scrollRef.current?.scrollTo(options)
  }, [])
  
  // 要素へのスクロール
  const scrollToElement = useCallback((selector: string, offset = 0) => {
    const element = scrollRef.current?.querySelector(selector)
    if (element && scrollRef.current) {
      const elementTop = (element as HTMLElement).offsetTop
      scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      })
    }
  }, [scrollTo])
  
  // イベントリスナーの設定
  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    
    element.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    
    // 初期状態の設定
    updateScrollState()
    
    return () => {
      element.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [handleScroll, handleResize, updateScrollState])
  
  // ref の forwarding
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(scrollRef.current)
    } else if (ref) {
      ref.current = scrollRef.current
    }
  }, [ref])
  
  return (
    <>
      <div
        ref={scrollRef}
        className={cn(
          "overflow-auto cal-scrollbar",
          // スクロール中は軽量レンダリング
          isScrolling && "will-change-scroll-position",
          // モメンタムスクロール（iOS Safari）
          momentum && "overflow-scroll",
          className
        )}
        style={{
          // スムーズスクロール
          scrollBehavior: 'smooth',
          // WebKit向けモメンタムスクロール
          WebkitOverflowScrolling: momentum ? 'touch' : 'auto',
          // スクロールスナップ（必要に応じて）
          // scrollSnapType: 'y mandatory'
        }}
      >
        {/* スクロール最適化のためのコンテナー */}
        <div className={cn(
          "min-h-full",
          // GPU アクセラレーション
          isScrolling && "transform-gpu"
        )}>
          {children}
        </div>
      </div>
      
      {/* スクロールインジケーター */}
      {showScrollIndicator && (
        <ScrollIndicator
          scrollTop={scrollState.scrollTop}
          scrollHeight={scrollState.scrollHeight}
          clientHeight={scrollState.clientHeight}
          isVisible={showIndicator}
        />
      )}
    </>
  )
})

SmoothScroll.displayName = 'SmoothScroll'

// 水平スクロール版
export const HorizontalSmoothScroll = forwardRef<HTMLDivElement, SmoothScrollProps>(({
  children,
  className,
  onScroll,
  ...props
}, ref) => {
  return (
    <SmoothScroll
      ref={ref}
      className={cn("overflow-x-auto overflow-y-hidden", className)}
      onScroll={(scrollLeft, scrollWidth, clientWidth) => {
        onScroll?.(scrollLeft, scrollWidth, clientWidth)
      }}
      {...props}
    >
      <div className="flex">
        {children}
      </div>
    </SmoothScroll>
  )
})

HorizontalSmoothScroll.displayName = 'HorizontalSmoothScroll'

// 仮想化対応スクロール
interface VirtualizedScrollProps extends SmoothScrollProps {
  itemHeight: number
  totalItems: number
  renderItem: (index: number, style: React.CSSProperties) => ReactNode
  overscan?: number
}

export function VirtualizedScroll({
  itemHeight,
  totalItems,
  renderItem,
  overscan = 5,
  className,
  ...props
}: VirtualizedScrollProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  
  // 表示範囲の計算
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  // レンダリングするアイテム
  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      renderItem(i, {
        position: 'absolute',
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight
      })
    )
  }
  
  return (
    <SmoothScroll
      className={cn("relative", className)}
      onScroll={(top, scrollHeight, clientHeight) => {
        setScrollTop(top)
        setContainerHeight(clientHeight)
      }}
      {...props}
    >
      {/* 仮想コンテナー */}
      <div style={{ height: totalItems * itemHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </SmoothScroll>
  )
}

// スクロール位置復元フック
export function useScrollRestoration(key: string) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // スクロール位置の保存
  const saveScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      sessionStorage.setItem(
        `scroll-${key}`, 
        scrollRef.current.scrollTop.toString()
      )
    }
  }, [key])
  
  // スクロール位置の復元
  const restoreScrollPosition = useCallback(() => {
    const savedPosition = sessionStorage.getItem(`scroll-${key}`)
    if (savedPosition && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedPosition, 10)
    }
  }, [key])
  
  useEffect(() => {
    // ページ離脱時に位置を保存
    window.addEventListener('beforeunload', saveScrollPosition)
    
    // マウント時に位置を復元
    const timer = setTimeout(restoreScrollPosition, 100)
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition)
      clearTimeout(timer)
    }
  }, [saveScrollPosition, restoreScrollPosition])
  
  return { scrollRef, saveScrollPosition, restoreScrollPosition }
}

// パフォーマンス最適化フック
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return reducedMotion
}

// アニメーション設定の取得
export function getAnimationConfig(reducedMotion: boolean) {
  return {
    duration: reducedMotion ? 0 : 0.2,
    ease: reducedMotion ? undefined : [0.4, 0, 0.2, 1] as [number, number, number, number],
    scale: reducedMotion ? 1 : undefined,
    transition: reducedMotion ? undefined : "all 0.2s ease-out"
  }
}