'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowUpCircle } from 'lucide-react'

import { useChatContext } from '@/contexts/chat-context'
import { cn } from '@/lib/utils'

export const ChatInput = () => {
  const { state, sendMessage, setInputValue } = useChatContext()
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.inputValue.trim() && !state.isTyping) {
      await sendMessage(state.inputValue)
    }
  }, [state.inputValue, state.isTyping, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [isComposing, handleSubmit])

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [setInputValue])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const { scrollHeight } = textareaRef.current
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [state.inputValue])

  return (
    <div className="flex-shrink-0 p-4">
      {/* Typing indicator */}
      {state.isTyping === true && (
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <div className="flex gap-1">
            <div className="bg-muted-foreground/60 h-2 w-2 animate-pulse rounded-full"></div>
            <div
              className="bg-muted-foreground/60 h-2 w-2 animate-pulse rounded-full"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="bg-muted-foreground/60 h-2 w-2 animate-pulse rounded-full"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
          <span>Claude is thinking...</span>
        </div>
      )}

      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={state.inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Ask Claude..."
            className={cn('w-full resize-none rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 p-3 pr-12 text-sm max-h-32 min-h-[44px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500 placeholder:text-neutral-600 dark:placeholder:text-neutral-400 scrollbar-hide')}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            disabled={state.isTyping}
            rows={1}
          />

          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className="text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 absolute bottom-2 right-2 p-2 transition-colors focus:outline-none disabled:cursor-not-allowed"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}
