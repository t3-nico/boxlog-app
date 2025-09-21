'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { Loader2, Trash2 } from 'lucide-react'

import { text, primary, semantic, colors } from '@/config/theme/colors'

interface EditFooterProps {
  isValid: boolean
  isSubmitting: boolean
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}

export const EditFooter = ({
  isValid,
  isSubmitting,
  onClose,
  onSave,
  onDelete
}: EditFooterProps) => {
  return (
    <div className="flex justify-between items-center pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
      {/* 削除ボタン（左端） */}
      <div>
        {onDelete != null && (
          <button
            type="button"
            onClick={onDelete}
            className={`
              px-6 py-3 rounded-lg font-medium flex items-center gap-2
              transition-all duration-200
              ${semantic.error.surface} ${semantic.error.text} hover:opacity-90
              border border-red-200 dark:border-red-800
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Delete
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
          type="button"
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
          onClick={onSave}
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
  )
}