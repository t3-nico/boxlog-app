/**
 * ドラッグ要素の作成・管理専用フック
 */

'use client'

import { useCallback, useRef } from 'react'

import { calendarColors } from '@/features/calendar/theme'

import { formatTimeRange } from '../../utils/dateHelpers'

export function useDragElement() {
  const dragElementRef = useRef<HTMLElement | null>(null)
  const originalElementRef = useRef<HTMLElement | null>(null)

  const createDragElement = useCallback((originalElement: HTMLElement) => {
    const rect = originalElement.getBoundingClientRect()
    const dragElement = originalElement.cloneNode(true) as HTMLElement

    // 元のクラスをクリアして、draggingスタイルを適用
    dragElement.className = ''
    dragElement.classList.add('rounded-md', 'px-2', 'py-1', 'overflow-hidden')

    // scheduledのactiveカラーを適用
    const activeColorClasses = calendarColors.event.scheduled.active?.split(' ') || []
    activeColorClasses.forEach(cls => {
      if (cls) dragElement.classList.add(cls)
    })

    // position: fixed で画面全体を基準に配置
    dragElement.style.position = 'fixed'
    dragElement.style.left = `${rect.left}px`
    dragElement.style.top = `${rect.top}px`
    dragElement.style.width = `${rect.width}px`
    dragElement.style.height = `${rect.height}px`
    dragElement.style.opacity = '0.9'
    dragElement.style.pointerEvents = 'none'
    dragElement.style.zIndex = '9999'
    dragElement.style.transition = 'none'
    dragElement.style.boxShadow = 'none'
    dragElement.classList.add('dragging-element')

    // bodyに追加
    document.body.appendChild(dragElement)

    // 元の要素を半透明に
    originalElement.style.opacity = '0.3'

    dragElementRef.current = dragElement
    originalElementRef.current = originalElement

    return { dragElement, initialRect: rect }
  }, [])

  const updateDragElementPosition = useCallback((
    newLeft: number,
    newTop: number,
    containerRect?: DOMRect
  ) => {
    if (!dragElementRef.current) return

    let finalLeft = newLeft
    let finalTop = newTop

    // コンテナ内に制限
    if (containerRect) {
      const elementWidth = dragElementRef.current.offsetWidth
      const elementHeight = dragElementRef.current.offsetHeight

      finalLeft = Math.max(
        containerRect.left,
        Math.min(containerRect.right - elementWidth, newLeft)
      )
      finalTop = Math.max(
        containerRect.top,
        Math.min(containerRect.bottom - elementHeight, newTop)
      )
    }

    dragElementRef.current.style.left = `${finalLeft}px`
    dragElementRef.current.style.top = `${finalTop}px`
  }, [])

  const updateDragElementTime = useCallback((
    startTime: Date,
    endTime: Date,
    timeFormat: '12h' | '24h' = '24h'
  ) => {
    if (!dragElementRef.current) return

    const timeElement = dragElementRef.current.querySelector('.event-time')
    if (timeElement) {
      const formattedTimeRange = formatTimeRange(startTime, endTime, timeFormat)
      timeElement.textContent = formattedTimeRange
    }
  }, [])

  const cleanupDragElements = useCallback(() => {
    // ドラッグ要素を削除
    if (dragElementRef.current) {
      dragElementRef.current.remove()
      dragElementRef.current = null
    }

    // 元の要素の透明度を復元
    if (originalElementRef.current) {
      originalElementRef.current.style.opacity = '1'
      originalElementRef.current = null
    }
  }, [])

  const getDragElement = useCallback(() => dragElementRef.current, [])

  return {
    createDragElement,
    updateDragElementPosition,
    updateDragElementTime,
    cleanupDragElements,
    getDragElement,
  }
}