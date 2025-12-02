// ビューのプリロード: ブラウザがアイドル状態の時に先読みして遷移を高速化
export const preloadCalendarViews = () => {
  // 最もよく使うビューを先読み
  import('../views/DayView')
  import('../views/WeekView')
  import('../views/ThreeDayView')
  import('../views/FiveDayView')
}

// クライアントサイドでのみ実行
export const initializePreload = () => {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      ;(window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(preloadCalendarViews)
    } else {
      // Safari等のフォールバック
      setTimeout(preloadCalendarViews, 1000)
    }
  }
}
