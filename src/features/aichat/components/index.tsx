'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAIPanelStore } from '@/features/aichat/stores/useAIPanelStore'

import { BottomUpChatModal } from './bottom-up-chat-modal'

export const FloatingAIChat = () => {
  const { isOpen, setIsOpen } = useAIPanelStore()

  return (
    <>
      {/* Floating Button - positioned relative to main area */}
      <div className={`absolute ${isOpen ? 'bottom-4' : 'bottom-4'} right-4 z-40 transition-all duration-300`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-muted hover:bg-muted/80 group border-border flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all duration-200 hover:shadow-xl"
          size="sm"
        >
          <Sparkles className="text-foreground h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
      </div>

      {/* Bottom-up Chat Modal */}
      <BottomUpChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
