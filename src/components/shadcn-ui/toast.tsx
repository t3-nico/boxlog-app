'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

import { CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, AlertTriangle as ExclamationTriangleIcon, Info as InformationCircleIcon, X as XMarkIcon } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description })
  }, [addToast])

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function getToastIcon(type: Toast['type']) {
  const iconProps = "h-6 w-6"
  switch (type) {
    case 'success':
      return <CheckCircleIcon className={`${iconProps} text-green-500`} data-slot="icon" />
    case 'error':
      return <XCircleIcon className={`${iconProps} text-red-500`} data-slot="icon" />
    case 'warning':
      return <ExclamationTriangleIcon className={`${iconProps} text-amber-500`} data-slot="icon" />
    case 'info':
      return <InformationCircleIcon className={`${iconProps} text-blue-500`} data-slot="icon" />
  }
}

function getToastStyles(type: Toast['type']) {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:border-green-400 dark:text-green-100'
    case 'error':
      return 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:border-red-400 dark:text-red-100'
    case 'warning':
      return 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-900/20 dark:border-amber-400 dark:text-amber-100'
    case 'info':
      return 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-100'
  }
}

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  return (
    <div
      className={`relative flex w-full max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in zoom-in hover:scale-[1.02] ${getToastStyles(toast.type)}`}
    >
      <div className="flex-shrink-0">
        {getToastIcon(toast.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description != null && (
          <p className="mt-1 text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="h-4 w-4" data-slot="icon" />
      </button>
    </div>
  )
}

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col space-y-2">
      <div className="space-y-4">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  )
}