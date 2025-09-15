'use client'

import React from 'react'

import { MainSupportChat } from '@/features/help/components/main-support-chat'

const HelpPage = () => {
  // BoxLogサポートアシスタントをメインエリアで表示
  return (
    <div className="h-full">
      <MainSupportChat />
    </div>
  )
}

export default HelpPage