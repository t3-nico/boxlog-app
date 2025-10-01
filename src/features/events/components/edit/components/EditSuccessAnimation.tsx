'use client'

import React from 'react'

import { motion, AnimatePresence } from 'framer-motion'
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
              className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2')}
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