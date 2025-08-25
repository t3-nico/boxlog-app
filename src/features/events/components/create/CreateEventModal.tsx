'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn-ui/dialog'
import { Button } from '@/components/shadcn-ui/button'
import { useCreateModalStore, useCreateModalKeyboardShortcuts } from '../../stores/useCreateModalStore'
import { CreateEventForm } from './CreateEventForm'
import { useCreateEvent } from '../../hooks/useCreateEvent'
import { primary, text, background, border } from '@/config/theme/colors'
import { rounded } from '@/config/theme/rounded'
import { body, heading } from '@/config/theme/typography'
import { icon } from '@/config/theme/icons'
import { spacing } from '@/config/theme/spacing'
import type { CreateEventRequest } from '../../types/events'

export function CreateEventModal() {
  const { 
    isOpen, 
    initialData, 
    context,
    closeModal
  } = useCreateModalStore()
  
  const { createEvent, isCreating, error } = useCreateEvent()
  const { handleKeyDown } = useCreateModalKeyboardShortcuts()
  
  // キーボードショートカットの設定
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        closeModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keydown', handleEscape)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [handleKeyDown, isOpen, closeModal])
  
  const handleSubmit = async (data: CreateEventRequest) => {
    try {
      await createEvent(data)
      closeModal()
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }
  
  const handleCancel = () => {
    closeModal()
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent 
            showCloseButton={false}
            className={`
              ${background.base} 
              ${rounded.modal}
              max-w-2xl
              w-full
              mx-4
              max-h-[90vh]
              sm:max-h-[85vh]
              overflow-hidden
              flex
              flex-col
              p-0
              shadow-xl
              border-none
            `}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col h-full"
            >
        {/* ヘッダー */}
        <DialogHeader className="p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className={heading.h2}>
              Create Event
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className={`${rounded.component.button.sm}`}
            >
              <X className={`${icon.size.md} ${text.muted}`} />
            </Button>
          </div>
          
        </DialogHeader>
        
        {/* フォーム本体 */}
        <div className={`flex-1 overflow-y-auto p-6`}>
          <CreateEventForm
            initialData={initialData}
            context={context}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isCreating}
            error={error}
          />
        </div>
        
        {/* フッター */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <div className={`hidden sm:flex items-center gap-4 ${body.small} ${text.muted}`}>
              <div className="flex items-center gap-1">
                <kbd className={`px-2 py-1 ${background.elevated} ${rounded.component.button.sm} ${body.small}`}>Ctrl</kbd>
                <span>+</span>
                <kbd className={`px-2 py-1 ${background.elevated} ${rounded.component.button.sm} ${body.small}`}>Enter</kbd>
                <span>to create</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className={`px-2 py-1 ${background.elevated} ${rounded.component.button.sm} ${body.small}`}>Esc</kbd>
                <span>to close</span>
              </div>
            </div>
            <div className="flex justify-end w-full">
              <Button
                onClick={() => {
                  const form = document.getElementById('create-event-form') as HTMLFormElement
                  if (form) {
                    form.requestSubmit()
                  }
                }}
                disabled={isCreating}
                className={`${primary.DEFAULT} ${primary.hover} min-w-[120px]`}
              >
                {isCreating ? (
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating...
                  </motion.div>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </div>
            </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}