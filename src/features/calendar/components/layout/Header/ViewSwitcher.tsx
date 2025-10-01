'use client'

import { useCallback, useEffect, useState } from 'react'

import { Check, ChevronDown } from 'lucide-react'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
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
export const ViewSwitcher = ({
  options,
  currentView,
  onChange,
  className,
  buttonClassName,
  dropdownClassName,
}: ViewSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentOption = options.find((opt) => opt.value === currentView)
  const { showWeekends, updateSettings } = useCalendarSettingsStore()

  const handleSelect = (value: string) => {
    onChange(value)
    setIsOpen(false)
  }

  const handleWeekendToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    // アニメーション付きで切り替え
    const newValue = !showWeekends

    // 即座に視覚的なフィードバックを提供
    const checkIcon = e.currentTarget.querySelector('[data-check-icon]')
    if (checkIcon) {
      checkIcon.classList.add('scale-110')
      setTimeout(() => checkIcon.classList.remove('scale-110'), 150)
    }

    // 設定を更新（これによりカレンダーが再レンダリングされる）
    updateSettings({ showWeekends: newValue })
  }

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

  // Handler functions
  const handleToggleOpen = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleBackdropKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  const createOptionClickHandler = useCallback((value: string) => {
    return () => handleSelect(value)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleToggleOpen}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium',
          'rounded-md transition-colors',
          'bg-neutral-200 dark:bg-neutral-700',
          'text-neutral-700 dark:text-neutral-300',
          'hover:bg-neutral-300 dark:hover:bg-neutral-600',
          buttonClassName
        )}
      >
        {currentOption?.icon}
        <span>{currentOption?.label || 'Day'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen === true && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
            onKeyDown={handleBackdropKeyDown}
            role="button"
            tabIndex={0}
            aria-label="ドロップダウンを閉じる"
          />

          {/* Dropdown */}
          <div
            className={cn(
              'absolute right-0 top-full mt-1',
              'min-w-[160px]',
              'bg-white dark:bg-neutral-900',
              'rounded-md',
              'z-50 shadow-lg',
              dropdownClassName
            )}
          >
            <div>
              {/* ビューオプション */}
              <div className="py-1">
                {options.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={createOptionClickHandler(option.value)}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm',
                      'transition-colors',
                      'flex items-center justify-between gap-2',
                      currentView === option.value
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                    {option.shortcut != null && (
                      <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{option.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ボーダー */}
              <div className="border-t border-neutral-900/10 dark:border-neutral-100/10" />

              {/* 週末表示オプション（すべてのビューに反映） */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleWeekendToggle}
                  className={cn(
                    'w-full px-4 py-2 text-sm',
                    'flex items-center gap-2',
                    'transition-colors',
                    'rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    'text-neutral-600 dark:text-neutral-400',
                    'hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  )}
                  role="checkbox"
                  aria-checked={showWeekends}
                  aria-label={`週末表示を${showWeekends ? '無効' : '有効'}にする`}
                  aria-describedby="weekend-toggle-description"
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border border-neutral-300 transition-all duration-200 dark:border-neutral-600',
                      showWeekends && 'bg-primary border-primary'
                    )}
                  >
                    {showWeekends != null && (
                      <Check className="h-3 w-3 text-white transition-transform duration-150" data-check-icon />
                    )}
                  </div>
                  <span>週末表示</span>
                </button>
                {/* アクセシビリティ用の説明（スクリーンリーダー向け） */}
                <div id="weekend-toggle-description" className="sr-only">
                  キーボードショートカット: Cmd+W または Ctrl+W で切り替え可能
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
