'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export function ToastProvider({ children }: { children: ReactNode }) {
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
  const iconProps = "h-5 w-5"
  switch (type) {
    case 'success':
      return <CheckCircleIcon className={`${iconProps} text-green-500`} />
    case 'error':
      return <XCircleIcon className={`${iconProps} text-red-500`} />
    case 'warning':
      return <ExclamationTriangleIcon className={`${iconProps} text-yellow-500`} />
    case 'info':
      return <InformationCircleIcon className={`${iconProps} text-blue-500`} />
  }
}

function getToastStyles(type: Toast['type']) {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{ duration: 0.3, type: "spring" }}
      whileHover={{ scale: 1.02 }}
      className={`relative flex w-full max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg ${getToastStyles(toast.type)}`}
    >
      <div className="flex-shrink-0">
        {getToastIcon(toast.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 ml-2 text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}