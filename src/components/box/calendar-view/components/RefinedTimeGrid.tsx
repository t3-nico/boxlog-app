'use client'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isToday, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { SmoothScroll } from './SmoothScroll'
import { TimeSlotRipple } from './MicroInteractions'
import { HOUR_HEIGHT } from '../constants/grid-constants'

interface RefinedTimeGridProps {
  dates: Date[]
  startHour?: number
  endHour?: number
  gridInterval?: 15 | 30 | 60
  showBusinessHours?: boolean
  showCurrentTime?: boolean
  businessHours?: { start: number; end: number }
  onTimeSlotClick?: (date: Date, time: string, x: number, y: number) => void
  children?: React.ReactNode
  className?: string
}

// 現在時刻ライン
function CurrentTimeLine({ 
  containerRef, 
  isVisible 
}: { 
  containerRef: React.RefObject<HTMLDivElement>
  isVisible: boolean 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    if (!isVisible) return
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 1分毎に更新
    
    return () => clearInterval(timer)
  }, [isVisible])
  
  const topPosition = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    return ((hours * 60 + minutes) / 60) * HOUR_HEIGHT
  }, [currentTime])
  
  if (!isVisible) return null
  
  return (
    <motion.div
      className="cal-current-time-line"
      style={{ top: `${topPosition}px` }}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 時刻表示 */}
      <motion.div
        className="absolute left-16 top-0 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {format(currentTime, 'HH:mm')}
      </motion.div>
    </motion.div>
  )
}

