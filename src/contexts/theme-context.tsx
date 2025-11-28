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

// カラースキーム適用（コンポーネント外に定義して参照安定性を確保）
function applyColorScheme(scheme: ColorScheme, _currentTheme: 'light' | 'dark') {
  const root = window.document.documentElement

  // Remove existing color scheme classes
  root.classList.remove('scheme-blue', 'scheme-green', 'scheme-purple', 'scheme-orange', 'scheme-red')

  // Add new color scheme class
  root.classList.add(`scheme-${scheme}`)

  // NOTE: CSS変数の上書きを無効化
  // modern-minimalテーマのOKLCH値を使用するため、
  // RGB値での上書きは行わない
}

// localStorageから安全に値を取得（SSR対応）
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('theme') as Theme) || 'system'
}

const getStoredColorScheme = (): ColorScheme => {
  if (typeof window === 'undefined') return 'blue'
  return (localStorage.getItem('colorScheme') as ColorScheme) || 'blue'
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // 遅延初期化でlocalStorageから読み込み（useEffect内のsetStateを回避）
  const [theme, setTheme] = useState<Theme>(getStoredTheme)
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getStoredColorScheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- システムテーマ変更への同期は外部システム連携
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- メディアクエリ変更のコールバック内setState
      setResolvedTheme(newResolvedTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newResolvedTheme)
      applyColorScheme(colorScheme, newResolvedTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, colorScheme])

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

function getColorVariables(scheme: ColorScheme, theme: 'light' | 'dark') {
  const schemes = {
    blue: {
      light: {
        '--color-primary': '59 130 246', // blue-500
        '--color-primary-foreground': '255 255 255',
        '--color-accent': '219 234 254', // blue-100
        '--color-accent-foreground': '30 64 175', // blue-800
      },
      dark: {
        '--color-primary': '96 165 250', // blue-400
        '--color-primary-foreground': '30 58 138', // blue-900
        '--color-accent': '30 58 138', // blue-900
        '--color-accent-foreground': '219 234 254', // blue-100
      },
    },
    green: {
      light: {
        '--color-primary': '34 197 94', // green-500
        '--color-primary-foreground': '255 255 255',
        '--color-accent': '220 252 231', // green-100
        '--color-accent-foreground': '22 101 52', // green-800
      },
      dark: {
        '--color-primary': '74 222 128', // green-400
        '--color-primary-foreground': '20 83 45', // green-900
        '--color-accent': '20 83 45', // green-900
        '--color-accent-foreground': '220 252 231', // green-100
      },
    },
    purple: {
      light: {
        '--color-primary': '168 85 247', // purple-500
        '--color-primary-foreground': '255 255 255',
        '--color-accent': '233 213 255', // purple-100
        '--color-accent-foreground': '107 33 168', // purple-800
      },
      dark: {
        '--color-primary': '196 181 253', // purple-400
        '--color-primary-foreground': '88 28 135', // purple-900
        '--color-accent': '88 28 135', // purple-900
        '--color-accent-foreground': '233 213 255', // purple-100
      },
    },
    orange: {
      light: {
        '--color-primary': '249 115 22', // orange-500
        '--color-primary-foreground': '255 255 255',
        '--color-accent': '255 237 213', // orange-100
        '--color-accent-foreground': '154 52 18', // orange-800
      },
      dark: {
        '--color-primary': '251 146 60', // orange-400
        '--color-primary-foreground': '124 45 18', // orange-900
        '--color-accent': '124 45 18', // orange-900
        '--color-accent-foreground': '255 237 213', // orange-100
      },
    },
    red: {
      light: {
        '--color-primary': '239 68 68', // red-500
        '--color-primary-foreground': '255 255 255',
        '--color-accent': '254 226 226', // red-100
        '--color-accent-foreground': '153 27 27', // red-800
      },
      dark: {
        '--color-primary': '248 113 113', // red-400
        '--color-primary-foreground': '127 29 29', // red-900
        '--color-accent': '127 29 29', // red-900
        '--color-accent-foreground': '254 226 226', // red-100
      },
    },
  }

  return schemes[scheme][theme]
}
