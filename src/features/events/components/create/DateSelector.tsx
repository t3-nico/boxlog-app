'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { text, background, border, primary } from '@/config/theme/colors'
import { body, heading } from '@/config/theme/typography'
import { rounded } from '@/config/theme/rounded'

interface DateSelectorProps {
  value: Date
  endValue?: Date
  onChange: (date: Date) => void
  onEndChange?: (date: Date) => void
  onTabNext?: () => void
}

export function DateSelector({ value, endValue, onChange, onEndChange, onTabNext }: DateSelectorProps) {
  
  // 日付を文字列に変換するヘルパー関数
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 終了時間のデフォルト値（開始時間の1時間後）
  const defaultEndTime = endValue || new Date(value.getTime() + 60 * 60 * 1000)

  // 日付変更ハンドラー
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    // 既存の時間を保持
    newDate.setHours(value.getHours(), value.getMinutes())
    onChange(newDate)
    
    // 終了日も同じ日に更新
    if (onEndChange) {
      const newEndDate = new Date(e.target.value)
      newEndDate.setHours(defaultEndTime.getHours(), defaultEndTime.getMinutes())
      onEndChange(newEndDate)
    }
  }

  // 開始時間変更ハンドラー
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newDate = new Date(value)
    newDate.setHours(hours, minutes)
    onChange(newDate)
    
    // 終了時間が開始時間より早い場合、自動で1時間後に設定
    if (onEndChange && defaultEndTime <= newDate) {
      const newEndDate = new Date(newDate.getTime() + 60 * 60 * 1000)
      onEndChange(newEndDate)
    }
  }

  // 終了時間変更ハンドラー
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onEndChange) return
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newDate = new Date(value) // 開始日と同じ日
    newDate.setHours(hours, minutes)
    onEndChange(newDate)
  }

  // クイック日付ボタン
  const quickDateOptions = [
    { 
      label: '今日', 
      getValue: () => {
        const today = new Date()
        today.setHours(value.getHours(), value.getMinutes())
        return today
      }
    },
    { 
      label: '明日', 
      getValue: () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(value.getHours(), value.getMinutes())
        return tomorrow
      }
    },
    { 
      label: '来週', 
      getValue: () => {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        nextWeek.setHours(value.getHours(), value.getMinutes())
        return nextWeek
      }
    }
  ]

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      onTabNext?.()
    }
  }

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* 日付入力セクション */}
      <div className="space-y-4">
        <div className={`flex items-center gap-2 ${text.primary}`}>
          <Calendar size={20} />
          <span className={`${body.DEFAULT} font-semibold`}>日付</span>
        </div>

        {/* クイック日付選択 */}
        <div className="flex gap-2">
          {quickDateOptions.map((option, index) => (
            <motion.button
              key={option.label}
              onClick={() => {
                const selectedDate = option.getValue()
                onChange(selectedDate)
                // 終了時間も同じ日に更新
                if (onEndChange) {
                  const newEndDate = new Date(selectedDate)
                  newEndDate.setHours(defaultEndTime.getHours(), defaultEndTime.getMinutes())
                  onEndChange(newEndDate)
                }
              }}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${background.elevated} ${text.secondary} hover:${background.surface}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        {/* 日付入力フィールド */}
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          className={`
            w-full p-4 text-center text-lg font-medium
            ${background.surface} ${border.universal} ${rounded.component.button.md}
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${text.primary}
          `}
        />
      </div>

      {/* 時間入力セクション */}
      <div className="space-y-4">
        <div className={`flex items-center gap-2 ${text.primary}`}>
          <Clock size={20} />
          <span className={`${body.DEFAULT} font-semibold`}>時間</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 開始時間 */}
          <div>
            <label className={`block ${body.small} font-medium ${text.secondary} mb-2`}>
              開始時間
            </label>
            <input
              type="time"
              value={formatTimeForInput(value)}
              onChange={handleStartTimeChange}
              className={`
                w-full p-3 text-center text-lg font-medium
                ${background.surface} ${border.universal} ${rounded.component.button.md}
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${text.primary}
              `}
            />
          </div>

          {/* 終了時間 */}
          <div>
            <label className={`block ${body.small} font-medium ${text.secondary} mb-2`}>
              終了時間
            </label>
            <input
              type="time"
              value={formatTimeForInput(defaultEndTime)}
              onChange={handleEndTimeChange}
              className={`
                w-full p-3 text-center text-lg font-medium
                ${background.surface} ${border.universal} ${rounded.component.button.md}
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${text.primary}
              `}
            />
          </div>
        </div>

        {/* 継続時間表示 */}
        {onEndChange && (
          <div className={`text-center ${body.small} ${text.muted}`}>
            継続時間: {Math.round((defaultEndTime.getTime() - value.getTime()) / (1000 * 60))}分
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className={`${body.small} ${text.muted} text-center`}>
        <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">Tab</kbd>
        {' '}でタグ選択へ進む
      </div>
    </div>
  )
}