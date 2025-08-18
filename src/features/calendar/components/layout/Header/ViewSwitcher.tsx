'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewOption = {
  value: string
  label: string
  icon?: React.ReactNode
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

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium',
          'bg-accent border border-border rounded-lg',
          'hover:bg-accent/80 transition-colors shadow-sm',
          buttonClassName
        )}
      >
        {currentOption?.icon}
        <span>{currentOption?.label || 'View'}</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
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
                    'flex items-center gap-2',
                    currentView === option.value 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-muted-foreground'
                  )}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}