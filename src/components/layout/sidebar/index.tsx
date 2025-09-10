'use client'

import React from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MobileSidebar } from './MobileSidebar'
import { DesktopSidebar } from './DesktopSidebar'

export function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // モバイルではMobileSidebar、デスクトップではDesktopSidebarを表示
  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
}