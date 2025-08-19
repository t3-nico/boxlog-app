'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
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
  buttonClassName?: string
  dropdownClassName?: string
}

/**
 * ビュー切り替えドロップダウン
 * 汎用的なビュー切り替えコンポーネント
 */
export function ViewSwitcher({
  options,
  currentView,
  onChange,
  className,
  buttonClassName,
  dropdownClassName
}: ViewSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentOption = options.find(opt => opt.value === currentView)

  const handleSelect = (value: string) => {
    onChange(value)
    setIsOpen(false)
  }

  // ショートカットキー機能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl、Alt、Metaキーが押されている場合は無視
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }
      
      // 入力フィールドにフォーカスがある場合は無視
      const activeElement = document.activeElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )) {
        return
      }

      const key = event.key.toUpperCase()
      const option = options.find(opt => opt.shortcut?.toUpperCase() === key)
      
      if (option && option.value !== currentView) {
        event.preventDefault()
        onChange(option.value)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options, currentView, onChange])

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium',
          'rounded-md transition-colors',
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          buttonClassName
        )}
      >
        {currentOption?.icon}
        <span>{currentOption?.label || 'View'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={cn(
            'absolute right-0 top-full mt-1',
            'min-w-[160px] bg-background border border-border',
            'rounded-md shadow-lg z-50',
            dropdownClassName
          )}>
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm',
                    'hover:bg-accent/50 transition-colors',
                    'flex items-center justify-between gap-2',
                    currentView === option.value 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {option.shortcut && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {option.shortcut}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}