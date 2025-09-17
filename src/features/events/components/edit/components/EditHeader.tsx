'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { text, colors } from '@/config/theme/colors'
import { heading } from '@/config/theme/typography'

interface EditHeaderProps {
  title: string
  date?: Date
  tags: any[]
  onClose: () => void
}

export const EditHeader = ({ title, date, tags, onClose }: EditHeaderProps) => {
  return (
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
          type="button"
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
  )
}