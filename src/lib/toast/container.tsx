'use client'

import React, { useCallback } from 'react'


import { cn } from '@/lib/utils'

import { useToastStore } from './store'
import { Toast } from './toast'

const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
}

export const ToastContainer = () => {
  const { toasts, position, removeToast } = useToastStore()
  
  const createRemoveHandler = useCallback((toastId: string) => {
    return () => removeToast(toastId)
  }, [removeToast])
  
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            toast={toast}
            onRemove={createRemoveHandler(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}