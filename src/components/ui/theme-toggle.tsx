'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/dropdown'
import {
  Sun as SunIcon,
  Moon as MoonIcon,
  Monitor as ComputerDesktopIcon,
  ChevronDown as ChevronDownIcon,
  Palette as SwatchIcon,
} from 'lucide-react'

export function ThemeToggle() {
  const { theme, colorScheme, setTheme, setColorScheme, resolvedTheme } = useTheme()

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
      <Dropdown>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <DropdownButton plain className="flex items-center space-x-2">
            {themeIcons[theme]}
            <ChevronDownIcon className="h-4 w-4" data-slot="icon" />
          </DropdownButton>
        </motion.div>
        
        <DropdownMenu className="w-32">
          <DropdownItem
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'bg-accent' : ''}
          >
            <SunIcon className="mr-2 h-4 w-4" data-slot="icon" />
            Light
          </DropdownItem>
          <DropdownItem
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'bg-accent' : ''}
          >
            <MoonIcon className="mr-2 h-4 w-4" data-slot="icon" />
            Dark
          </DropdownItem>
          <DropdownItem
            onClick={() => setTheme('system')}
            className={theme === 'system' ? 'bg-accent' : ''}
          >
            <ComputerDesktopIcon className="mr-2 h-4 w-4" data-slot="icon" />
            System
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Color Scheme Selector */}
      <Dropdown>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <DropdownButton plain className="flex items-center space-x-2">
            <SwatchIcon className="h-4 w-4" data-slot="icon" />
            <ChevronDownIcon className="h-4 w-4" data-slot="icon" />
          </DropdownButton>
        </motion.div>
        
        <DropdownMenu className="w-36">
          {colorSchemes.map((scheme) => (
            <DropdownItem
              key={scheme.value}
              onClick={() => setColorScheme(scheme.value)}
              className={`flex items-center justify-between ${colorScheme === scheme.value ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${scheme.color}`} />
                <span>{scheme.label}</span>
              </div>
              {colorScheme === scheme.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-current rounded-full"
                />
              )}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export function SimpleThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button plain onClick={toggleTheme} className="p-2">
        {resolvedTheme === 'light' ? (
          <MoonIcon className="h-4 w-4" data-slot="icon" />
        ) : (
          <SunIcon className="h-4 w-4" data-slot="icon" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
}