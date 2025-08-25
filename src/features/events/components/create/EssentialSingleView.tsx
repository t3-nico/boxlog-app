'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, FileText, Bell, Flag, MoreHorizontal, Repeat } from 'lucide-react'
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

interface EssentialSingleViewProps {
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

export function EssentialSingleView({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: EssentialSingleViewProps) {
  // メインフィールドの状態
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(() => {
    if (initialData?.date) return initialData.date
    // 現在時刻から15分単位で切り上げ
    const now = new Date()
    const minutes = now.getMinutes()
    let roundedMinutes
    
    if (minutes === 0) {
      roundedMinutes = 0
    } else if (minutes <= 15) {
      roundedMinutes = 15
    } else if (minutes <= 30) {
      roundedMinutes = 30
    } else if (minutes <= 45) {
      roundedMinutes = 45
    } else {
      roundedMinutes = 60
    }
    
    if (roundedMinutes === 60) {
      now.setHours(now.getHours() + 1)
      now.setMinutes(0, 0, 0)
    } else {
      now.setMinutes(roundedMinutes, 0, 0)
    }
    return now
  })
  const [endDate, setEndDate] = useState(() => {
    let startTime
    if (initialData?.date) {
      startTime = new Date(initialData.date)
    } else {
      // 現在時刻から15分単位で切り上げ
      const now = new Date()
      const minutes = now.getMinutes()
      let roundedMinutes
      
      if (minutes === 0) {
        roundedMinutes = 0
      } else if (minutes <= 15) {
        roundedMinutes = 15
      } else if (minutes <= 30) {
        roundedMinutes = 30
      } else if (minutes <= 45) {
        roundedMinutes = 45
      } else {
        roundedMinutes = 60
      }
      
      if (roundedMinutes === 60) {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0, 0, 0)
      } else {
        now.setMinutes(roundedMinutes, 0, 0)
      }
      startTime = now
    }
    const defaultEnd = new Date(startTime)
    defaultEnd.setTime(defaultEnd.getTime() + 60 * 60 * 1000) // 1時間後
    return defaultEnd
  })
  const [tags, setTags] = useState<Tag[]>(initialData?.tags || [])
  
  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // 追加オプション状態
  const [showMemo, setShowMemo] = useState(false)
  const [memo, setMemo] = useState('')
  const [reminder, setReminder] = useState<number | null>(null)
  const [priority, setPriority] = useState<'low' | 'necessary' | 'high'>('necessary')
  
  // 入力データの検証
  const isValid = title.trim().length > 0

  // プログレス計算
  const getProgress = () => {
    let progress = 0
    if (title.trim().length > 0) progress += 33.33  // タイトル入力済み
    if (date) progress += 33.33  // 日付設定済み
    if (tags.length > 0) progress += 33.34  // タグ選択済み
    return Math.min(progress, 100)
  }

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid) {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isValid])

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
      await onSave({ 
        title, 
        date, 
        endDate, 
        tags
      })
      
      // 成功アニメーション
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        setShowSuccess(false)
        // リセット
        setTitle('')
        setDate(new Date())
        setTags([])
      }, 1500)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.h1 
                    className={`${heading.h4} ${text.primary}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Create Event
                  </motion.h1>
                  
                  {/* 控えめなプログレス指標 */}
                  <div className="flex items-center gap-4">
                    {/* タイトル指標 */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          transition-all duration-300
                          ${title.trim() 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }
                        `}
                        animate={title.trim() ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {title.trim() ? '✓' : '1'}
                      </motion.div>
                      <span className={`text-xs ${title.trim() ? text.primary : text.muted}`}>
                        Title
                      </span>
                    </div>
                    
                    {/* 日付指標 */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          transition-all duration-300
                          ${date 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }
                        `}
                        animate={date ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {date ? '✓' : '2'}
                      </motion.div>
                      <span className={`text-xs ${date ? text.primary : text.muted}`}>
                        DateTime
                      </span>
                    </div>
                    
                    {/* タグ指標 */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          transition-all duration-300
                          ${tags.length > 0 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }
                        `}
                        animate={tags.length > 0 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {tags.length > 0 ? '✓' : '3'}
                      </motion.div>
                      <span className={`text-xs ${tags.length > 0 ? text.primary : text.muted}`}>
                        Tags
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className={`
                    p-2 rounded-lg transition-colors duration-200
                    hover:${background.surface} ${text.secondary}
                  `}
                >
                  <X size={20} />
                </button>
              </div>

            </div>

            {/* メインコンテンツ */}
            <div className="px-8 pb-8 space-y-6">
              {/* Title input */}
              <div>
                <TitleInput
                  value={title}
                  onChange={setTitle}
                  onSmartExtract={handleSmartExtract}
                  autoFocus={true}
                />
              </div>

              {/* 日付セクション */}
              <div>
                <DateSelector
                  value={date}
                  endValue={endDate}
                  onChange={setDate}
                  onEndChange={setEndDate}
                />
              </div>

              {/* Tags section */}
              <div className="pt-2">
                <TagInput
                  selectedTags={tags}
                  onChange={setTags}
                  contextualSuggestions={title.split(' ')}
                />
              </div>

              {/* 区切り線と追加オプション */}
              {(title.trim() || date || tags.length > 0) && (
                <div className="pt-4">
                  
                  {/* 追加オプション */}
                  <div className="flex items-center gap-4">
                    {/* 重要3つ */}
                    <div className="flex items-center gap-3">
                      {/* メモ追加 */}
                      <button
                        onClick={() => setShowMemo(!showMemo)}
                        className={`
                          p-3 rounded-lg transition-all duration-200 flex items-center gap-2
                          ${showMemo || memo 
                            ? `${primary.DEFAULT} text-white` 
                            : `${background.surface} ${text.secondary} hover:${background.elevated}`
                          }
                        `}
                        title="メモを追加"
                      >
                        <FileText size={18} />
                      </button>

                      {/* リマインダー設定 */}
                      <button
                        className={`
                          p-3 rounded-lg transition-all duration-200
                          ${reminder 
                            ? `${primary.DEFAULT} text-white` 
                            : `${background.surface} ${text.secondary} hover:${background.elevated}`
                          }
                        `}
                        title="リマインダー設定"
                      >
                        <Bell size={18} />
                      </button>

                      {/* リピート設定 */}
                      <button
                        className={`
                          p-3 rounded-lg transition-all duration-200
                          ${background.surface} ${text.secondary} hover:${background.elevated}
                        `}
                        title="リピート設定"
                      >
                        <Repeat size={18} />
                      </button>
                    </div>

                    {/* その他すべて */}
                    <button
                      className={`
                        p-3 rounded-lg transition-all duration-200
                        ${background.surface} ${text.secondary} hover:${background.elevated}
                      `}
                      title="その他のオプション"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* メモ入力欄 */}
                  <AnimatePresence>
                    {showMemo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <textarea
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                          placeholder="メモやコメントを入力..."
                          className={`
                            w-full p-3 ${background.surface} ${text.primary}
                            border border-neutral-200 dark:border-neutral-700
                            rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                          `}
                          rows={3}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* エラー表示 */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`
                      p-4 rounded-lg
                      ${semantic.error.background} ${semantic.error.text}
                      flex items-center gap-3
                    `}
                  >
                    <div className="flex-shrink-0">⚠️</div>
                    <div>
                      <div className={`${body.small} font-medium`}>An error occurred</div>
                      <div className={`${body.small} opacity-90`}>{error}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* フッター */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className={`${body.small} ${text.muted} flex items-center gap-4`}>
                  <div>
                    <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">⌘</kbd> + 
                    <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs ml-1">Enter</kbd>
                    <span className="ml-2">Create with</span>
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">Esc</kbd>
                    <span className="ml-2">で閉じる</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className={`
                      px-6 py-3 rounded-lg font-medium
                      ${background.surface} ${text.secondary}
                      hover:${background.elevated} transition-all duration-200
                      border border-neutral-200 dark:border-neutral-700
                    `}
                  >
                    キャンセル
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!isValid || isSubmitting}
                    className={`
                      px-8 py-3 rounded-lg font-semibold flex items-center gap-2
                      transition-all duration-200
                      ${isValid && !isSubmitting
                        ? `${primary.DEFAULT} text-white hover:opacity-90 shadow-lg hover:shadow-xl`
                        : `${background.surface} ${text.muted} cursor-not-allowed`
                      }
                    `}
                    whileHover={isValid && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <span>Create</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* 成功アニメーション */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 rounded-2xl"
                >
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <Check size={24} className="text-white" />
                    </motion.div>
                    <motion.h2
                      className={`${heading.h4} ${text.primary} mb-2`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Created!
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}