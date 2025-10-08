'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'

import { DesktopInspector } from './DesktopInspector'
import { MobileInspector } from './MobileInspector'

const Inspector = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile ? <MobileInspector /> : <DesktopInspector />
}

export default Inspector
