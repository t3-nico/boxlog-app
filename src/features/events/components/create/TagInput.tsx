'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Plus, Hash, TrendingUp } from 'lucide-react'
import { text, background, border, primary, semantic } from '@/config/theme/colors'
import { body } from '@/config/theme/typography'
import { rounded } from '@/config/theme/rounded'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface TagInputProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
  onTabNext?: () => void
  contextualSuggestions?: string[]
}

export function TagInput({ 
  selectedTags, 
  onChange, 
  onTabNext,
  contextualSuggestions = []
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // よく使うタグ（実際にはデータベースから取得）
  const trendingTags: Tag[] = [
    { id: '1', name: '仕事', color: '#3b82f6', frequency: 45 },
    { id: '2', name: '個人', color: '#10b981', frequency: 32 },
    { id: '3', name: '重要', color: '#f59e0b', frequency: 28 },
    { id: '4', name: '会議', color: '#8b5cf6', frequency: 24 },
    { id: '5', name: 'レポート', color: '#ef4444', frequency: 18 },
    { id: '6', name: '週末準備', color: '#06b6d4', frequency: 12 },
    { id: '7', name: '残業', color: '#f97316', frequency: 8 }
  ]

  // 最近使ったタグ（実際にはローカルストレージから取得）
  const recentTags: Tag[] = [
    { id: '8', name: '企画', color: '#ec4899' },
    { id: '9', name: 'プレゼン', color: '#14b8a6' },
    { id: '10', name: 'デザイン', color: '#6366f1' }
  ]

  // コンテキストベースのスマート提案
  const getSmartSuggestions = (input: string, context: string[]): Tag[] => {
    const suggestions: Tag[] = []
    
    // 入力に基づく提案
    const matchingTrending = trendingTags.filter(tag => 
      tag.name.toLowerCase().includes(input.toLowerCase())
    )
    suggestions.push(...matchingTrending)
    
    // コンテキストベースの提案
    context.forEach(contextWord => {
      if (contextWord.includes('会議') && !suggestions.some(t => t.name === '会議')) {
        suggestions.push({ id: 'ctx-1', name: '会議', color: '#8b5cf6' })
      }
      if (contextWord.includes('レポート') && !suggestions.some(t => t.name === 'レポート')) {
        suggestions.push({ id: 'ctx-2', name: 'レポート', color: '#ef4444' })
      }
    })
    
    // 時間ベースの提案
    const hour = new Date().getHours()
    if (hour >= 17 && !suggestions.some(t => t.name === '残業')) {
      suggestions.push({ id: 'time-1', name: '残業', color: '#f97316' })
    }
    
    // 曜日ベースの提案
    const day = new Date().getDay()
    if (day === 5 && !suggestions.some(t => t.name === '週末準備')) { // 金曜日
      suggestions.push({ id: 'day-1', name: '週末準備', color: '#06b6d4' })
    }
    
    return suggestions.filter(tag => 
      !selectedTags.some(selected => selected.name === tag.name)
    ).slice(0, 8)
  }

  // 入力に応じたサジェスト（#なしでも動作）
  const suggestions = inputValue.trim().length > 0
    ? getSmartSuggestions(
        inputValue.startsWith('#') ? inputValue.slice(1) : inputValue, 
        contextualSuggestions
      )
    : []

  // タグの色を生成
  const generateTagColor = (name: string): string => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', 
      '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1'
    ]
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  // タグを追加
  const addTag = (tagName: string) => {
    if (selectedTags.length >= 5) return // 最大5個制限
    
    const newTag: Tag = {
      id: Date.now().toString(),
      name: tagName,
      color: generateTagColor(tagName)
    }
    
    if (!selectedTags.some(tag => tag.name === tagName)) {
      onChange([...selectedTags, newTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  // タグを削除
  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (showSuggestions && suggestions.length > 0) {
        addTag(suggestions[focusedSuggestionIndex].name)
      } else {
        onTabNext?.()
      }
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && suggestions.length > 0) {
        addTag(suggestions[focusedSuggestionIndex].name)
      } else if (inputValue.trim().length > 0) {
        // # があれば除去し、なくてもそのまま追加
        const tagName = inputValue.startsWith('#') ? inputValue.slice(1).trim() : inputValue.trim()
        if (tagName) {
          addTag(tagName)
        }
      }
      return
    }

    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setFocusedSuggestionIndex(
        (focusedSuggestionIndex + 1) % suggestions.length
      )
    }

    if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setFocusedSuggestionIndex(
        focusedSuggestionIndex === 0 
          ? suggestions.length - 1 
          : focusedSuggestionIndex - 1
      )
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setInputValue('')
    }

    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    }

    // スペースキーで処理
    if (e.key === ' ') {
      if (!inputValue.trim()) {
        // 空の場合は頻出タグを表示
        e.preventDefault()
        setShowSuggestions(true)
      } else {
        // 入力がある場合は新規タグとして追加
        e.preventDefault()
        const tagName = inputValue.startsWith('#') ? inputValue.slice(1).trim() : inputValue.trim()
        if (tagName) {
          addTag(tagName)
        }
      }
    }
  }

  // 入力値の変化とフィルタリング
  useEffect(() => {
    const shouldShowSuggestions = inputValue.trim().length > 0
    setShowSuggestions(shouldShowSuggestions)
    setFocusedSuggestionIndex(0)
  }, [inputValue])

  // タグの表示サイズ（頻度ベース）
  const getTagSize = (frequency?: number) => {
    if (!frequency) return 'text-sm px-3 py-1.5'
    if (frequency > 30) return 'text-base px-4 py-2'
    if (frequency > 20) return 'text-sm px-3 py-1.5'
    return 'text-xs px-2 py-1'
  }

  return (
    <div className="space-y-4">
      {/* トレンドタグ */}
      <div>
        <div className={`flex items-center gap-2 mb-3 ${text.secondary}`}>
          <TrendingUp size={16} />
          <span className={`${body.small} font-medium`}>よく使う</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags
            .filter(tag => !selectedTags.some(selected => selected.name === tag.name))
            .slice(0, 5)
            .map(tag => (
              <motion.button
                key={tag.id}
                onClick={() => addTag(tag.name)}
                className={`
                  ${getTagSize(tag.frequency)} font-medium rounded-full
                  transition-all duration-200 border
                  hover:scale-105 hover:shadow-md
                `}
                style={{ 
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}40`,
                  color: tag.color
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                title={`使用回数: ${tag.frequency}回`}
              >
                <span className="mr-1">#</span>
                {tag.name}
              </motion.button>
            ))}
        </div>
      </div>

      {/* 最近のタグ */}
      {recentTags.length > 0 && (
        <div>
          <div className={`flex items-center gap-2 mb-3 ${text.secondary}`}>
            <Hash size={16} />
            <span className={`${body.small} font-medium`}>最近</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTags
              .filter(tag => !selectedTags.some(selected => selected.name === tag.name))
              .map(tag => (
                <motion.button
                  key={tag.id}
                  onClick={() => addTag(tag.name)}
                  className={`
                    text-sm px-3 py-1.5 font-medium rounded-full
                    transition-all duration-200 border
                    hover:scale-105 hover:shadow-sm
                  `}
                  style={{ 
                    backgroundColor: `${tag.color}10`,
                    borderColor: `${tag.color}30`,
                    color: tag.color
                  }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-1">#</span>
                  {tag.name}
                </motion.button>
              ))}
          </div>
        </div>
      )}

      {/* 選択済みタグ */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={`flex items-center gap-2 mb-3 ${text.secondary}`}>
              <span className={`${body.small} font-medium`}>選択済み</span>
              <span className={`${body.small} ${text.muted}`}>
                ({selectedTags.length}/5)
              </span>
            </div>
            <Reorder.Group
              axis="x"
              values={selectedTags}
              onReorder={onChange}
              className="flex flex-wrap gap-2"
            >
              <AnimatePresence>
                {selectedTags.map(tag => (
                  <Reorder.Item key={tag.id} value={tag}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-full
                        font-medium text-sm cursor-move
                        ${background.elevated} ${border.universal}
                      `}
                      style={{ borderColor: tag.color }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span style={{ color: tag.color }}>#</span>
                      <span className={text.primary}>{tag.name}</span>
                      <button
                        onClick={() => removeTag(tag.id)}
                        className={`
                          ml-1 p-0.5 rounded-full transition-colors
                          hover:bg-red-100 dark:hover:bg-red-900/20
                          ${text.muted} hover:text-red-500
                        `}
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 新規タグ入力 */}
      <div className="relative">
        <div className={`flex items-center gap-2 mb-2 ${text.secondary}`}>
          <Plus size={16} />
          <span className={`${body.small} font-medium`}>新しいタグ</span>
        </div>
        
        <div className="relative flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="タグ名を入力... (例: 仕事, 重要)"
            className={`
              flex-1 p-3 ${background.surface} ${border.universal} 
              ${rounded.component.button.md} ${body.DEFAULT}
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${selectedTags.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={selectedTags.length >= 5}
          />
          <button
            onClick={() => {
              if (inputValue.trim().length > 0 && selectedTags.length < 5) {
                const tagName = inputValue.startsWith('#') ? inputValue.slice(1).trim() : inputValue.trim()
                if (tagName) {
                  addTag(tagName)
                }
              }
            }}
            disabled={!inputValue.trim() || selectedTags.length >= 5}
            className={`
              px-4 py-3 rounded-lg font-medium transition-all duration-200
              ${inputValue.trim() && selectedTags.length < 5
                ? `${primary.DEFAULT} text-white hover:opacity-90`
                : `${background.elevated} ${text.muted} cursor-not-allowed`
              }
            `}
          >
            追加
          </button>
        </div>
        
        {selectedTags.length >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`
              absolute -bottom-6 left-0 ${body.small} 
              ${semantic.warning.text}
            `}
          >
            最大5個までです
          </motion.div>
        )}

        {/* サジェスト */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`
                absolute top-full left-0 right-0 mt-2 z-50
                ${background.base} ${border.universal} ${rounded.component.button.lg}
                shadow-lg max-h-60 overflow-y-auto
              `}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => addTag(suggestion.name)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-colors duration-150
                    ${index === focusedSuggestionIndex 
                      ? `${background.elevated}` 
                      : `hover:${background.surface}`
                    }
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                  `}
                >
                  <span 
                    className="text-lg"
                    style={{ color: suggestion.color }}
                  >
                    #
                  </span>
                  <span className={`${body.DEFAULT} ${text.primary}`}>
                    {suggestion.name}
                  </span>
                  {suggestion.frequency && (
                    <span className={`ml-auto ${body.small} ${text.muted}`}>
                      {suggestion.frequency}回
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ヘルプテキスト */}
      <div className={`${body.small} ${text.muted} space-y-1`}>
        <div>💡 タグ名を入力すると候補が表示されます</div>
        <div>💡 <kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 rounded">Enter</kbd> または <kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 rounded">Space</kbd> で追加</div>
        <div>💡 ドラッグで順序変更可能</div>
      </div>
    </div>
  )
}