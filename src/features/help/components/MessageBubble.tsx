'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Check, Pencil, Sparkles, X } from 'lucide-react'

import { useChatStore, type ChatMessage } from '@/features/aichat/stores/useChatStore'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { t } = useI18n()
  const isUser = message.sender === 'user'
  const { editMessage } = useChatStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleEditContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value)
  }, [])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setEditContent(message.content)
  }, [message.content])

  const handleSave = useCallback(() => {
    if (editContent.trim() !== message.content) {
      editMessage(message.id, editContent.trim())
    }
    setIsEditing(false)
  }, [editContent, editMessage, message.content, message.id])

  const handleCancel = useCallback(() => {
    setEditContent(message.content)
    setIsEditing(false)
  }, [message.content])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])

  if (isUser) {
    return (
      <div className="group mb-6 flex justify-end">
        <div className="relative">
          <div className={cn('max-w-[85%] rounded-lg rounded-tr-sm bg-blue-600 p-4 break-words text-white')}>
            {isEditing ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={handleEditContentChange}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'w-full resize-none border-none bg-transparent text-sm leading-relaxed text-white placeholder-blue-200 outline-none'
                  )}
                  rows={1}
                  style={{ minHeight: '1.5rem' }}
                />
                <div className="mt-2 flex items-center gap-2 border-t border-blue-500 pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-sm p-1 transition-colors hover:bg-blue-500"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-sm p-1 transition-colors hover:bg-blue-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
            )}
            {message.status && !isEditing ? (
              <div className="mt-1 text-xs text-blue-100 opacity-75">
                {message.status === 'sending' && '送信中...'}
                {message.status === 'error' && t('help.messageBubble.sendError')}
              </div>
            ) : null}
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 -left-8 -translate-y-1/2 p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-start justify-start gap-3">
      {/* AI Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-medium text-white">
        <Sparkles className="h-4 w-4" />
      </div>

      {/* AI Message Bubble */}
      <div className="bg-background text-foreground border-border max-w-[85%] rounded-2xl rounded-tl-sm border px-4 py-3 break-words">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
