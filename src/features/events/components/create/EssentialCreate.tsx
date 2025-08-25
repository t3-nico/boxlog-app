'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2 } from 'lucide-react'
import { TitleInput } from './TitleInput'
import { DateSelector } from './DateSelector'
import { TagInput } from './TagInput'
import { background, text, primary, semantic } from '@/config/theme/colors'
import { body, heading } from '@/config/theme/typography'
import { rounded } from '@/config/theme/rounded'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialCreateProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    date: Date
    endDate: Date
    tags: Tag[]
  }) => Promise<void>
  initialData?: {
    title?: string
    date?: Date
    tags?: Tag[]
  }
}

export function EssentialCreate({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: EssentialCreateProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(initialData?.date || new Date())
  const [endDate, setEndDate] = useState(() => {
    const defaultEnd = new Date(initialData?.date || new Date())
    defaultEnd.setTime(defaultEnd.getTime() + 60 * 60 * 1000) // 1時間後
    return defaultEnd
  })
  const [tags, setTags] = useState<Tag[]>(initialData?.tags || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // 入力データの検証
  const isValid = title.trim().length > 0

  // キーボードショートカットのハンドリング
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Cmd/Ctrl + N でフォーカス
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        // タイトル入力にフォーカス
      }

      // Escape でクローズ
      if (e.key === 'Escape') {
        onClose()
      }

      // Cmd/Ctrl + Enter で保存
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid) {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isOpen, isValid, title, date, tags])

  // スマート抽出のハンドリング
  const handleSmartExtract = (extracted: {
    title: string
    date?: Date
    tags: string[]
  }) => {
    setTitle(extracted.title)
    if (extracted.date) {
      setDate(extracted.date)
    }
    // 抽出されたタグを既存タグに追加
    const newTags = extracted.tags
      .filter(tagName => !tags.some(tag => tag.name === tagName))
      .map(tagName => ({
        id: Date.now().toString() + Math.random(),
        name: tagName,
        color: generateTagColor(tagName)
      }))
    if (newTags.length > 0) {
      setTags(prev => [...prev, ...newTags])
    }
  }

  // タグの色生成
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

  // 保存処理
  const handleSave = async () => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave({ title, date, endDate, tags })
      
      // 成功アニメーション
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        setShowSuccess(false)
        // リセット
        setTitle('')
        setDate(new Date())
        setTags([])
        setCurrentStep(0)
      }, 1500)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tab navigation
  const handleTabNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2))
  }

  const handleTabPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  // アニメーション設定
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  }

  const successVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: [0, 1.2, 1],
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* メインカード */}
          <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative w-full max-w-2xl mx-4
              ${background.base} ${rounded.modal}
              shadow-2xl
            `}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-8 pb-4">
              <motion.h1 
                className={`${heading.h2} ${text.primary}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Create Event
              </motion.h1>
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  hover:${background.surface} ${text.secondary}
                `}
              >
                <X size={24} />
              </button>
            </div>

            {/* プログレス */}
            <div className="px-8 pb-6">
              <div className="flex items-center gap-4">
                {['Title', 'Date', 'Tags'].map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <motion.div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        transition-all duration-300
                        ${index <= currentStep 
                          ? `${primary.DEFAULT} text-white` 
                          : `${background.surface} ${text.muted}`
                        }
                      `}
                      animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {index < currentStep ? (
                        <Check size={16} />
                      ) : (
                        index + 1
                      )}
                    </motion.div>
                    <span className={`
                      text-sm font-medium
                      ${index <= currentStep ? text.primary : text.muted}
                    `}>
                      {step}
                    </span>
                    {index < 2 && (
                      <div className={`
                        w-8 h-0.5 mx-2
                        ${index < currentStep ? primary.DEFAULT : background.surface}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <TitleInput
                      value={title}
                      onChange={setTitle}
                      onSmartExtract={handleSmartExtract}
                      onTabNext={handleTabNext}
                      autoFocus={true}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleTabNext}
                        disabled={!title.trim()}
                        className={`
                          px-6 py-3 rounded-lg font-medium transition-all duration-200
                          ${title.trim() 
                            ? `${primary.DEFAULT} text-white hover:opacity-90` 
                            : `${background.surface} ${text.muted} cursor-not-allowed`
                          }
                        `}
                      >
                        Next: Date →
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <DateSelector
                      value={date}
                      endValue={endDate}
                      onChange={setDate}
                      onEndChange={setEndDate}
                      onTabNext={handleTabNext}
                    />
                    <div className="flex justify-between">
                      <button
                        onClick={handleTabPrev}
                        className={`
                          px-6 py-3 rounded-lg font-medium
                          ${background.surface} ${text.secondary}
                          hover:${background.elevated} transition-all duration-200
                        `}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleTabNext}
                        className={`
                          px-6 py-3 rounded-lg font-medium
                          ${primary.DEFAULT} text-white hover:opacity-90
                          transition-all duration-200
                        `}
                      >
                        Next: Tags →
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="tags"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <TagInput
                      selectedTags={tags}
                      onChange={setTags}
                      contextualSuggestions={title.split(' ')}
                    />
                    <div className="flex justify-between">
                      <button
                        onClick={handleTabPrev}
                        className={`
                          px-6 py-3 rounded-lg font-medium
                          ${background.surface} ${text.secondary}
                          hover:${background.elevated} transition-all duration-200
                        `}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!isValid || isSubmitting}
                        className={`
                          px-8 py-3 rounded-lg font-medium flex items-center gap-2
                          transition-all duration-200
                          ${isValid && !isSubmitting
                            ? `${primary.DEFAULT} text-white hover:opacity-90 transform hover:scale-105`
                            : `${background.surface} ${text.muted} cursor-not-allowed`
                          }
                        `}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Event'
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* エラー表示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`
                    mx-8 mb-8 p-4 rounded-lg
                    ${semantic.error.background} ${semantic.error.text}
                    flex items-center gap-3
                  `}
                >
                  <div className="flex-shrink-0">⚠️</div>
                  <div>
                    <div className={`${body.small} font-medium`}>エラーが発生しました</div>
                    <div className={`${body.small} opacity-90`}>{error}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 成功アニメーション */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 rounded-2xl"
                >
                  <div className="text-center">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <Check size={32} className="text-white" />
                    </motion.div>
                    <motion.h2
                      className={`${heading.h3} ${text.primary} mb-2`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      イベントが作成されました！
                    </motion.h2>
                    <motion.p
                      className={`${body.DEFAULT} ${text.secondary}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {title}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* キーボードヒント */}
            <div className={`px-8 pb-6 ${body.small} ${text.muted} text-center space-x-4`}>
              <span><kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 rounded">Esc</kbd> to close</span>
              <span><kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 rounded">⌘</kbd> + <kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 rounded">Enter</kbd> to save</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}