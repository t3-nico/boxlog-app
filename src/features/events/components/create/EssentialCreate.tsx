'use client'

import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { DateSelector } from './DateSelector'
import { TagInput } from './TagInput'
import { TitleInput } from './TitleInput'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialCreateProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; date: Date; endDate: Date; tags: Tag[] }) => Promise<void>
  initialData?: {
    title?: string
    date?: Date
    tags?: Tag[]
  }
}

// カスタムフック: フォーム状態管理
const useEssentialCreateForm = (initialData?: { title?: string; date?: Date; tags?: Tag[] }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(initialData?.date || new Date())
  const [endDate, setEndDate] = useState(() => {
    const defaultEnd = new Date(initialData?.date || new Date())
    defaultEnd.setTime(defaultEnd.getTime() + 60 * 60 * 1000) // 1時間後
    return defaultEnd
  })
  const [tags, setTags] = useState<Tag[]>(initialData?.tags || [])

  const isValid = title.trim().length > 0

  const handleTabNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2))
  }

  const handleTabPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const resetForm = () => {
    setTitle('')
    setDate(new Date())
    setTags([])
    setCurrentStep(0)
  }

  return {
    currentStep,
    title,
    setTitle,
    date,
    setDate,
    endDate,
    setEndDate,
    tags,
    setTags,
    isValid,
    handleTabNext,
    handleTabPrev,
    resetForm,
  }
}

// カスタムフック: スマート抽出機能
const useSmartExtraction = (
  tags: Tag[],
  setTitle: (title: string) => void,
  setDate: (date: Date) => void,
  setTags: (tags: Tag[]) => void
) => {
  const generateTagColor = (name: string): string => {
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ef4444',
      '#06b6d4',
      '#f97316',
      '#ec4899',
      '#14b8a6',
      '#6366f1',
    ]
    const hash = name.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length as keyof typeof colors]
  }

  const handleSmartExtract = (extracted: { title: string; date?: Date; tags: string[] }) => {
    setTitle(extracted.title)
    if (extracted.date) {
      setDate(extracted.date)
    }
    // 抽出されたタグを既存タグに追加
    const newTags = extracted.tags
      .filter((tagName) => !tags.some((tag) => tag.name === tagName))
      .map((tagName) => ({
        id: Date.now().toString() + Math.random(),
        name: tagName,
        color: generateTagColor(tagName),
      }))
    if (newTags.length > 0) {
      setTags((prev) => [...prev, ...newTags])
    }
  }

  return { handleSmartExtract }
}

// カスタムフック: 保存処理
const useSaveHandler = (isValid: boolean, onSave: Function, onClose: Function, resetForm: Function) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async (formData: { title: string; date: Date; endDate: Date; tags: Tag[] }) => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)

      // 成功アニメーション
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        setShowSuccess(false)
        resetForm()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    error,
    showSuccess,
    handleSave,
  }
}

// カスタムフック: キーボードショートカット
const useKeyboardShortcuts = (isOpen: boolean, isValid: boolean, onClose: Function, handleSave: Function) => {
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
  }, [isOpen, isValid, handleSave, onClose])
}

