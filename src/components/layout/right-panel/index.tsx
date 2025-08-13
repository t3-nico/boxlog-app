'use client'

import React from 'react'
import { useNavigationStore } from '@/store/navigation.store'
import { AiChatSidebar as AIChatSidebar, CodebaseAiChat as CodebaseAIChat } from '@/features/aichat'
import { RightPanelToggle } from './toggle'
import { RightPanelActions } from './actions'

export function RightPanel() {
  const { 
    isRightPanelHidden, 
    isAIChatOpen, 
    isCodebaseAIChatOpen,
    setAIChatOpen,
    setCodebaseAIChatOpen 
  } = useNavigationStore()

  return (
    <>
      {/* Right Icon Bar - Show when no AI chat is open and panel is visible */}
      {!isAIChatOpen && !isCodebaseAIChatOpen && !isRightPanelHidden && (
        <RightPanelActions />
      )}
      
      {/* Panel Toggle Button */}
      <RightPanelToggle />
      
      {/* AI Chat Sidebars */}
      <AIChatSidebar 
        isOpen={isAIChatOpen} 
        onClose={() => setAIChatOpen(false)} 
      />
      <CodebaseAIChat 
        isOpen={isCodebaseAIChatOpen} 
        onClose={() => setCodebaseAIChatOpen(false)} 
      />
    </>
  )
}