import { useToastStore } from './store'
import type { ToastOptions } from './types'

export function useToast() {
  const { addToast, updateToast, removeToast, clearToasts } = useToastStore()
  
  return {
    success: (title: string, options?: ToastOptions) => 
      addToast('success', title, options),
    
    error: (title: string, options?: ToastOptions) => 
      addToast('error', title, options),
    
    warning: (title: string, options?: ToastOptions) => 
      addToast('warning', title, options),
    
    info: (title: string, options?: ToastOptions) => 
      addToast('info', title, options),
    
    loading: (title: string, options?: ToastOptions) => 
      addToast('loading', title, options),
    
    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((_data: T) => string)
        error: string | ((_error: any) => string)
      }
    ) => {
      const id = addToast('loading', messages.loading)
      
      try {
        const result = await promise
        removeToast(id)
        const successMsg = typeof messages.success === 'function' 
          ? messages.success(result)
          : messages.success
        addToast('success', successMsg)
        return result
      } catch (error) {
        removeToast(id)
        const errorMsg = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error
        addToast('error', errorMsg)
        throw error
      }
    },
    
    dismiss: removeToast,
    clear: clearToasts,
    update: updateToast,
  }
}