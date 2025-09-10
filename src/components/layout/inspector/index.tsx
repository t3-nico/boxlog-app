'use client'

import React from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DesktopInspector } from './DesktopInspector'
import { MobileInspector } from './MobileInspector'

export function Inspector() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return isMobile ? <MobileInspector /> : <DesktopInspector />
}