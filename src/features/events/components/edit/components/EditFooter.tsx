'use client'

import { motion } from 'framer-motion'
import { Loader2, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EditFooterProps {
  isValid: boolean
  isSubmitting: boolean
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}

export const EditFooter = ({ isValid, isSubmitting, onClose, onSave, onDelete }: EditFooterProps) => {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
      {/* 削除ボタン（左端） */}
      <div>
        {onDelete != null && (
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-3 font-medium',
              'transition-all duration-200',
              'bg-red-50 text-red-600 hover:opacity-90 dark:bg-red-900/20 dark:text-red-400',
              'border border-red-200 dark:border-red-800'
            )}
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
          className={cn(
            'rounded-lg px-6 py-3 font-medium',
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
            'transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
            'border border-neutral-200 dark:border-neutral-700'
          )}
        >
          Cancel
        </button>
        <motion.button
          onClick={onSave}
          disabled={!isValid || isSubmitting}
          className={cn(
            'flex items-center gap-2 rounded-lg px-8 py-3 font-semibold',
            'transition-all duration-200',
            isValid && !isSubmitting
              ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:opacity-90 hover:shadow-xl'
              : 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
          )}
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
