'use client'

import { useCallback, useEffect, useState } from 'react'

import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

const themes = [
  {
    key: 'system',
    icon: Monitor,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon,
    label: 'Dark theme',
  },
]

export type ThemeSwitcherProps = {
  value?: 'light' | 'dark' | 'system'
  onChange?: (theme: 'light' | 'dark' | 'system') => void
  defaultValue?: 'light' | 'dark' | 'system'
  className?: string
}

export const ThemeSwitcher = ({ value, onChange, defaultValue = 'system', className }: ThemeSwitcherProps) => {
  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  })
  const [mounted, setMounted] = useState(false)

  const handleThemeClick = useCallback(
    (themeKey: 'light' | 'dark' | 'system') => {
      setTheme(themeKey)
    },
    [setTheme]
  )

  const createThemeClickHandler = useCallback(
    (themeKey: 'light' | 'dark' | 'system') => {
      return () => handleThemeClick(themeKey)
    },
    [handleThemeClick]
  )

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={cn('bg-background ring-border relative isolate flex h-8 rounded-full p-1 ring-1', className)}>
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={createThemeClickHandler(key as 'light' | 'dark' | 'system')}
            type="button"
          >
            {isActive === true && (
              <motion.div
                className="bg-secondary absolute inset-0 rounded-full"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn('relative z-10 m-auto h-4 w-4', isActive ? 'text-foreground' : 'text-muted-foreground')}
            />
          </button>
        )
      })}
    </div>
  )
}
