'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { text, border, semantic } from '@/config/theme/colors'
import { body } from '@/config/theme/typography'

interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  onSmartExtract?: (data: { title: string; date?: Date; tags: string[] }) => void
  onTabNext?: () => void
  autoFocus?: boolean
}

export function TitleInput({ 
  value, 
  onChange, 
  onSmartExtract,
  onTabNext,
  autoFocus = false 
}: TitleInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [animatedValue, setAnimatedValue] = useState('')
  
  // オートフォーカス
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const focusInput = () => {
        inputRef.current?.focus()
      }
      // 即座に + 遅延で確実にフォーカス
      focusInput()
      setTimeout(focusInput, 100)
    }
  }, [autoFocus])

  // 文字入力アニメーション
  useEffect(() => {
    if (value.length > animatedValue.length) {
      // 文字が追加された場合、1文字ずつアニメーション
      const newChar = value[value.length - 1]
      setAnimatedValue(prev => prev + newChar)
    } else {
      // 削除された場合は即座に更新
      setAnimatedValue(value)
    }
  }, [value])

  // スマート入力解析
  useEffect(() => {
    if (value && onSmartExtract) {
      const smartExtract = () => {
        // 日付パターンの検出
        const datePatterns = [
          /明日|tomorrow/i,
          /今日|today/i,
          /来週|next week/i,
          /(\d{1,2})時/,
          /(\d{1,2})\/(\d{1,2})/,
        ]
        
        // タグパターンの検出
        const tagMatches = value.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || []
        const tags = tagMatches.map(tag => tag.slice(1)) // #を除去
        
        // タイトルからタグを除去
        const cleanTitle = value.replace(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '').trim()
        
        // 日付の推測
        let suggestedDate: Date | undefined
        if (value.includes('明日') || value.includes('tomorrow')) {
          suggestedDate = new Date()
          suggestedDate.setDate(suggestedDate.getDate() + 1)
        } else if (value.includes('来週') || value.includes('next week')) {
          suggestedDate = new Date()
          suggestedDate.setDate(suggestedDate.getDate() + 7)
        }
        
        if (cleanTitle || suggestedDate || tags.length > 0) {
          onSmartExtract({
            title: cleanTitle || value,
            date: suggestedDate,
            tags
          })
        }
      }
      
      // デバウンス（300ms）
      const timeoutId = setTimeout(smartExtract, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [value, onSmartExtract])

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  }

  return (
    <div className="relative">
      {/* メイン入力フィールド */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className={`
            w-full
            text-3xl md:text-4xl lg:text-5xl
            font-semibold
            leading-tight
            bg-transparent
            border-none
            outline-none
            resize-none
            placeholder:text-neutral-400 
            dark:placeholder:text-neutral-500
            ${text.primary}
            transition-all duration-300
            ${isFocused ? 'transform scale-105' : 'transform scale-100'}
          `}
          style={{ 
            caretColor: '#3b82f6',
            textRendering: 'optimizeLegibility'
          }}
        />
        
        {/* プレースホルダーのカスタムアニメーション */}
        <AnimatePresence>
          {!value && !isFocused && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
            >
              <span className="text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-400 dark:text-neutral-500 leading-tight">
                What needs to be done?
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* プログレスバー（入力開始で表示） */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: Math.min(value.length / 20, 1), 
              opacity: 1 
            }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ 
              transformOrigin: 'left',
              width: '100%'
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
            className={`absolute -bottom-8 right-0 ${body.small} ${
              value.length > 100 ? semantic.warning.text : text.muted
            }`}
          >
            {value.length}/100
          </motion.div>
        )}
      </AnimatePresence>

      {/* スマート抽出インジケーター */}
      <AnimatePresence>
        {(value.includes('#') || value.includes('明日') || value.includes('今日')) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-green-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}