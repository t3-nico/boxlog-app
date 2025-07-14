'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimeBlockDropZoneProps, TimeSuggestion } from '../types/timeBlock'

// 位置計算関数
function calculateTopPosition(time: Date, hourHeight: number = 60): number {
  const hours = time.getHours()
  const minutes = time.getMinutes()
  return ((hours * 60 + minutes) / 60) * hourHeight
}

export function TimeBlockDropZone({ 
  time, 
  onDrop,
  isOptimal = false,
  suggestion,
  hourHeight = 60,
  className
}: TimeBlockDropZoneProps & { hourHeight?: number; className?: string }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  const getQualityLevel = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 80) return 'excellent'
    if (score >= 65) return 'good'
    if (score >= 45) return 'fair'
    return 'poor'
  }
  
  const qualityLevel = suggestion ? getQualityLevel(suggestion.score) : 'fair'
  
  const qualityConfig = {
    excellent: {
      border: 'border-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle,
      pulse: 'animate-pulse'
    },
    good: {
      border: 'border-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Lightbulb,
      pulse: ''
    },
    fair: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: Clock,
      pulse: ''
    },
    poor: {
      border: 'border-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: AlertTriangle,
      pulse: ''
    }
  }
  
  const config = qualityConfig[qualityLevel]
  const Icon = config.icon
  
  return (
    <motion.div
      className={cn(
        "absolute left-0 right-0 transition-all duration-200 z-30",
        className
      )}
      style={{ 
        top: calculateTopPosition(time, hourHeight),
        height: `${hourHeight / 4}px` // 15分間隔
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(time)
        setIsDragOver(false)
      }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* ドロップゾーン */}
      <motion.div
        className={cn(
          "h-full mx-2 border-2 border-dashed rounded-lg transition-all duration-200",
          isDragOver && [
            config.border,
            config.bg,
            "border-solid shadow-lg scale-105"
          ],
          !isDragOver && [
            isOptimal ? config.border : "border-transparent",
            isOptimal ? config.bg.replace('50', '25').replace('20', '10') : "",
            "hover:border-gray-300 dark:hover:border-gray-600",
            config.pulse
          ]
        )}
      >
        {/* ドラッグオーバー時の表示 */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center h-full"
            >
              <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full", config.bg)}>
                <Icon className={cn("w-4 h-4", config.text)} />
                <span className={cn("text-sm font-medium", config.text)}>
                  ここにドロップ
                </span>
                {suggestion && (
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", config.text)}>
                    {suggestion.score}%
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* 最適化提案の表示 */}
      <AnimatePresence>
        {isOptimal && suggestion && !isDragOver && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full ml-2 top-0 z-40"
          >
            <div className={cn(
              "px-2 py-1 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap",
              config.bg,
              config.text,
              "border",
              config.border
            )}>
              <div className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                <span>{suggestion.score}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 詳細情報ツールチップ */}
      <AnimatePresence>
        {showDetails && suggestion && !isDragOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 top-full mt-1 z-50"
          >
            <div className="mx-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-4 h-4", config.text)} />
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  推奨度: {suggestion.score}%
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  qualityLevel === 'excellent' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                  qualityLevel === 'good' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                  qualityLevel === 'fair' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                  qualityLevel === 'poor' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                )}>
                  {qualityLevel === 'excellent' && '最適'}
                  {qualityLevel === 'good' && '良好'}
                  {qualityLevel === 'fair' && '普通'}
                  {qualityLevel === 'poor' && '注意'}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {suggestion.reason}
              </p>
              
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {time.toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })} から配置
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 複数の提案を表示するコンポーネント
export function TimeBlockSuggestions({ 
  suggestions, 
  onDrop,
  hourHeight = 60 
}: {
  suggestions: TimeSuggestion[]
  onDrop: (time: Date) => void
  hourHeight?: number
}) {
  const topSuggestions = useMemo(() => {
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // 上位5個まで表示
  }, [suggestions])
  
  return (
    <>
      {topSuggestions.map((suggestion, index) => (
        <TimeBlockDropZone
          key={`${suggestion.time.getTime()}-${index}`}
          time={suggestion.time}
          onDrop={onDrop}
          isOptimal={suggestion.score >= 70}
          suggestion={suggestion}
          hourHeight={hourHeight}
        />
      ))}
    </>
  )
}

// アニメーション付きスコア表示
export function ScoreIndicator({ 
  score, 
  className 
}: { 
  score: number
  className?: string 
}) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 65) return 'text-blue-600'
    if (score >= 45) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  return (
    <motion.div
      className={cn("flex items-center gap-1", className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={cn("text-lg font-bold", getColor(score))}
        animate={{ 
          scale: score >= 80 ? [1, 1.1, 1] : 1 
        }}
        transition={{ 
          duration: 0.5, 
          repeat: score >= 80 ? Infinity : 0, 
          repeatDelay: 2 
        }}
      >
        {score}%
      </motion.div>
      {score >= 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </motion.div>
      )}
    </motion.div>
  )
}

// グローバルドロップゾーン（カレンダー全体をカバー）
export function CalendarDropOverlay({ 
  isVisible, 
  onDrop,
  children 
}: {
  isVisible: boolean
  onDrop: (time: Date) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="w-full h-full bg-blue-500/5 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      タイムブロックを配置
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      最適な時間にドロップしてください
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}