export const EssentialCreate = ({ isOpen, onClose, onSave, initialData }: EssentialCreateProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // カスタムフックでロジックを分離
  const formState = useEssentialCreateForm(initialData)
  const { handleSmartExtract } = useSmartExtraction(
    formState.tags,
    formState.setTitle,
    formState.setDate,
    formState.setTags
  )
  const saveHandler = useSaveHandler(formState.isValid, onSave, onClose, formState.resetForm)

  useKeyboardShortcuts(isOpen, formState.isValid, onClose, () =>
    saveHandler.handleSave({
      title: formState.title,
      date: formState.date,
      endDate: formState.endDate,
      tags: formState.tags,
    })
  )

  // アニメーション設定
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  }

  const successVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: [0, 1.2, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen === true && (
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
            className={cn('relative mx-4 w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl')}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-8 pb-4">
              <motion.h1
                className={cn('text-2xl font-semibold text-neutral-900 dark:text-neutral-50')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Create Event
              </motion.h1>
              <button
                type="button"
                onClick={onClose}
                className={cn('rounded-lg p-2 transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400')}
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
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300',
                        index <= formState.currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                      )}
                      animate={index === formState.currentStep ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {index < formState.currentStep ? <Check size={16} /> : index + 1}
                    </motion.div>
                    <span className={cn('text-sm font-medium', index <= formState.currentStep ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-400 dark:text-neutral-500')}>
                      {step}
                    </span>
                    {index < 2 && (
                      <div
                        className={cn('mx-2 h-0.5 w-8', index < formState.currentStep ? 'bg-blue-500' : 'bg-neutral-100 dark:bg-neutral-800')}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">
                {formState.currentStep === 0 && (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <TitleInput
                      value={formState.title}
                      onChange={formState.setTitle}
                      onSmartExtract={handleSmartExtract}
                      onTabNext={formState.handleTabNext}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={formState.handleTabNext}
                        disabled={!formState.title.trim()}
                        className={cn(
                          'rounded-lg px-6 py-3 font-medium transition-all duration-200',
                          formState.title.trim()
                            ? 'bg-blue-500 text-white hover:opacity-90'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        )}
                      >
                        Next: Date →
                      </button>
                    </div>
                  </motion.div>
                )}

                {formState.currentStep === 1 && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <DateSelector
                      value={formState.date}
                      endValue={formState.endDate}
                      onChange={formState.setDate}
                      onEndChange={formState.setEndDate}
                      onTabNext={formState.handleTabNext}
                    />
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={formState.handleTabPrev}
                        className={cn('rounded-lg px-6 py-3 font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200')}
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={formState.handleTabNext}
                        className={cn('rounded-lg px-6 py-3 font-medium bg-blue-500 text-white transition-all duration-200 hover:opacity-90')}
                      >
                        Next: Tags →
                      </button>
                    </div>
                  </motion.div>
                )}

                {formState.currentStep === 2 && (
                  <motion.div
                    key="tags"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <TagInput selectedTags={formState.tags} onChange={formState.setTags} contextualSuggestions={formState.title.split(' ')} />
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={formState.handleTabPrev}
                        className={cn('rounded-lg px-6 py-3 font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200')}
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          saveHandler.handleSave({
                            title: formState.title,
                            date: formState.date,
                            endDate: formState.endDate,
                            tags: formState.tags,
                          })
                        }
                        disabled={!formState.isValid || saveHandler.isSubmitting}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-8 py-3 font-medium transition-all duration-200',
                          formState.isValid && !saveHandler.isSubmitting
                            ? 'bg-blue-500 transform text-white hover:scale-105 hover:opacity-90'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        )}
                      >
                        {saveHandler.isSubmitting ? (
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
              {saveHandler.error != null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn('mx-8 mb-8 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3')}
                >
                  <div className="flex-shrink-0">⚠️</div>
                  <div>
                    <div className="text-sm font-medium">エラーが発生しました</div>
                    <div className="text-sm opacity-90">{saveHandler.error}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 成功アニメーション */}
            <AnimatePresence>
              {saveHandler.showSuccess != null && (
                <motion.div
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/95 dark:bg-gray-900/95"
                >
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <Check size={32} className="text-white" />
                    </motion.div>
                    <motion.h2
                      className={cn('text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2')}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      イベントが作成されました！
                    </motion.h2>
                    <motion.p
                      className={cn('text-base text-neutral-600 dark:text-neutral-400')}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {formState.title}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* キーボードヒント */}
            <div className={cn('px-8 pb-6 text-sm text-neutral-600 dark:text-neutral-400 space-x-4 text-center')}>
              <span>
                <kbd className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">Esc</kbd> to close
              </span>
              <span>
                <kbd className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">⌘</kbd> +{' '}
                <kbd className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">Enter</kbd> to save
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
