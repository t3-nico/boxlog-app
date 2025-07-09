'use client'

import { useRef, useEffect, useState, useCallback, RefObject } from 'react'
import { HOUR_HEIGHT, SCROLL_OPTIONS } from '../constants/grid-constants'

// スクロール同期フック
export function useScrollSync() {
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const syncedRefs = useRef<Set<HTMLElement>>(new Set())
  
  const registerElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      syncedRefs.current.add(element)
    }
  }, [])
  
  const unregisterElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      syncedRefs.current.delete(element)
    }
  }, [])
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const newScrollLeft = target.scrollLeft
    const newScrollTop = target.scrollTop
    
    setScrollLeft(newScrollLeft)
    setScrollTop(newScrollTop)
    
    // 他の要素と同期
    syncedRefs.current.forEach(element => {
      if (element !== target) {
        element.scrollLeft = newScrollLeft
        element.scrollTop = newScrollTop
      }
    })
  }, [])
  
  const scrollToPosition = useCallback((left: number, top: number) => {
    syncedRefs.current.forEach(element => {
      element.scrollTo({ left, top, ...SCROLL_OPTIONS })
    })
  }, [])
  
  return {
    scrollLeft,
    scrollTop,
    handleScroll,
    registerElement,
    unregisterElement,
    scrollToPosition
  }
}

// 時間位置への自動スクロール
export function useScrollToTime(
  containerRef: RefObject<HTMLElement>,
  initialTime?: string
) {
  const [isInitialized, setIsInitialized] = useState(false)
  
  const scrollToTime = useCallback((time: string) => {
    if (!containerRef.current) return
    
    const [hours, minutes] = time.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return
    
    const scrollTop = (hours * HOUR_HEIGHT) + (minutes * (HOUR_HEIGHT / 60)) - 100
    
    containerRef.current.scrollTo({
      top: Math.max(0, scrollTop),
      ...SCROLL_OPTIONS
    })
  }, [containerRef])
  
  const scrollToCurrentTime = useCallback(() => {
    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    scrollToTime(timeString)
  }, [scrollToTime])
  
  useEffect(() => {
    if (!isInitialized && containerRef.current) {
      if (initialTime) {
        scrollToTime(initialTime)
      } else {
        scrollToCurrentTime()
      }
      setIsInitialized(true)
    }
  }, [initialTime, scrollToTime, scrollToCurrentTime, isInitialized, containerRef])
  
  return { scrollToTime, scrollToCurrentTime }
}

// 仮想スクロール（パフォーマンス最適化）
export function useVirtualScroll(
  containerRef: RefObject<HTMLElement>,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: overscan })
  
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return
    
    const { scrollTop, clientHeight } = containerRef.current
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + clientHeight) / itemHeight)
    )
    
    setVisibleRange({
      start: Math.max(0, startIndex - overscan),
      end: Math.min(totalItems - 1, endIndex + overscan)
    })
  }, [containerRef, itemHeight, totalItems, overscan])
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => {
      updateVisibleRange()
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初期化時に実行
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [updateVisibleRange, containerRef])
  
  return visibleRange
}

// 時間範囲の可視性計算
export function useVisibleTimeRange(
  containerRef: RefObject<HTMLElement>,
  startHour: number = 0,
  endHour: number = 24
) {
  const [visibleRange, setVisibleRange] = useState({ 
    start: startHour, 
    end: Math.min(startHour + 12, endHour) 
  })
  
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return
    
    const { scrollTop, clientHeight } = containerRef.current
    const startHourVisible = Math.floor(scrollTop / HOUR_HEIGHT) + startHour
    const endHourVisible = Math.ceil((scrollTop + clientHeight) / HOUR_HEIGHT) + startHour
    
    setVisibleRange({
      start: Math.max(startHour, startHourVisible - 1), // 1時間のバッファ
      end: Math.min(endHour, endHourVisible + 1)
    })
  }, [containerRef, startHour, endHour])
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => {
      updateVisibleRange()
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    updateVisibleRange() // 初期化時に実行
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [updateVisibleRange, containerRef])
  
  return visibleRange
}

// スムーズスクロール制御
export function useSmoothScroll(containerRef: RefObject<HTMLElement>) {
  const scrollToElement = useCallback((element: HTMLElement) => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    
    const scrollTop = containerRef.current.scrollTop + 
                     (elementRect.top - containerRect.top) - 
                     (containerRect.height / 2) + 
                     (elementRect.height / 2)
    
    containerRef.current.scrollTo({
      top: Math.max(0, scrollTop),
      ...SCROLL_OPTIONS
    })
  }, [containerRef])
  
  const scrollToPosition = useCallback((x: number, y: number) => {
    if (!containerRef.current) return
    
    containerRef.current.scrollTo({
      left: x,
      top: y,
      ...SCROLL_OPTIONS
    })
  }, [containerRef])
  
  const scrollIntoView = useCallback((selector: string) => {
    if (!containerRef.current) return
    
    const element = containerRef.current.querySelector(selector)
    if (element instanceof HTMLElement) {
      scrollToElement(element)
    }
  }, [containerRef, scrollToElement])
  
  return {
    scrollToElement,
    scrollToPosition,
    scrollIntoView
  }
}

// スクロール位置の復元
export function useScrollRestoration(
  containerRef: RefObject<HTMLElement>,
  storageKey: string
) {
  const [isRestored, setIsRestored] = useState(false)
  
  const saveScrollPosition = useCallback(() => {
    if (!containerRef.current) return
    
    const position = {
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    }
    
    localStorage.setItem(storageKey, JSON.stringify(position))
  }, [containerRef, storageKey])
  
  const restoreScrollPosition = useCallback(() => {
    if (!containerRef.current || isRestored) return
    
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const position = JSON.parse(saved)
        containerRef.current.scrollLeft = position.scrollLeft
        containerRef.current.scrollTop = position.scrollTop
        setIsRestored(true)
      } catch (error) {
        console.error('Failed to restore scroll position:', error)
      }
    }
  }, [containerRef, storageKey, isRestored])
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    // 復元
    restoreScrollPosition()
    
    // 保存
    const handleScroll = () => {
      saveScrollPosition()
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [saveScrollPosition, restoreScrollPosition, containerRef])
  
  return {
    saveScrollPosition,
    restoreScrollPosition,
    isRestored
  }
}

// モバイル向けタッチスクロール最適化
export function useTouchScroll(containerRef: RefObject<HTMLElement>) {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleTouchStart = () => {
      setIsScrolling(true)
    }
    
    const handleTouchEnd = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }
    
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('scroll', handleScroll)
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [containerRef])
  
  return { isScrolling }
}