// 時間軸ラベル
function TimeAxisLabels({ 
  startHour, 
  endHour, 
  interval,
  planRecordMode 
}: { 
  startHour: number
  endHour: number
  interval: number
  planRecordMode?: 'plan' | 'record' | 'both'
}) {
  const { timeFormat } = useCalendarSettingsStore()
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
  
  return (
    <div className="relative w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-900">
      
      {hours.map(hour => (
        <div 
          key={hour}
          className="relative"
          style={{ height: `${HOUR_HEIGHT}px` }}
        >
          {/* 正時ラベル */}
          <div className="absolute -top-2 left-0 right-0 text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
            {timeFormat === '12h' 
              ? format(new Date().setHours(hour, 0, 0, 0), 'ha')
              : `${hour.toString().padStart(2, '0')}:00`
            }
          </div>
          
          {/* 30分ラベル（60分間隔以外の場合） */}
          {interval < 60 && (
            <div 
              className="absolute left-0 right-0 text-xs text-gray-400 dark:text-gray-500 text-center"
              style={{ top: `${HOUR_HEIGHT / 2 - 6}px` }}
            >
              {timeFormat === '12h'
                ? format(new Date().setHours(hour, 30, 0, 0), 'h:mm')
                : `${hour.toString().padStart(2, '0')}:30`
              }
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// グリッド背景
function GridBackground({ 
  dates, 
  startHour, 
  endHour, 
  gridInterval,
  businessHours,
  showBusinessHours
}: {
  dates: Date[]
  startHour: number
  endHour: number
  gridInterval: number
  businessHours?: { start: number; end: number }
  showBusinessHours: boolean
}) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
  const slotsPerHour = 60 / gridInterval
  
  return (
    <div className="absolute inset-0">
      {/* 営業時間のハイライト */}
      {showBusinessHours && businessHours && (
        <motion.div
          className="cal-business-hours"
          style={{
            top: `${businessHours.start * HOUR_HEIGHT}px`,
            height: `${(businessHours.end - businessHours.start) * HOUR_HEIGHT}px`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      {/* 日付列 */}
      <div className="flex h-full">
        {dates.map((date, dateIndex) => (
          <div key={date.toISOString()} className="flex-1 relative">
            {/* 今日のハイライト */}
            {isToday(date) && (
              <motion.div
                className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
            
            {/* 垂直区切り線 */}
            {dateIndex < dates.length - 1 && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-200 dark:border-gray-700" />
            )}
            
            {/* 時間グリッド */}
            {hours.map(hour => (
              <div key={hour} className="relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                {/* 正時線 */}
                <div className="cal-grid-line-major absolute w-full top-0" />
                
                {/* 分割線 */}
                {Array.from({ length: slotsPerHour - 1 }, (_, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={cn(
                      "absolute w-full",
                      slotIndex === slotsPerHour / 2 - 1 
                        ? "cal-grid-line-minor" 
                        : "cal-grid-line-minor opacity-25"
                    )}
                    style={{ 
                      top: `${((slotIndex + 1) / slotsPerHour) * HOUR_HEIGHT}px` 
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// インタラクティブな時間スロット
function InteractiveTimeSlots({
  dates,
  startHour,
  endHour,
  gridInterval,
  onTimeSlotClick
}: {
  dates: Date[]
  startHour: number
  endHour: number
  gridInterval: number
  onTimeSlotClick?: (date: Date, time: string, x: number, y: number) => void
}) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
  const slotsPerHour = 60 / gridInterval
  
  const handleSlotClick = (date: Date, hour: number, slotIndex: number, x: number, y: number) => {
    const minutes = (slotIndex * gridInterval)
    const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    onTimeSlotClick?.(date, timeString, x, y)
  }
  
  return (
    <div className="absolute inset-0 flex">
      {dates.map((date, dateIndex) => (
        <div key={date.toISOString()} className="flex-1 relative">
          {hours.map(hour => (
            <div key={hour} className="relative" style={{ height: `${HOUR_HEIGHT}px` }}>
              {Array.from({ length: slotsPerHour }, (_, slotIndex) => (
                <div
                  key={slotIndex}
                  className={cn(
                    "cal-time-slot absolute w-full cursor-pointer",
                    "transition-colors duration-150"
                  )}
                  style={{ 
                    top: `${(slotIndex / slotsPerHour) * HOUR_HEIGHT}px`,
                    height: `${HOUR_HEIGHT / slotsPerHour}px`
                  }}
                >
                  <TimeSlotRipple
                    className="w-full h-full"
                    onRipple={(x, y) => handleSlotClick(date, hour, slotIndex, x, y)}
                  >
                    <div className="w-full h-full" />
                  </TimeSlotRipple>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// メインコンポーネント
export function RefinedTimeGrid({
  dates,
  startHour = 0,
  endHour = 24,
  gridInterval = 15,
  showBusinessHours = true,
  showCurrentTime = true,
  businessHours = { start: 9, end: 18 },
  onTimeSlotClick,
  children,
  className
}: RefinedTimeGridProps) {
  const { planRecordMode } = useCalendarSettingsStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const totalHeight = (endHour - startHour) * HOUR_HEIGHT
  const showCurrentTimeLine = showCurrentTime && dates.some(date => isToday(date))
  
  // 初期化時に現在時刻にスクロール（今日の場合）
  useEffect(() => {
    if (!isInitialized && containerRef.current && dates.some(date => isToday(date))) {
      const now = new Date()
      const currentHour = now.getHours()
      
      if (currentHour >= startHour && currentHour <= endHour) {
        const scrollTop = Math.max(0, (currentHour - 2) * HOUR_HEIGHT)
        containerRef.current.scrollTop = scrollTop
      }
      
      setIsInitialized(true)
    }
  }, [isInitialized, dates, startHour, endHour])
  
  return (
    <div className={cn("h-full flex bg-white dark:bg-gray-900", className)}>
      {/* 時間軸ラベル */}
      <TimeAxisLabels 
        startHour={startHour}
        endHour={endHour}
        interval={gridInterval}
        planRecordMode={planRecordMode}
      />
      
      {/* スクロール可能なグリッドエリア */}
      <SmoothScroll
        ref={containerRef}
        className="flex-1"
        showScrollIndicator={true}
        autoHide={true}
      >
        <motion.div 
          className="relative"
          style={{ height: totalHeight }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* グリッド背景 */}
          <GridBackground
            dates={dates}
            startHour={startHour}
            endHour={endHour}
            gridInterval={gridInterval}
            businessHours={businessHours}
            showBusinessHours={showBusinessHours}
          />
          
          {/* インタラクティブなタイムスロット */}
          {onTimeSlotClick && (
            <InteractiveTimeSlots
              dates={dates}
              startHour={startHour}
              endHour={endHour}
              gridInterval={gridInterval}
              onTimeSlotClick={onTimeSlotClick}
            />
          )}
          
          {/* 子要素（タスクなど） */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* 現在時刻ライン */}
          <AnimatePresence>
            {showCurrentTimeLine && (
              <CurrentTimeLine
                containerRef={containerRef}
                isVisible={true}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </SmoothScroll>
    </div>
  )
}

// 分割モード用の拡張版
export function SplitRefinedTimeGrid({
  dates,
  leftContent,
  rightContent,
  ...props
}: RefinedTimeGridProps & {
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}) {
  return (
    <RefinedTimeGrid dates={dates} {...props}>
      <div className="absolute inset-0 flex">
        {/* 左側コンテンツ */}
        <div className="w-1/2 pr-1 relative">
          {leftContent}
        </div>
        
        {/* 中央区切り線 */}
        <motion.div
          className="w-px bg-gray-400 dark:bg-gray-600 z-20"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        
        {/* 右側コンテンツ */}
        <div className="w-1/2 pl-1 relative">
          {rightContent}
        </div>
      </div>
    </RefinedTimeGrid>
  )
}

// ミニマル版（コンパクト表示用）
export function CompactTimeGrid({
  dates,
  hours = 12,
  ...props
}: Omit<RefinedTimeGridProps, 'startHour' | 'endHour'> & {
  hours?: number
}) {
  const currentHour = new Date().getHours()
  const startHour = Math.max(0, currentHour - Math.floor(hours / 2))
  const endHour = Math.min(24, startHour + hours)
  
  return (
    <RefinedTimeGrid
      {...props}
      dates={dates}
      startHour={startHour}
      endHour={endHour}
      className={cn("h-64", props.className)}
    />
  )
}