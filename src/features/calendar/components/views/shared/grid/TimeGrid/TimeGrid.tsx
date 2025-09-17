/**
 * メインのタイムグリッドコンポーネント
 */

'use client'

import React, { memo, useRef, useEffect, useCallback } from 'react'

import { 
  HOUR_HEIGHT, 
  TIME_COLUMN_WIDTH, 
  GRID_BACKGROUND,
  SCROLL_TO_HOUR 
} from '../../constants/grid.constants'
import { useTimeSelection } from '../../hooks/useTimeSelection'
import { useViewDimensions } from '../../hooks/useViewDimensions'
import type { TimeGridProps } from '../../types/grid.types'
import { pixelsToTimeValues, calculateScrollPosition } from '../../utils/gridCalculator'
import { HourLines, HalfHourLines, QuarterHourLines } from '../GridLines'
import { TimeColumn } from '../TimeColumn'

export const TimeGrid = memo<TimeGridProps>(function TimeGrid({
  startHour = 0,
  endHour = 24,
  hourHeight = HOUR_HEIGHT,
  showHalfHourLines = true,
  showQuarterHourLines = false,
  _showCurrentTime = true,
  className = '',
  children,
  onTimeClick,
  onTimeRangeSelect,
  scrollToHour = SCROLL_TO_HOUR,
  _displayDates = []
}) {
  const { containerRef, dimensions, _scrollToTime, _updateDimensions } = useViewDimensions({
    hourHeight,
    timeColumnWidth: TIME_COLUMN_WIDTH
  })
  
  // ドラッグ選択機能
  const {
    isSelecting,
    handleMouseDown,
    selectionStyle
  } = useTimeSelection({
    hourHeight,
    timeColumnWidth: TIME_COLUMN_WIDTH,
    onTimeRangeSelect: onTimeRangeSelect ? (selection) => {
      // TimeSelectionをDate形式に変換してコールバックを呼ぶ
      const today = new Date()
      const _startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), selection.startHour, selection.startMinute)
      const _endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), selection.endHour, selection.endMinute)
      
      // 時間範囲の文字列を作成
      const startTimeStr = `${String(selection.startHour).padStart(2, '0')}:${String(selection.startMinute).padStart(2, '0')}`
      const endTimeStr = `${String(selection.endHour).padStart(2, '0')}:${String(selection.endMinute).padStart(2, '0')}`
      const timeRangeStr = `${startTimeStr}-${endTimeStr}`
      
      console.log('🎯 Time range selected:', { selection, timeRangeStr })
      
      // onTimeRangeSelectに渡すためのカスタムコールバック
      onTimeRangeSelect(selection)
    } : undefined
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
  
  // グリッドクリックハンドラー（ドラッグしていない場合のみ）
  const handleGridClick = useCallback((e: React.MouseEvent) => {
    // ドラッグ中はクリックを無視
    if (isSelecting || !onTimeClick || !containerRef.current) return
    
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
  }, [isSelecting, onTimeClick, containerRef, hourHeight, startHour, endHour])
  
  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      className={`relative overflow-auto ${GRID_BACKGROUND} ${className} ${isSelecting ? 'select-none' : ''}`}
      style={{ height: '100%' }}
      onClick={handleGridClick}
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // キーボードからの操作用のダミーイベントを作成
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const mockEvent = {
              currentTarget: containerRef.current,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              stopPropagation: () => {}
            } as React.MouseEvent
            handleGridClick(mockEvent)
          }
        }
      }}
      aria-label="Time grid - click to create event"
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background-color: rgb(229 229 229); /* neutral-200 - surface light */
        }
        div::-webkit-scrollbar-thumb {
          background-color: rgb(163 163 163); /* neutral-400 for visibility */
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background-color: rgb(115 115 115); /* neutral-500 */
        }
        @media (prefers-color-scheme: dark) {
          div::-webkit-scrollbar-track {
            background-color: rgb(38 38 38); /* neutral-800 - surface dark */
          }
          div::-webkit-scrollbar-thumb {
            background-color: rgb(115 115 115); /* neutral-500 */
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: rgb(163 163 163); /* neutral-400 */
          }
        }
      `}</style>
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
        
        {/* ドラッグ選択範囲の表示 */}
        {selectionStyle && (
          <div style={selectionStyle} className="drag-selection">
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
              新しいイベント
            </div>
          </div>
        )}
        
        {/* 子コンポーネント（イベント等） */}
        {children}
      </div>
    </div>
  )
})