'use client'

import React from 'react'
import { useNavigationStore } from '@/store/navigation.store'
import { AiChatSidebar as AIChatSidebar } from '@/features/aichat'
import { RightPanelToggle } from './toggle'
import { RightPanelActions } from './actions'

export function RightPanel() {
  const { 
    isRightPanelHidden, 
    isAIChatOpen, 
    setAIChatOpen
  } = useNavigationStore()

  return (
    <>
      {/* Right Icon Bar - Show when no AI chat is open and panel is visible */}
      {!isAIChatOpen && !isRightPanelHidden && (
        <RightPanelActions />
      )}
      
      {/* Panel Toggle Button */}
      <RightPanelToggle />
      
      {/* AI Chat Sidebars */}
      <AIChatSidebar 
        isOpen={isAIChatOpen} 
        onClose={() => setAIChatOpen(false)} 
      />
    </>
  )
}