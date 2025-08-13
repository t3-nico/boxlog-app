'use client'

import React from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomUpChatModal } from './bottom-up-chat-modal'
import { useAIPanel } from '@/contexts/ai-panel-context'

export function FloatingAIChat() {
  const { isOpen, setIsOpen } = useAIPanel()

  return (
    <>
      {/* Floating Button - positioned relative to main area */}
      <div className={`absolute ${isOpen ? 'bottom-6' : 'bottom-6'} right-6 z-40 transition-all duration-300`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group border border-border"
          size="sm"
        >
          <Sparkles className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Bottom-up Chat Modal */}
      <BottomUpChatModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}