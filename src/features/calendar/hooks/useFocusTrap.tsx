'use client'

import { useRef, useEffect, useCallback } from 'react'

interface FocusTrapOptions {
  enabled: boolean
  autoFocus?: boolean
  restoreFocus?: boolean
  clickOutsideDeactivates?: boolean
  escapeDeactivates?: boolean
  returnFocusOnDeactivate?: boolean
  onActivate?: () => void
  onDeactivate?: () => void
  onPostActivate?: () => void
  onPostDeactivate?: () => void
}

interface FocusableElement {
  element: HTMLElement
  tabIndex: number
}

// フォーカス可能な要素のセレクター
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'iframe',
  'object',
  'embed',
  'area[href]',
  'summary',
  '[role="button"]:not([disabled])',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="textbox"]'
].join(',')

// 要素がフォーカス可能かどうかを判定
function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
    return false
  }

  if (element.hasAttribute('tabindex')) {
    const tabIndex = parseInt(element.getAttribute('tabindex') || '0', 10)
    return tabIndex >= 0
  }

  // hidden要素は除外
  if (element.hidden || element.style.display === 'none' || element.style.visibility === 'hidden') {
    return false
  }

  // aria-hidden要素は除外
  if (element.getAttribute('aria-hidden') === 'true') {
    return false
  }

  return element.matches(FOCUSABLE_SELECTORS)
}

// 要素が表示されているかを判定
function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

// コンテナ内のフォーカス可能な要素を取得
function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)) as HTMLElement[]
  
  return elements
    .filter(element => isFocusable(element) && isVisible(element))
    .map(element => ({
      element,
      tabIndex: parseInt(element.getAttribute('tabindex') || '0', 10)
    }))
    .sort((a, b) => {
      // tabindex順でソート（0と正数は文書順、負数は無視）
      if (a.tabIndex < 0 && b.tabIndex >= 0) return 1
      if (b.tabIndex < 0 && a.tabIndex >= 0) return -1
      if (a.tabIndex !== b.tabIndex) return a.tabIndex - b.tabIndex
      
      // 同じtabindexの場合は文書順
      return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })
}

