'use client'

import {
  ChevronDown as ChevronDownIcon,
  Monitor as ComputerDesktopIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
  Palette as SwatchIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTheme } from '@/contexts/theme-context'

export const ThemeToggle = () => {
  const { theme, colorScheme, setTheme, setColorScheme, resolvedTheme: _resolvedTheme } = useTheme()

  const themeIcons = {
    light: <SunIcon className="h-4 w-4" data-slot="icon" />,
    dark: <MoonIcon className="h-4 w-4" data-slot="icon" />,
    system: <ComputerDesktopIcon className="h-4 w-4" data-slot="icon" />,
  }

  const colorSchemes = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
  ] as const

  return (
    <div className="flex items-center space-x-2">
      {/* Theme Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
            <Button variant="ghost" className="flex items-center space-x-2">
              {themeIcons[theme as keyof typeof themeIcons]}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32">
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'bg-surface-container' : ''}
          >
            <SunIcon className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-surface-container' : ''}>
            <MoonIcon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className={theme === 'system' ? 'bg-surface-container' : ''}
          >
            <ComputerDesktopIcon className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Scheme Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
            <Button variant="ghost" className="flex items-center space-x-2">
              <SwatchIcon className="h-4 w-4" />
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36">
          {colorSchemes.map((scheme) => (
            <DropdownMenuItem
              key={scheme.value}
              onClick={() => setColorScheme(scheme.value)}
              className={`flex items-center justify-between ${colorScheme === scheme.value ? 'bg-surface-container' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <div className={`h-4 w-4 rounded-full ${scheme.color}`} />
                <span>{scheme.label}</span>
              </div>
              {colorScheme === scheme.value && (
                <div className="animate-in zoom-in h-2 w-2 rounded-full bg-current duration-200" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const SimpleThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
      <Button variant="ghost" onClick={toggleTheme} className="p-2">
        {resolvedTheme === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
