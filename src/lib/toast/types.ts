export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  closeable?: boolean
  action?: ToastAction
  createdAt: number
}

export interface ToastOptions {
  description?: string
  duration?: number
  closeable?: boolean
  action?: ToastAction
}