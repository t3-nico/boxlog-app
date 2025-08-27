import { create } from 'zustand'
import type { Toast, ToastOptions, ToastType, ToastPosition } from './types'

interface ToastStore {
  toasts: Toast[]
  position: ToastPosition
  
  addToast: (type: ToastType, title: string, options?: ToastOptions) => string
  updateToast: (id: string, toast: Partial<Toast>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  setPosition: (position: ToastPosition) => void
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
      duration: options.duration ?? DEFAULT_DURATION[type],
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