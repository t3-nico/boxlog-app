'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red'

interface ThemeContextType {
  theme: Theme
  colorScheme: ColorScheme
  setTheme: (theme: Theme) => void
  setColorScheme: (colorScheme: ColorScheme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>('system')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('blue')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme

    if (savedTheme) {
      setTheme(savedTheme)
    }

    if (savedColorScheme) {
      setColorScheme(savedColorScheme)
    }
  }, [])

  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement

    // Save to localStorage
    localStorage.setItem('theme', theme)
    localStorage.setItem('colorScheme', colorScheme)

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    // Determine resolved theme
    let newResolvedTheme: 'light' | 'dark' = 'light'

    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      newResolvedTheme = systemPrefersDark ? 'dark' : 'light'
    } else {
      newResolvedTheme = theme
    }

    // Apply theme
    root.classList.add(newResolvedTheme)
    setResolvedTheme(newResolvedTheme)

    // Apply color scheme CSS variables
    applyColorScheme(colorScheme, newResolvedTheme)
  }, [theme, colorScheme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(newResolvedTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newResolvedTheme)
      applyColorScheme(colorScheme, newResolvedTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, colorScheme])

  const applyColorScheme = (scheme: ColorScheme, _currentTheme: 'light' | 'dark') => {
    const root = window.document.documentElement

    // Remove existing color scheme classes
    root.classList.remove('scheme-blue', 'scheme-green', 'scheme-purple', 'scheme-orange', 'scheme-red')

    // Add new color scheme class
    root.classList.add(`scheme-${scheme}`)

    // NOTE: CSS変数の上書きを無効化
    // modern-minimalテーマのOKLCH値を使用するため、
    // RGB値での上書きは行わない
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        setTheme,
        setColorScheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
