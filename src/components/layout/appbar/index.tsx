'use client'

import React from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'

import { DesktopAppBar } from './DesktopAppBar'
import { MobileAppBar } from './MobileAppBar'

export const AppBar = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // モバイルではMobileAppBar、デスクトップではDesktopAppBarを表示
  return isMobile ? <MobileAppBar /> : <DesktopAppBar />
}