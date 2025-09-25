'use client'

import { AlertTriangle, CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react'

import { border, colors, semantic, text } from '@/config/theme/colors'
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
