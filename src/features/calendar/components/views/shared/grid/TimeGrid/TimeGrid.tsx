/**
 * メインのタイムグリッドコンポーネント
 */

'use client'

import React, { memo, useRef, useEffect, useCallback } from 'react'
import { TimeColumn } from '../TimeColumn'
import { HourLines, HalfHourLines, QuarterHourLines } from '../GridLines'
import { SimpleCurrentTimeLine } from '../../'
import { useViewDimensions } from '../../hooks/useViewDimensions'
import { pixelsToTimeValues, calculateScrollPosition } from '../../utils/gridCalculator'
import { 
  HOUR_HEIGHT, 
  TIME_COLUMN_WIDTH, 
  GRID_BACKGROUND,
  SCROLL_TO_HOUR,
  SCROLL_BEHAVIOR 
} from '../../constants/grid.constants'
import type { TimeGridProps } from '../../types/grid.types'

export const TimeGrid = memo<TimeGridProps>(function TimeGrid({
  startHour = 0,
  endHour = 24,
  hourHeight = HOUR_HEIGHT,
  showHalfHourLines = true,
  showQuarterHourLines = false,
  showCurrentTime = true,
  className = '',
  children,
  onTimeClick,
  scrollToHour = SCROLL_TO_HOUR,
  displayDates = []
}) {
  const { containerRef, dimensions, scrollToTime, updateDimensions } = useViewDimensions({
    hourHeight,
    timeColumnWidth: TIME_COLUMN_WIDTH
  })
  
  const hasScrolledToInitial = useRef(false)
  
  // グリッドの総高さを計算
  const gridHeight = (endHour - startHour) * hourHeight
  
  // 初期スクロール位置の設定
  useEffect(() => {
    if (!hasScrolledToInitial.current && containerRef.current) {
      const targetPosition = calculateScrollPosition(scrollToHour, hourHeight, dimensions.containerHeight)
      containerRef.current.scrollTo({
        top: targetPosition,
        behavior: 'instant' as ScrollBehavior
      })
      hasScrolledToInitial.current = true
    }
  }, [scrollToHour, hourHeight, dimensions.containerHeight, containerRef])
  
  // グリッドクリックハンドラー
  const handleGridClick = useCallback((e: React.MouseEvent) => {
    if (!onTimeClick || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top + containerRef.current.scrollTop
    const x = e.clientX - rect.left
    
    // 時間列以外の領域のクリックのみ処理
    if (x < TIME_COLUMN_WIDTH) return
    
    const { hour, minute } = pixelsToTimeValues(y, hourHeight)
    
    // 表示範囲内の時間のみ処理
    if (hour >= startHour && hour < endHour) {
      onTimeClick(hour, minute)
    }
  }, [onTimeClick, containerRef, hourHeight, startHour, endHour])
  
  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${GRID_BACKGROUND} ${className}`}
      style={{ height: '100%' }}
      onClick={handleGridClick}
    >
      {/* 時間列（固定） */}
      <TimeColumn
        startHour={startHour}
        endHour={endHour}
        hourHeight={hourHeight}
      />
      
      {/* メインコンテンツエリア */}
      <div
        className="relative"
        style={{
          marginLeft: `${TIME_COLUMN_WIDTH}px`,
          height: `${gridHeight}px`,
          minHeight: `${gridHeight}px`
        }}
      >
        {/* グリッド線 */}
        <HourLines
          startHour={startHour}
          endHour={endHour}
          hourHeight={hourHeight}
        />
        
        {showHalfHourLines && (
          <HalfHourLines
            startHour={startHour}
            endHour={endHour}
            hourHeight={hourHeight}
          />
        )}
        
        {showQuarterHourLines && (
          <QuarterHourLines
            startHour={startHour}
            endHour={endHour}
            hourHeight={hourHeight}
          />
        )}
        
        {/* 現在時刻線 - ScrollableCalendarLayoutで統一表示するためコメントアウト */}
        {/* showCurrentTime && (
          <SimpleCurrentTimeLine
            hourHeight={hourHeight}
            displayDates={displayDates}
            timeColumnWidth={TIME_COLUMN_WIDTH}
          />
        ) */}
        
        {/* 子コンポーネント（イベント等） */}
        {children}
      </div>
    </div>
  )
})