export function useFocusTrap(options: FocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const isActive = useRef(false)

  // フォーカストラップの有効化
  const activate = useCallback(() => {
    if (isActive.current || !containerRef.current || !options.enabled) return

    // 現在のフォーカス要素を保存
    if (options.restoreFocus && document.activeElement instanceof HTMLElement) {
      previouslyFocusedElement.current = document.activeElement
    }

    isActive.current = true
    options.onActivate?.()

    // 自動フォーカス
    if (options.autoFocus) {
      const focusableElements = getFocusableElements(containerRef.current)
      if (focusableElements.length > 0) {
        focusableElements[0].element.focus()
      }
    }

    options.onPostActivate?.()
  }, [options])

  // フォーカストラップの無効化
  const deactivate = useCallback(() => {
    if (!isActive.current) return

    isActive.current = false
    options.onDeactivate?.()

    // フォーカスを復元
    if (options.returnFocusOnDeactivate && previouslyFocusedElement.current) {
      try {
        previouslyFocusedElement.current.focus()
      } catch (error) {
        console.warn('Failed to restore focus:', error)
      }
      previouslyFocusedElement.current = null
    }

    options.onPostDeactivate?.()
  }, [options])

  // Tab キーの処理
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!isActive.current || !containerRef.current || event.key !== 'Tab') return

    const focusableElements = getFocusableElements(containerRef.current)
    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0].element
    const lastElement = focusableElements[focusableElements.length - 1].element
    const currentElement = document.activeElement as HTMLElement

    if (event.shiftKey) {
      // Shift + Tab: 前の要素へ
      if (currentElement === firstElement || !containerRef.current.contains(currentElement)) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: 次の要素へ
      if (currentElement === lastElement || !containerRef.current.contains(currentElement)) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [])

  // Escape キーの処理
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (!isActive.current || !options.escapeDeactivates || event.key !== 'Escape') return
    
    event.preventDefault()
    deactivate()
  }, [options.escapeDeactivates, deactivate])

  // 外部クリックの処理
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!isActive.current || !options.clickOutsideDeactivates || !containerRef.current) return

    const target = event.target as Node
    if (!containerRef.current.contains(target)) {
      deactivate()
    }
  }, [options.clickOutsideDeactivates, deactivate])

  // フォーカスが外部に移動した場合の処理
  const handleFocusOut = useCallback((_event: FocusEvent) => {
    if (!isActive.current || !containerRef.current) return

    // フォーカスが完全に外部に移動したかを確認
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement
      
      if (!activeElement || !containerRef.current?.contains(activeElement)) {
        // フォーカスを最初の要素に戻す
        const focusableElements = getFocusableElements(containerRef.current!)
        if (focusableElements.length > 0) {
          focusableElements[0].element.focus()
        }
      }
    }, 0)
  }, [])

  // イベントリスナーの設定
  useEffect(() => {
    if (!options.enabled) {
      deactivate()
      return
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [options.enabled, handleTabKey, handleEscapeKey, handleClickOutside, handleFocusOut, deactivate])

  // enabled状態の変更を監視
  useEffect(() => {
    if (options.enabled) {
      activate()
    } else {
      deactivate()
    }
  }, [options.enabled, activate, deactivate])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (isActive.current) {
        deactivate()
      }
    }
  }, [deactivate])

  // 手動でフォーカスを移動するヘルパー関数
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return false

    const focusableElements = getFocusableElements(containerRef.current)
    if (focusableElements.length > 0) {
      focusableElements[0].element.focus()
      return true
    }
    return false
  }, [])

  const focusLast = useCallback(() => {
    if (!containerRef.current) return false

    const focusableElements = getFocusableElements(containerRef.current)
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].element.focus()
      return true
    }
    return false
  }, [])

  const focusNext = useCallback(() => {
    if (!containerRef.current) return false

    const focusableElements = getFocusableElements(containerRef.current)
    const currentIndex = focusableElements.findIndex(
      ({ element }) => element === document.activeElement
    )

    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].element.focus()
      return true
    } else if (focusableElements.length > 0) {
      focusableElements[0].element.focus()
      return true
    }
    return false
  }, [])

  const focusPrevious = useCallback(() => {
    if (!containerRef.current) return false

    const focusableElements = getFocusableElements(containerRef.current)
    const currentIndex = focusableElements.findIndex(
      ({ element }) => element === document.activeElement
    )

    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].element.focus()
      return true
    } else if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].element.focus()
      return true
    }
    return false
  }, [])

  // フォーカス可能な要素の情報を取得
  const getFocusableInfo = useCallback(() => {
    if (!containerRef.current) {
      return {
        elements: [],
        count: 0,
        currentIndex: -1,
        hasElements: false
      }
    }

    const focusableElements = getFocusableElements(containerRef.current)
    const currentIndex = focusableElements.findIndex(
      ({ element }) => element === document.activeElement
    )

    return {
      elements: focusableElements,
      count: focusableElements.length,
      currentIndex,
      hasElements: focusableElements.length > 0
    }
  }, [])

  return {
    containerRef,
    isActive: isActive.current,
    activate,
    deactivate,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableInfo
  }
}

// React コンポーネント用のフォーカストラップ
interface FocusTrapProps {
  enabled: boolean
  children: React.ReactNode
  className?: string
  autoFocus?: boolean
  restoreFocus?: boolean
  clickOutsideDeactivates?: boolean
  escapeDeactivates?: boolean
  onActivate?: () => void
  onDeactivate?: () => void
}

export const FocusTrap = ({
  enabled,
  children,
  className,
  autoFocus = true,
  restoreFocus = true,
  clickOutsideDeactivates = true,
  escapeDeactivates = true,
  onActivate,
  onDeactivate
}: FocusTrapProps) => {
  const { containerRef } = useFocusTrap({
    enabled,
    autoFocus,
    restoreFocus,
    clickOutsideDeactivates,
    escapeDeactivates,
    returnFocusOnDeactivate: restoreFocus,
    onActivate,
    onDeactivate
  })

  return (
    <div
      ref={containerRef}
      className={className}
      data-focus-trap={enabled ? 'active' : 'inactive'}
    >
      {children}
    </div>
  )
}