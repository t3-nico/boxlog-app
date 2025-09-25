import { create } from 'zustand'

import type { Toast, ToastOptions, ToastType, ToastPosition } from './types'

interface ToastStore {
  toasts: Toast[]
  position: ToastPosition
  
  addToast: (_type: ToastType, _title: string, _options?: ToastOptions) => string
  updateToast: (_id: string, _toast: Partial<Toast>) => void
  removeToast: (_id: string) => void
  clearToasts: () => void
  setPosition: (_position: ToastPosition) => void
}

const DEFAULT_DURATION = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
  loading: 0,
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  position: 'bottom-right',
  
  addToast: (type, title, options = {}) => {
    const id = crypto.randomUUID()
    const toast: Toast = {
      id,
      type,
      title,
      description: options.description,
      duration: options.duration ?? (Object.prototype.hasOwnProperty.call(DEFAULT_DURATION, type) ? DEFAULT_DURATION[type as keyof typeof DEFAULT_DURATION] : 3000),
      closeable: options.closeable ?? type !== 'loading',
      action: options.action,
      createdAt: Date.now(),
    }
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }))
    
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, toast.duration)
    }
    
    return id
  },
  
  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map(toast =>
        toast.id === id ? { ...toast, ...updates } : toast
      )
    }))
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }))
  },
  
  clearToasts: () => {
    set({ toasts: [] })
  },
  
  setPosition: (position) => {
    set({ position })
  }
}))