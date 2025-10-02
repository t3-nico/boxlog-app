// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
'use client'

import React from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Bell, MoreHorizontal, Repeat } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EditOptionsProps {
  title: string
  date?: Date
  tags: Tag[]
  showMemo: boolean
  memo: string
  onToggleMemo: () => void
  onMemoChange: (value: string) => void
}

export const EditOptions = ({
  title,
  date,
  tags,
  showMemo,
  memo,
  onToggleMemo,
  onMemoChange
}: EditOptionsProps) => {
  if (!(title.trim() || date || tags.length > 0)) {
    return null
  }

  return (
    <div className="pt-4">
      {/* 追加オプション */}
      <div className="flex items-center gap-4">
        {/* 重要3つ */}
        <div className="flex items-center gap-3">
          {/* メモ追加 */}
          <button
            type="button"
            onClick={onToggleMemo}
            className={cn(
              'p-3 rounded-lg transition-all duration-200 flex items-center gap-2',
              showMemo || memo
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
            title="Add memo"
          >
            <FileText size={18} />
          </button>

          {/* リマインダー設定 */}
          <button
            type="button"
            className={cn(
              'p-3 rounded-lg transition-all duration-200',
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
            title="Set reminder"
          >
            <Bell size={18} />
          </button>

          {/* リピート設定 */}
          <button
            type="button"
            className={cn(
              'p-3 rounded-lg transition-all duration-200',
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
            title="Set repeat"
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* その他すべて */}
        <button
          type="button"
          className={cn(
            'p-3 rounded-lg transition-all duration-200',
            'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          )}
          title="More options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* メモ入力欄 */}
      <AnimatePresence>
        {showMemo != null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <textarea
              value={memo}
              onChange={(e) => onMemoChange(e.target.value)}
              placeholder="Enter memo or comments..."
              className={cn(
                'w-full p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50',
                'border border-neutral-200 dark:border-neutral-700',
                'rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              rows={3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}