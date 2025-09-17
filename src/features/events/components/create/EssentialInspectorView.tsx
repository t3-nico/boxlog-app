'use client'

import React from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check, FileText, Bell, MoreHorizontal, Repeat, Trash2, X } from 'lucide-react'

import { text, primary, semantic, colors } from '@/config/theme/colors'
import { body, heading } from '@/config/theme/typography'

import { DateSelector } from './DateSelector'
import { useEssentialInspectorForm } from './hooks/useEssentialInspectorForm'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { TagInput } from './TagInput'
import { TitleInput } from './TitleInput'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialInspectorViewProps {
  onClose: () => void
  onSave: (data: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number // 分
    priority?: 'low' | 'medium' | 'high'
    status?: 'backlog' | 'scheduled'
  }) => Promise<void>
  onDelete?: () => Promise<void>
  isEditMode?: boolean
  initialData?: {
    title?: string
    date?: Date
    endDate?: Date
    tags?: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
  }
}

export const EssentialInspectorView = ({
  onClose,
  onSave,
  onDelete,
  isEditMode = false,
  initialData
}: EssentialInspectorViewProps) => {

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
    fastInputMode,
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
    setFastInputMode,
    setShowMemo,
    setMemo,
    setReminder,
    setPriority,
    handleScheduleModeChange,
    handleSave,
    handleSmartExtract
  } = useEssentialInspectorForm({
    initialData,
    isEditMode,
    onSave,
    onClose
  })

  // キーボードショートカット
  useKeyboardShortcuts({
    isValid,
    scheduleMode,
    isEditMode,
    handleSave,
    handleScheduleModeChange,
    setFastInputMode
  })


  // 削除処理（簡略化）
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

  return (
    <div className={`h-full flex flex-col ${colors.background.base}`}>
      {/* Inspector Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className={`${heading.h5} ${text.primary}`}>
            {isEditMode ? 'Edit Event' : fastInputMode ? 'Quick Add' : 'Create Event'}
          </h1>
          
          {/* 高速入力モード表示 */}
          {fastInputMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full"
            >
              Fast Mode
            </motion.div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className={`
            p-2 rounded-lg transition-colors duration-200
            hover:${colors.background.surface} ${text.secondary}
          `}
        >
          <X size={18} />
        </button>
      </div>

      {/* メインコンテンツ - スクロール可能 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title input */}
        <div>
          <TitleInput
            value={title}
            onChange={setTitle}
            onSmartExtract={handleSmartExtract}
            autoFocus={true}
          />
        </div>
        
        {/* 2択式スケジュール選択セクション */}
        <div className="space-y-3">
          <fieldset>
            <legend className={`block text-sm font-medium ${text.primary} mb-2`}>
              いつ実行しますか？
            </legend>

            {/* ラジオボタン選択グループ */}
            <div className="space-y-2">
              {/* 後で決める選択肢 */}
              <label 
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                  border ${scheduleMode === 'defer' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  value="defer"
                  checked={scheduleMode === 'defer'}
                  onChange={(e) => handleScheduleModeChange(e.target.value as ScheduleMode)}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${scheduleMode === 'defer' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-neutral-300 dark:border-neutral-600'
                  }
                `}>
                  {scheduleMode === 'defer' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${text.primary}`}>
                    後で決める
                  </div>
                </div>
              </label>
              
              {/* 今すぐ予定する選択肢 */}
              <label 
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                  border ${scheduleMode === 'schedule' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  value="schedule"
                  checked={scheduleMode === 'schedule'}
                  onChange={(e) => handleScheduleModeChange(e.target.value as ScheduleMode)}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${scheduleMode === 'schedule' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-neutral-300 dark:border-neutral-600'
                  }
                `}>
                  {scheduleMode === 'schedule' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${text.primary}`}>
                    今すぐ予定する
                  </div>
                </div>
              </label>
            </div>
          </fieldset>
        </div>
          
          {/* プログレッシブ開示: 今すぐ予定するモードのみ日時フィールドを表示 */}
          <AnimatePresence>
            {scheduleMode === 'schedule' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-3 border-t border-neutral-200 dark:border-neutral-700"
              >
                <DateSelector
                  value={date}
                  endValue={endDate}
                  onChange={setDate}
                  onEndChange={setEndDate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags section */}
        <div>
          <TagInput
            selectedTags={tags}
            onChange={setTags}
            contextualSuggestions={title.split(' ')}
          />
        </div>

        {/* 追加オプション */}
        {(title.trim() || date || tags.length > 0) && (
          <div className="pt-2">
            {/* 追加オプションボタン */}
            <div className="flex items-center gap-2">
              {/* メモ追加 */}
              <button
                onClick={() => setShowMemo(!showMemo)}
                className={`
                  p-2 rounded-lg transition-all duration-200 flex items-center gap-2
                  ${showMemo || memo 
                    ? `${primary.DEFAULT} text-white` 
                    : `${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}`
                  }
                `}
                title="Add memo"
              >
                <FileText size={16} />
              </button>

              {/* リマインダー設定 */}
              <button
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${reminder 
                    ? `${primary.DEFAULT} text-white` 
                    : `${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}`
                  }
                `}
                title="Set reminder"
              >
                <Bell size={16} />
              </button>

              {/* リピート設定 */}
              <button
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}
                `}
                title="Set repeat"
              >
                <Repeat size={16} />
              </button>

              {/* その他すべて */}
              <button
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}
                `}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* メモ入力欄 */}
            <AnimatePresence>
              {showMemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Enter memo or comments..."
                    className={`
                      w-full p-3 ${colors.background.surface} ${text.primary}
                      border border-neutral-200 dark:border-neutral-700
                      rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                      text-sm
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                p-3 rounded-lg
                ${semantic.error.background} ${semantic.error.text}
                flex items-center gap-2 text-sm
              `}
            >
              <div className="flex-shrink-0">⚠️</div>
              <div>
                <div className="font-medium">An error occurred</div>
                <div className="opacity-90">{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* フッター */}
      <div className={`p-4 border-t border-neutral-200 dark:border-neutral-700 ${isEditMode ? 'flex items-center justify-between' : 'flex justify-end'} gap-3 flex-shrink-0`}>
        {/* 編集モードのみ削除ボタンを左端に表示 */}
        {isEditMode && onDelete && (
          <motion.button
            onClick={async () => {
              if (window.confirm('この予定を削除しますか？')) {
                try {
                  await onDelete()
                  onClose()
                } catch (error) {
                  setError(error instanceof Error ? error.message : '削除に失敗しました')
                }
              }
            }}
            className={`
              px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-sm
              ${semantic.error.background} ${semantic.error.text}
              hover:opacity-80 transition-all duration-200
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            Delete
          </motion.button>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
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
              px-6 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm
              transition-all duration-200
              ${isValid && !isSubmitting
                ? `${primary.DEFAULT} text-white hover:opacity-90`
                : `${colors.background.surface} ${text.muted} cursor-not-allowed`
              }
            `}
            whileHover={isValid && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <span>{isEditMode ? 'Update' : 'Create'}</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* 成功アニメーション */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 rounded-lg"
          >
            <div className="text-center">
              <motion.div
                className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Check size={20} className="text-white" />
              </motion.div>
              <motion.h2
                className={`${heading.h5} ${text.primary} mb-1`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Created!
              </motion.h2>
              <motion.p
                className={`${body.small} ${text.secondary}`}
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
    </div>
  )
}