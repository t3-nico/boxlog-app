'use client'

import { AlertTriangle, CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react'

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
    background: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-l-4 border-green-500 dark:border-green-600',
    text: 'text-green-700 dark:text-green-300',
    icon: 'text-green-700 dark:text-green-300',
  },
  error: {
    background: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-l-4 border-red-500 dark:border-red-600',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-700 dark:text-red-300',
  },
  warning: {
    background: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-l-4 border-amber-500 dark:border-amber-600',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    background: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-l-4 border-blue-500 dark:border-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-700 dark:text-blue-300',
  },
  loading: {
    background: 'bg-neutral-100 dark:bg-neutral-800',
    border: 'border-l-4 border-neutral-300 dark:border-neutral-700',
    text: 'text-neutral-900 dark:text-neutral-50',
    icon: 'text-neutral-600 dark:text-neutral-400',
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
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-4 shadow-lg backdrop-blur-sm',
        'min-w-[300px] max-w-[500px]',
        'transition-all duration-200 ease-out',
        'animate-in slide-in-from-right-full fade-in zoom-in-95',
        style.background,
        style.border
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', style.icon, toast.type === 'loading' && 'animate-spin')} />

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', style.text)}>{toast.title}</p>
        {toast.description ? <p className={cn('mt-1 text-xs opacity-90', style.text)}>{toast.description}</p> : null}
        {toast.action != null && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className={cn('mt-2 text-xs font-medium underline hover:no-underline', style.text)}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.closeable != null && (
        <button
          type="button"
          onClick={onRemove}
          className={cn('flex-shrink-0 opacity-60 transition-opacity hover:opacity-100', style.text)}
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
