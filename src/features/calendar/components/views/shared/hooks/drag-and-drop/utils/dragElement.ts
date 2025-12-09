import { calendarColors } from '@/features/calendar/theme'

/**
 * ドラッグ要素を作成する（position: fixed で自由移動）
 *
 * Googleカレンダー的動作:
 * - dragElementはマウス追従用（非表示、位置計算のみに使用）
 * - 実際の表示はスナップ位置でのプレビュー（calculatePlanGhostStyleで処理）
 */
export function createDragElement(originalElement: HTMLElement): { dragElement: HTMLElement; initialRect: DOMRect } {
  const rect = originalElement.getBoundingClientRect()
  const dragElement = originalElement.cloneNode(true) as HTMLElement

  dragElement.className = ''
  dragElement.classList.add('rounded-md', 'px-2', 'py-1', 'overflow-hidden')

  const activeColorClasses = calendarColors.event.scheduled.active?.split(' ') || []
  activeColorClasses.forEach((cls) => {
    if (cls) dragElement.classList.add(cls)
  })

  dragElement.style.position = 'fixed'
  dragElement.style.left = `${rect.left}px`
  dragElement.style.top = `${rect.top}px`
  dragElement.style.width = `${rect.width}px`
  dragElement.style.height = `${rect.height}px`
  // Googleカレンダー的動作: マウス追従要素は非表示
  // スナップ位置でのプレビュー表示のみを使用
  dragElement.style.opacity = '0'
  dragElement.style.pointerEvents = 'none'
  dragElement.style.zIndex = '9999'
  dragElement.style.transition = 'none'
  dragElement.style.boxShadow = 'none'
  dragElement.classList.add('dragging-element')

  document.body.appendChild(dragElement)

  return { dragElement, initialRect: rect }
}

/**
 * ドラッグ要素の位置を更新する
 */
export function updateDragElementPosition(
  dragElement: HTMLElement | null,
  initialRect: DOMRect | null,
  deltaX: number,
  deltaY: number
): void {
  if (!dragElement || !initialRect) return

  let newLeft = initialRect.left + deltaX
  let newTop = initialRect.top + deltaY

  const calendarContainer =
    (document.querySelector('[data-calendar-main]') as HTMLElement) ||
    (document.querySelector('.calendar-main') as HTMLElement) ||
    (document.querySelector('main') as HTMLElement)

  if (calendarContainer) {
    const containerRect = calendarContainer.getBoundingClientRect()
    const elementWidth = dragElement.offsetWidth
    const elementHeight = dragElement.offsetHeight

    newLeft = Math.max(containerRect.left, Math.min(containerRect.right - elementWidth, newLeft))
    newTop = Math.max(containerRect.top, Math.min(containerRect.bottom - elementHeight, newTop))
  }

  dragElement.style.left = `${newLeft}px`
  dragElement.style.top = `${newTop}px`
}

/**
 * ドラッグ要素をクリーンアップする
 *
 * 注意: 元要素の透明度はReact状態で管理されるため、ここでは変更しない
 */
export function cleanupDragElements(dragElement: HTMLElement | null, _originalElement: HTMLElement | null): void {
  if (dragElement) {
    dragElement.remove()
  }
  // 元要素の透明度はReact状態（dragState）で管理
}

/**
 * カラム幅を計算する（日付間移動用）
 */
export function calculateColumnWidth(
  originalElement: HTMLElement | null,
  viewMode: string,
  displayDates: Date[] | undefined
): number {
  let columnWidth = 0

  if (viewMode !== 'day' && displayDates) {
    const gridContainer =
      (originalElement?.closest('.flex') as HTMLElement) ||
      (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
      (originalElement?.parentElement?.parentElement as HTMLElement)

    if (gridContainer && gridContainer.offsetWidth > 0) {
      const totalWidth = gridContainer.offsetWidth
      columnWidth = totalWidth / displayDates.length
    } else {
      columnWidth = (window.innerWidth / displayDates.length) * 0.75
    }
  }

  return columnWidth
}
