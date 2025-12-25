'use client';

import { AnimationContext } from '../context';
import type { AnimationContextType, AnimationProviderProps } from '../types';

export function AnimationProvider({ children, config = {} }: AnimationProviderProps) {
  const defaultConfig: AnimationContextType = {
    enabled: true,
    reducedMotion: false,
    duration: 'normal',
    ...config,
  };

  return <AnimationContext.Provider value={defaultConfig}>{children}</AnimationContext.Provider>;
}
