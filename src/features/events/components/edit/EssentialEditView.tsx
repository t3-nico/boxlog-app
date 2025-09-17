'use client'

import React from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, FileText, Bell, MoreHorizontal, Repeat, Trash2 } from 'lucide-react'

import { text, primary, semantic, colors } from '@/config/theme/colors'
import { rounded } from '@/config/theme/rounded'
import { body, heading } from '@/config/theme/typography'

import { DateSelector } from '../create/DateSelector'
import { TagInput } from '../create/TagInput'
import { TitleInput } from '../create/TitleInput'

import { useEssentialEditForm } from './hooks/useEssentialEditForm'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialEditViewProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
    status?: 'backlog' | 'scheduled'
  }) => Promise<void>
  onDelete?: () => Promise<void>
  initialData: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
  }
}

export const EssentialEditView = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}: EssentialEditViewProps) => {

  // カスタムフックで状態管理とロジックを抽出
  const {
    scheduleMode,
    title,
    date,
    endDate,
    tags,
    estimatedDuration,
    taskPriority,
    isSubmitting,
    error,
    showSuccess,
    showMemo,
    memo,
    reminder,
    priority,
    isValid,
    setTitle,
    setDate,
    setEndDate,
    setTags,
    setEstimatedDuration,
    setTaskPriority,
    setShowMemo,
    setMemo,
    setReminder,
    setPriority,
    handleScheduleModeChange,
    handleSave,
    handleSmartExtract
  } = useEssentialEditForm({
    initialData,
    isOpen,
    onSave,
    onClose
  })

  // 削除処理
  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete()
        onClose()
      } catch (err) {
        console.error('Failed to delete:', err)
      }
    }
  }

  // キーボードショートカット（ESC対応）
  React.useEffect(() => {
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
  }, [isOpen, isValid, onClose, handleSave])

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
              ${colors.background.base} ${rounded.modal}
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
                    Edit Event
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
                    hover:${colors.background.surface} ${text.secondary}
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
                            : `${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}`
                          }
                        `}
                        title="Add memo"
                      >
                        <FileText size={18} />
                      </button>

                      {/* リマインダー設定 */}
                      <button
                        className={`
                          p-3 rounded-lg transition-all duration-200
                          ${reminder 
                            ? `${primary.DEFAULT} text-white` 
                            : `${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}`
                          }
                        `}
                        title="Set reminder"
                      >
                        <Bell size={18} />
                      </button>

                      {/* リピート設定 */}
                      <button
                        className={`
                          p-3 rounded-lg transition-all duration-200
                          ${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}
                        `}
                        title="Set repeat"
                      >
                        <Repeat size={18} />
                      </button>
                    </div>


                    {/* その他すべて */}
                    <button
                      className={`
                        p-3 rounded-lg transition-all duration-200
                        ${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}
                      `}
                      title="More options"
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
                          placeholder="Enter memo or comments..."
                          className={`
                            w-full p-3 ${colors.background.surface} ${text.primary}
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
                {/* 削除ボタン（左端） */}
                <div>
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`
                        px-6 py-3 rounded-lg font-medium flex items-center gap-2
                        transition-all duration-200
                        ${semantic.error.surface} ${semantic.error.text} hover:opacity-90
                        border border-red-200 dark:border-red-800
                      `}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          Delete
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Cancel・Update ボタン（右端） */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className={`
                      px-6 py-3 rounded-lg font-medium
                      ${colors.background.surface} ${text.secondary}
                      hover:${colors.background.elevated} transition-all duration-200
                      border border-neutral-200 dark:border-neutral-700
                    `}
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!isValid || isSubmitting}
                    className={`
                      px-8 py-3 rounded-lg font-semibold flex items-center gap-2
                      transition-all duration-200
                      ${isValid && !isSubmitting
                        ? `${primary.DEFAULT} text-white hover:opacity-90 shadow-lg hover:shadow-xl`
                        : `${colors.background.surface} ${text.muted} cursor-not-allowed`
                      }
                    `}
                    whileHover={isValid && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <span>Update Event</span>
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
                      Updated!
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