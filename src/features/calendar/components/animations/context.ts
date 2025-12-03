'use client'

import { createContext, useContext } from 'react'

import type { AnimationContextType } from './types'

const AnimationContext = createContext<AnimationContextType>({
  enabled: true,
  reducedMotion: false,
  duration: 'normal',
})

export function useAnimation() {
  return useContext(AnimationContext)
}

export { AnimationContext }
