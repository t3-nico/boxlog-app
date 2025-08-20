/**
 * ビューのサイズ管理フック
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ViewDimensions } from '../types/view.types'

export interface UseViewDimensionsOptions {
  hourHeight?: number
  timeColumnWidth?: number
  onDimensionsChange?: (dimensions: ViewDimensions) => void
}

export function useViewDimensions(options: UseViewDimensionsOptions = {}) {
  const {
    hourHeight = 60,
    timeColumnWidth = 60,
    onDimensionsChange
  } = options
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<ViewDimensions>({
    containerWidth: 0,
    containerHeight: 0,
    contentWidth: 0,
    contentHeight: 0,
    scrollTop: 0,
    scrollLeft: 0,
    visibleTimeRange: {
      start: 0,
      end: 24
    }
  })
  
  // 可視時間範囲を計算
  const calculateVisibleTimeRange = useCallback((scrollTop: number, containerHeight: number) => {
    const startMinutes = (scrollTop * 60) / hourHeight
    const endMinutes = ((scrollTop + containerHeight) * 60) / hourHeight
    
    return {
      start: Math.floor(startMinutes / 60),
      end: Math.ceil(endMinutes / 60)
    }
  }, [hourHeight])
  
  // ディメンションを更新
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    const newDimensions: ViewDimensions = {
      containerWidth: rect.width,
      containerHeight: rect.height,
      contentWidth: rect.width - timeColumnWidth,
      contentHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft,
      visibleTimeRange: calculateVisibleTimeRange(container.scrollTop, rect.height)
    }
    
    setDimensions(newDimensions)
    
    if (onDimensionsChange) {
      onDimensionsChange(newDimensions)
    }
  }, [timeColumnWidth, calculateVisibleTimeRange, onDimensionsChange])
  
  // リサイズイベントの監視
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    
    // ResizeObserverでコンテナサイズの変更を監視
    let resizeObserver: ResizeObserver | null = null
    
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateDimensions)
      resizeObserver.observe(container)
    } else {
      // フォールバック: windowリサイズイベント
      window.addEventListener('resize', updateDimensions)
    }
    
    // 初回更新
    updateDimensions()
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', updateDimensions)
      }
    }
  }, [updateDimensions])
  
  // スクロールイベントの監視
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    
    const handleScroll = () => {
      setDimensions(prev => ({
        ...prev,
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
        visibleTimeRange: calculateVisibleTimeRange(container.scrollTop, prev.containerHeight)
      }))
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [calculateVisibleTimeRange])
  
  // 特定の位置にスクロール
  const scrollToPosition = useCallback((scrollTop?: number, scrollLeft?: number) => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    
    if (scrollTop !== undefined) {
      container.scrollTop = scrollTop
    }
    if (scrollLeft !== undefined) {
      container.scrollLeft = scrollLeft
    }
  }, [])
  
  // 特定の時間にスクロール
  const scrollToTime = useCallback((hour: number, minute: number = 0) => {
    const totalMinutes = hour * 60 + minute
    const scrollTop = (totalMinutes * hourHeight) / 60
    scrollToPosition(scrollTop)
  }, [hourHeight, scrollToPosition])
  
  return {
    containerRef,
    dimensions,
    scrollToPosition,
    scrollToTime,
    updateDimensions
  }
}