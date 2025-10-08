/**
 * スクロール同期フック
 */

import { useCallback, useEffect, useRef } from 'react'

import type { ScrollSyncOptions } from '../types/view.types'

export function useScrollSync(options: ScrollSyncOptions = {}) {
  const { horizontal = false, vertical = true, initialScrollTop = 0, initialScrollLeft = 0, onScroll } = options

  const containerRefs = useRef<HTMLElement[]>([])
  const isScrolling = useRef(false)

  // コンテナを登録
  const registerContainer = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return

      if (!containerRefs.current.includes(element)) {
        containerRefs.current.push(element)

        // 初期スクロール位置を設定
        if (initialScrollTop > 0) {
          element.scrollTop = initialScrollTop
        }
        if (initialScrollLeft > 0) {
          element.scrollLeft = initialScrollLeft
        }
      }
    },
    [initialScrollTop, initialScrollLeft]
  )

  // コンテナの登録を解除
  const unregisterContainer = useCallback((element: HTMLElement) => {
    const index = containerRefs.current.indexOf(element)
    if (index > -1) {
      containerRefs.current.splice(index, 1)
    }
  }, [])

  // スクロール同期の実装
  const syncScroll = useCallback(
    (sourceElement: HTMLElement) => {
      if (isScrolling.current) return

      isScrolling.current = true

      containerRefs.current.forEach((container) => {
        if (container === sourceElement) return

        if (vertical) {
          container.scrollTop = sourceElement.scrollTop
        }
        if (horizontal) {
          container.scrollLeft = sourceElement.scrollLeft
        }
      })

      // スクロールコールバック
      if (onScroll) {
        onScroll(sourceElement.scrollTop, sourceElement.scrollLeft)
      }

      // 次のフレームでフラグをリセット
      requestAnimationFrame(() => {
        isScrolling.current = false
      })
    },
    [vertical, horizontal, onScroll]
  )

  // スクロールイベントリスナーを追加
  useEffect(() => {
    const listeners = new Map<HTMLElement, (e: Event) => void>()

    containerRefs.current.forEach((container) => {
      const listener = (e: Event) => {
        syncScroll(e.target as HTMLElement)
      }

      container.addEventListener('scroll', listener, { passive: true })
      listeners.set(container, listener)
    })

    return () => {
      listeners.forEach((listener, container) => {
        container.removeEventListener('scroll', listener)
      })
    }
  }, [syncScroll])

  // 指定位置にスクロール
  const scrollTo = useCallback((scrollTop?: number, scrollLeft?: number) => {
    containerRefs.current.forEach((container) => {
      if (scrollTop !== undefined) {
        container.scrollTop = scrollTop
      }
      if (scrollLeft !== undefined) {
        container.scrollLeft = scrollLeft
      }
    })
  }, [])

  // 指定時間にスクロール
  const scrollToTime = useCallback(
    (hour: number, minute: number = 0, hourHeight: number = 60) => {
      const totalMinutes = hour * 60 + minute
      const scrollTop = (totalMinutes * hourHeight) / 60
      scrollTo(scrollTop)
    },
    [scrollTo]
  )

  return {
    registerContainer,
    unregisterContainer,
    scrollTo,
    scrollToTime,
  }
}
