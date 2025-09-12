'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { X, CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

import { semantic, text, border } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

import type { Toast as ToastType } from './types'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
}

const styles = {
  success: {
    background: semantic.success.light,
    border: `border-l-4 ${semantic.success.border}`,
    text: semantic.success.text,
    icon: semantic.success.text,
  },
  error: {
    background: semantic.error.light,
    border: `border-l-4 ${semantic.error.border}`,
    text: semantic.error.text,
    icon: semantic.error.text,
  },
  warning: {
    background: semantic.warning.light,
    border: `border-l-4 ${semantic.warning.border}`,
    text: semantic.warning.text,
    icon: semantic.warning.text,
  },
  info: {
    background: semantic.info.light,
    border: `border-l-4 ${semantic.info.border}`,
    text: semantic.info.text,
    icon: semantic.info.text,
  },
  loading: {
    background: colors.background.surface,
    border: `border-l-4 ${border.DEFAULT}`,
    text: text.primary,
    icon: text.muted,
  },
}

interface ToastProps {
  toast: ToastType
  onRemove: () => void
}

export const Toast = ({ toast, onRemove }: ToastProps) => {
  const Icon = icons[toast.type]
  const style = styles[toast.type]
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm',
        'min-w-[300px] max-w-[500px]',
        style.background,
        style.border
      )}
    >
      <Icon 
        className={cn(
          'w-5 h-5 flex-shrink-0 mt-0.5',
          style.icon,
          toast.type === 'loading' && 'animate-spin'
        )} 
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', style.text)}>
          {toast.title}
        </p>
        {toast.description && (
          <p className={cn('text-xs opacity-90 mt-1', style.text)}>
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'text-xs font-medium mt-2 underline hover:no-underline',
              style.text
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {toast.closeable && (
        <button
          onClick={onRemove}
          className={cn(
            'flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity',
            style.text
          )}
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}