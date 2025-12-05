'use client'

import { useCallback, useEffect } from 'react'

import { Check, ChevronDown } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type ViewOption = {
  value: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
}

interface ViewSwitcherProps {
  options: ViewOption[]
  currentView: string
  onChange: (view: string) => void
  className?: string
}

/**
 * ビュー切り替えドロップダウン
 * shadcn/ui公式DropdownMenuを使用
 */
export const ViewSwitcher = ({ options, currentView, onChange, className }: ViewSwitcherProps) => {
  const currentOption = options.find((opt) => opt.value === currentView)

  const handleSelect = useCallback(
    (value: string) => {
      onChange(value)
    },
    [onChange]
  )

  // ショートカットキー機能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl、Alt、Metaキーが押されている場合は無視
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // 入力フィールドにフォーカスがある場合は無視
      const { activeElement } = document
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      const key = event.key.toUpperCase()
      const option = options.find((opt) => opt.shortcut?.toUpperCase() === key)

      if (option && option.value !== currentView) {
        event.preventDefault()
        onChange(option.value)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options, currentView, onChange])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline' }), 'justify-start gap-0', className)}>
        {currentOption?.icon}
        <span>{currentOption?.label || 'Day'}</span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="dark:border-input min-w-40 border">
        {/* ビューオプション */}
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-0">
              {option.icon}
              <span>{option.label}</span>
              {currentView === option.value && <Check className="text-primary h-4 w-4" />}
            </div>
            {option.shortcut && (
              <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                {option.shortcut}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
