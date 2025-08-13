'use client'

import React from 'react'
import { MainSupportChat } from '@/features/help/components/main-support-chat'

export default function HelpPage() {
  // BoxLogサポートアシスタントをメインエリアで表示
  return (
    <div className="h-full">
      <MainSupportChat />
    </div>
  )
}