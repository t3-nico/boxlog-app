// ビューのプリロード: ブラウザがアイドル状態の時に先読みして遷移を高速化
export const preloadCalendarViews = () => {
  // 最もよく使うビューを先読み（絶対パスで指定）
  import('@/features/calendar/components/views/DayView');
  import('@/features/calendar/components/views/WeekView');
  import('@/features/calendar/components/views/MultiDayView');
  import('@/features/calendar/components/views/AgendaView');
};

// クライアントサイドでのみ実行
export const initializePreload = () => {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
        preloadCalendarViews,
      );
    } else {
      // Safari等のフォールバック
      setTimeout(preloadCalendarViews, 1000);
    }
  }
};
