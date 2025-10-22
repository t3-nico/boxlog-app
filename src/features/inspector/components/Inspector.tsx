'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'

import { DesktopInspectorSheet } from './DesktopInspectorSheet'
import { MobileInspectorSheet } from './MobileInspectorSheet'

export default function Inspector() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile ? <MobileInspectorSheet /> : <DesktopInspectorSheet />
}
