export { ToastContainer } from './container'
export { useToastStore } from './store'
export type { Toast, ToastAction, ToastOptions, ToastType } from './types'
export { useToast } from './use-toast'

import { useToastStore } from './store'
import type { ToastOptions } from './types'

export const toast = {
  success: (title: string, options?: ToastOptions) => useToastStore.getState().addToast('success', title, options),
  error: (title: string, options?: ToastOptions) => useToastStore.getState().addToast('error', title, options),
  warning: (title: string, options?: ToastOptions) => useToastStore.getState().addToast('warning', title, options),
  info: (title: string, options?: ToastOptions) => useToastStore.getState().addToast('info', title, options),
  loading: (title: string, options?: ToastOptions) => useToastStore.getState().addToast('loading', title, options),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
  clear: () => useToastStore.getState().clearToasts(),
}
