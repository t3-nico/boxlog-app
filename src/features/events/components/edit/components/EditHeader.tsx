// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EditHeaderProps {
  title: string
  date?: Date
  tags: Tag[]
  onClose: () => void
}

export const EditHeader = ({ title, date, tags, onClose }: EditHeaderProps) => {
  return (
    <div className="p-6 pb-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.h1
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-50"
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
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                  title.trim()
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                } `}
                animate={title.trim() ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {title.trim() ? '✓' : '1'}
              </motion.div>
              <span
                className={cn(
                  'text-xs',
                  title.trim() ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                Title
              </span>
            </div>

            {/* 日付指標 */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300',
                  date
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                )}
                animate={date ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {date ? '✓' : '2'}
              </motion.div>
              <span
                className={cn(
                  'text-xs',
                  date ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                DateTime
              </span>
            </div>

            {/* タグ指標 */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300',
                  tags.length > 0
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                )}
                animate={tags.length > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {tags.length > 0 ? '✓' : '3'}
              </motion.div>
              <span
                className={cn(
                  'text-xs',
                  tags.length > 0 ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                Tags
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-neutral-600 transition-colors duration-200 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
