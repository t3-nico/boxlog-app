'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EditSuccessAnimationProps {
  showSuccess: boolean
  title: string
}

export const EditSuccessAnimation = ({ showSuccess, title }: EditSuccessAnimationProps) => {
  return (
    <AnimatePresence>
      {showSuccess != null && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/95 dark:bg-gray-900/95"
        >
          <div className="text-center">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Check size={24} className="text-white" />
            </motion.div>
            <motion.h2
              className={cn('mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Updated!
            </motion.h2>
            <motion.p
              className={cn('text-base text-neutral-600 dark:text-neutral-400')}
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
  )
}
