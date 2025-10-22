'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  onSmartExtract?: (data: { title: string; date?: Date; tags: string[] }) => void
  onTabNext?: () => void
  autoFocus?: boolean
}

export const TitleInput = ({ value, onChange, onSmartExtract, onTabNext, autoFocus = false }: TitleInputProps) => {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // jsx-no-bind optimization: Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  // jsx-no-bind optimization: Focus handler
  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  // jsx-no-bind optimization: Blur handler
  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])
  const [animatedValue, setAnimatedValue] = useState('')

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const focusInput = () => {
        inputRef.current?.focus()
      }
      // Focus immediately + delayed for reliability
      focusInput()
      setTimeout(focusInput, 100)
    }
  }, [autoFocus])

  // Text input animation
  useEffect(() => {
    if (value.length > animatedValue.length) {
      // When characters are added, animate one by one
      const newChar = value[value.length - 1]
      setAnimatedValue((prev) => prev + newChar)
    } else {
      // When deleted, update immediately
      setAnimatedValue(value)
    }
  }, [value, animatedValue.length])

  // 翻訳された日付キーワードを取得（indicator表示でも使用）
  const todayKeyword = t('events.create.dateKeywords.today')
  const tomorrowKeyword = t('events.create.dateKeywords.tomorrow')
  const nextWeekKeyword = t('events.create.dateKeywords.nextWeek')

  // Smart input analysis
  useEffect(() => {
    if (value && onSmartExtract) {
      const smartExtract = () => {
        // 日付パターンの検出
        const _datePatterns = [
          new RegExp(`${tomorrowKeyword}|tomorrow`, 'i'),
          new RegExp(`${t('events.create.dateKeywords.today')}|today`, 'i'),
          new RegExp(`${nextWeekKeyword}|next week`, 'i'),
          /(\d{1,2})時/,
          /(\d{1,2})\/(\d{1,2})/,
        ]

        // タグパターンの検出
        const tagMatches = value.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || []
        const tags = tagMatches.map((tag) => tag.slice(1)) // #を除去

        // Remove tags from title
        const cleanTitle = value.replace(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '').trim()

        // 日付の推測（翻訳されたキーワードで検出）
        let suggestedDate: Date | undefined
        if (value.includes(tomorrowKeyword) || value.includes('tomorrow')) {
          suggestedDate = new Date()
          suggestedDate.setDate(suggestedDate.getDate() + 1)
        } else if (value.includes(nextWeekKeyword) || value.includes('next week')) {
          suggestedDate = new Date()
          suggestedDate.setDate(suggestedDate.getDate() + 7)
        }

        if (cleanTitle || suggestedDate || tags.length > 0) {
          onSmartExtract({
            title: cleanTitle || value,
            date: suggestedDate,
            tags,
          })
        }
      }

      // デバウンス（300ms）
      const timeoutId = setTimeout(smartExtract, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [value, onSmartExtract, tomorrowKeyword, nextWeekKeyword, t])

  // jsx-no-bind optimization: Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enterキーで次のタブに移動
      if (e.key === 'Enter' && value.trim() && onTabNext) {
        e.preventDefault()
        onTabNext()
        return
      }

      // ESCでクリア、ダブルESCでモーダル閉じる
      if (e.key === 'Escape') {
        if (value) {
          onChange('')
          e.stopPropagation()
        }
        // 空の場合は親に処理を委譲（モーダルが閉じる）
      }
    },
    [value, onTabNext, onChange]
  )

  const _letterVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.15, ease: 'easeOut' },
    },
  }

  return (
    <div className="relative">
      {/* Main input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t('events.create.title.placeholder')}
          className={cn(
            'w-full resize-none border-none bg-transparent text-3xl leading-tight font-semibold outline-none',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'pl-3 text-neutral-900 transition-all duration-300 dark:text-neutral-50',
            'md:text-4xl lg:text-5xl',
            isFocused ? 'scale-105 transform' : 'scale-100 transform'
          )}
          style={{
            caretColor: '#3b82f6',
            textRendering: 'optimizeLegibility',
          }}
        />

        {/* Custom placeholder animation */}
        <AnimatePresence>
          {!value && !isFocused && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute inset-0"
            >
              <span className="text-3xl leading-tight font-semibold text-neutral-400 md:text-4xl lg:text-5xl dark:text-neutral-500">
                {t('events.create.title.placeholder')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar (shown when input starts) */}
      <AnimatePresence>
        {isFocused === true && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: Math.min(value.length / 20, 1),
              opacity: 1,
            }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{
              transformOrigin: 'left',
              width: '100%',
            }}
          />
        )}
      </AnimatePresence>

      {/* 文字数カウンター（50文字以上で表示） */}
      <AnimatePresence>
        {value.length >= 50 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'absolute right-0 -bottom-8 text-sm',
              value.length > 100 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-600 dark:text-neutral-400'
            )}
          >
            {t('events.create.charCount', { count: value.length })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* スマート抽出インジケーター */}
      <AnimatePresence>
        {(value.includes('#') || value.includes(tomorrowKeyword) || value.includes(todayKeyword)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-green-500"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full w-full rounded-full bg-green-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
