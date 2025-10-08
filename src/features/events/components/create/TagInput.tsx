'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion, Reorder } from 'framer-motion'
import { Hash, Tag, TrendingUp, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useSmartTagSuggestions } from '../../hooks/useSmartTagSuggestions'
import { useTagInput } from '../../hooks/useTagInput'

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

export const TagInput = ({ selectedTags, onChange, onTabNext, contextualSuggestions = [] }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Popular tags (in practice, would be fetched from database)
  const trendingTags: Tag[] = [
    { id: '1', name: 'Work', color: '#3b82f6', frequency: 45 },
    { id: '2', name: 'Personal', color: '#10b981', frequency: 32 },
    { id: '3', name: 'Important', color: '#f59e0b', frequency: 28 },
    { id: '4', name: 'Meeting', color: '#8b5cf6', frequency: 24 },
    { id: '5', name: 'Report', color: '#ef4444', frequency: 18 },
    { id: '6', name: 'Weekend Prep', color: '#06b6d4', frequency: 12 },
    { id: '7', name: 'Overtime', color: '#f97316', frequency: 8 },
  ]

  // Recent tags (in practice, would be fetched from local storage)
  const recentTags: Tag[] = [
    { id: '8', name: 'Planning', color: '#ec4899' },
    { id: '9', name: 'Presentation', color: '#14b8a6' },
    { id: '10', name: 'Design', color: '#6366f1' },
  ]

  // スマート提案ロジック（フック化）
  const { suggestions } = useSmartTagSuggestions({
    inputValue,
    selectedTags,
    contextualSuggestions,
    trendingTags,
  })

  // タグ入力ロジック（フック化）
  const { addTag, removeTag } = useTagInput({
    selectedTags,
    onChange,
    onInputClear: () => setInputValue(''),
    onSuggestionsHide: () => setShowSuggestions(false),
  })

  // jsx-no-bind optimization: Tag add handler creator
  const createTagAddHandler = useCallback(
    (tagName: string) => {
      return () => addTag(tagName)
    },
    [addTag]
  )

  // jsx-no-bind optimization: Tag remove handler creator
  const createTagRemoveHandler = useCallback(
    (tagId: string) => {
      return () => removeTag(tagId)
    },
    [removeTag]
  )

  // Input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  // Dynamic click handlers
  const createSuggestionClickHandler = useCallback((suggestionName: string) => {
    return () => addTag(suggestionName)
  }, [addTag])

  // キーボード操作のヘルパー関数群
  const handleTabKey = () => {
    if (showSuggestions && suggestions.length > 0) {
      addTag(suggestions[focusedSuggestionIndex].name)
    } else {
      onTabNext?.()
    }
  }

  const handleEnterKey = () => {
    if (showSuggestions && suggestions.length > 0) {
      addTag(suggestions[focusedSuggestionIndex].name)
    } else if (inputValue.trim().length > 0) {
      // Remove # if present, otherwise add as is
      const tagName = inputValue.startsWith('#') ? inputValue.slice(1).trim() : inputValue.trim()
      if (tagName) {
        addTag(tagName)
      }
    }
  }

  const handleArrowDown = () => {
    setFocusedSuggestionIndex((focusedSuggestionIndex + 1) % suggestions.length)
  }

  const handleArrowUp = () => {
    setFocusedSuggestionIndex(focusedSuggestionIndex === 0 ? suggestions.length - 1 : focusedSuggestionIndex - 1)
  }

  const handleEscapeKey = () => {
    setShowSuggestions(false)
    setInputValue('')
  }

  const handleBackspaceKey = () => {
    if (!inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    }
  }

  const handleSpaceKey = () => {
    if (!inputValue.trim()) {
      // Show popular tags when empty
      setShowSuggestions(true)
    } else {
      // Add as new tag when input exists
      const tagName = inputValue.startsWith('#') ? inputValue.slice(1).trim() : inputValue.trim()
      if (tagName) {
        addTag(tagName)
      }
    }
  }

  // jsx-no-bind optimization: キーボード操作（リファクタリング済み）
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Tab':
        e.preventDefault()
        handleTabKey()
        return

      case 'Enter':
        e.preventDefault()
        handleEnterKey()
        return

      case 'ArrowDown':
        if (showSuggestions) {
          e.preventDefault()
          handleArrowDown()
        }
        break

      case 'ArrowUp':
        if (showSuggestions) {
          e.preventDefault()
          handleArrowUp()
        }
        break

      case 'Escape':
        handleEscapeKey()
        break

      case 'Backspace':
        handleBackspaceKey()
        break

      case ' ':
        e.preventDefault()
        handleSpaceKey()
        break
    }
  }, [showSuggestions, handleTabKey, handleEnterKey, handleArrowDown, handleArrowUp, handleEscapeKey, handleBackspaceKey, handleSpaceKey])

  // Input value changes and filtering
  useEffect(() => {
    const shouldShowSuggestions = inputValue.trim().length > 0
    setShowSuggestions(shouldShowSuggestions)
    setFocusedSuggestionIndex(0)
  }, [inputValue])

  // Tag display size (frequency based)
  const getTagSize = (frequency?: number) => {
    if (!frequency) return 'text-sm px-3 py-1.5'
    if (frequency > 30) return 'text-base px-4 py-2'
    if (frequency > 20) return 'text-sm px-3 py-1.5'
    return 'text-xs px-2 py-1'
  }

  return (
    <div className="space-y-4">
      {/* New tag input */}
      <div className="relative">
        <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Add tags to categorize your event</div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter tag and press Enter to add..."
            className={cn(
              "w-full py-3 pl-3 pr-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700",
              "rounded-md text-base transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              selectedTags.length >= 5 && "cursor-not-allowed opacity-50",
              inputValue.trim() && "ring-1 ring-blue-200 dark:ring-blue-800"
            )}
            disabled={selectedTags.length >= 5}
          />

          {/* Enter ヒント */}
          <AnimatePresence>
            {inputValue.trim() && selectedTags.length < 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2"
              >
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Enter</div>
                <div className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded border border-neutral-300 text-xs font-medium dark:border-neutral-600">
                  ⏎
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedTags.length >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-6 left-0 text-sm text-amber-600 dark:text-amber-400"
          >
            最大5個までです
          </motion.div>
        )}

        {/* サジェスト */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 ? <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg max-h-60 overflow-y-auto shadow-lg"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  type="button"
                  key={suggestion.id}
                  onClick={createSuggestionClickHandler(suggestion.name)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
                    index === focusedSuggestionIndex
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                    index === 0 && "rounded-t-lg",
                    index === suggestions.length - 1 && "rounded-b-lg"
                  )}
                >
                  <span className="text-lg" style={{ color: suggestion.color }}>
                    #
                  </span>
                  <span className="text-base text-neutral-900 dark:text-neutral-50">{suggestion.name}</span>
                  {suggestion.frequency != null && (
                    <span className="ml-auto text-sm text-neutral-600 dark:text-neutral-400">{suggestion.frequency}回</span>
                  )}
                </button>
              ))}
            </motion.div> : null}
        </AnimatePresence>
      </div>

      {/* Popular tags */}
      <div className="ml-4">
        <div className="mb-3 flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <TrendingUp size={16} />
          <span className="text-sm font-medium">Popular</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags
            .filter((tag) => !selectedTags.some((selected) => selected.name === tag.name))
            .slice(0, 5)
            .map((tag) => (
              <motion.button
                key={tag.id}
                onClick={createTagAddHandler(tag.name)}
                className={` ${getTagSize(tag.frequency)} rounded-full border font-medium transition-all duration-200 hover:scale-105 hover:shadow-md`}
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}40`,
                  color: tag.color,
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

      {/* Recent tags */}
      {recentTags.length > 0 && (
        <div className="ml-4">
          <div className="mb-3 flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Hash size={16} />
            <span className="text-sm font-medium">最近</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTags
              .filter((tag) => !selectedTags.some((selected) => selected.name === tag.name))
              .map((tag) => (
                <motion.button
                  key={tag.id}
                  onClick={createTagAddHandler(tag.name)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm`}
                  style={{
                    backgroundColor: `${tag.color}10`,
                    borderColor: `${tag.color}30`,
                    color: tag.color,
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

      {/* Selected tags */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="ml-4"
          >
            <div className="mb-3 flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <span className="text-sm font-medium">選択済み</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">({selectedTags.length}/5)</span>
            </div>
            <Reorder.Group axis="x" values={selectedTags} onReorder={onChange} className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedTags.map((tag) => (
                  <Reorder.Item key={tag.id} value={tag}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0, y: -20 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                        mass: 1,
                      }}
                      className="flex cursor-move items-center gap-2 rounded-full px-3 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                      style={{ borderColor: tag.color }}
                      whileHover={{ scale: 1.05 }}
                      whileDrag={{ scale: 1.1 }}
                    >
                      <span style={{ color: tag.color }}>#</span>
                      <span className="text-neutral-900 dark:text-neutral-50">{tag.name}</span>
                      <button
                        type="button"
                        onClick={createTagRemoveHandler(tag.id)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 text-neutral-600 dark:text-neutral-400 hover:text-red-500"
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
    </div>
  )
}
