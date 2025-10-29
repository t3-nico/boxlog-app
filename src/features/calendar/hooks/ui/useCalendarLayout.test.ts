import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCalendarLayout } from './useCalendarLayout'

describe('useCalendarLayout', () => {
  beforeEach(() => {
    // LocalStorageのモック
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value
        },
        clear: () => {
          store = {}
        },
      }
    })()

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // window.innerWidthのモック（desktop）
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })
  })

  describe('初期化', () => {
    it('デフォルト値で初期化される', () => {
      const { result } = renderHook(() => useCalendarLayout())

      expect(result.current.sidebarOpen).toBe(true)
      expect(result.current.viewType).toBe('week')
      expect(result.current.currentDate).toBeInstanceOf(Date)
      expect(result.current.layoutMode).toBe('default')
    })

    it('カスタム初期値で初期化される', () => {
      const initialDate = new Date('2024-01-15')
      const { result } = renderHook(() =>
        useCalendarLayout({
          sidebarDefaultOpen: false,
          initialViewType: 'day',
          initialDate,
        })
      )

      expect(result.current.sidebarOpen).toBe(false)
      expect(result.current.viewType).toBe('day')
      expect(result.current.currentDate).toEqual(initialDate)
    })
  })

  describe('サイドバー操作', () => {
    it('toggleSidebarでサイドバーが開閉する', () => {
      const { result } = renderHook(() => useCalendarLayout({ sidebarDefaultOpen: true }))

      expect(result.current.sidebarOpen).toBe(true)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(true)
    })

    it('setSidebarOpenで直接サイドバー状態を設定できる', () => {
      const { result } = renderHook(() => useCalendarLayout({ sidebarDefaultOpen: true }))

      act(() => {
        result.current.setSidebarOpen(false)
      })

      expect(result.current.sidebarOpen).toBe(false)

      act(() => {
        result.current.setSidebarOpen(true)
      })

      expect(result.current.sidebarOpen).toBe(true)
    })
  })

  describe('レイアウトモード', () => {
    it('レイアウトモードを変更できる', () => {
      const { result } = renderHook(() => useCalendarLayout())

      expect(result.current.layoutMode).toBe('default')

      act(() => {
        result.current.setLayoutMode('compact')
      })

      expect(result.current.layoutMode).toBe('compact')

      act(() => {
        result.current.setLayoutMode('fullscreen')
      })

      expect(result.current.layoutMode).toBe('fullscreen')
    })

    it('fullscreenモードではヘッダーとサイドバーが非表示になる', () => {
      const { result } = renderHook(() => useCalendarLayout())

      act(() => {
        result.current.setLayoutMode('fullscreen')
      })

      expect(result.current.layoutMode).toBe('fullscreen')
      expect(result.current.showHeader).toBe(false)
      expect(result.current.showSidebar).toBe(false)
      expect(result.current.isFullscreen).toBe(true)
    })
  })

  describe('カレンダービュー変更', () => {
    it('ビュータイプを変更できる', () => {
      const onViewChange = vi.fn()
      const { result } = renderHook(() => useCalendarLayout({ initialViewType: 'week', onViewChange }))

      expect(result.current.viewType).toBe('week')

      act(() => {
        result.current.changeView('day')
      })

      expect(result.current.viewType).toBe('day')
      expect(onViewChange).toHaveBeenCalledWith('day')

      act(() => {
        result.current.changeView('week')
      })

      expect(result.current.viewType).toBe('week')
      expect(onViewChange).toHaveBeenCalledWith('week')
    })
  })

  describe('日付ナビゲーション', () => {
    it('特定の日付に移動できる', () => {
      const onDateChange = vi.fn()
      const { result } = renderHook(() => useCalendarLayout({ onDateChange }))

      const newDate = new Date('2024-06-15')

      act(() => {
        result.current.navigateToDate(newDate)
      })

      expect(result.current.currentDate).toEqual(newDate)
      expect(onDateChange).toHaveBeenCalledWith(newDate)
    })

    it('todayで今日の日付に移動できる', () => {
      const { result } = renderHook(() => useCalendarLayout({ initialDate: new Date('2024-01-15') }))

      const today = new Date()

      act(() => {
        result.current.navigateRelative('today')
      })

      expect(result.current.currentDate.toDateString()).toBe(today.toDateString())
      expect(result.current.isToday).toBe(true)
    })

    it('週表示で前後に移動できる', () => {
      const initialDate = new Date('2024-06-15')
      const { result } = renderHook(() => useCalendarLayout({ initialViewType: 'week', initialDate }))

      act(() => {
        result.current.navigateRelative('next')
      })

      const expectedNextWeek = new Date('2024-06-22')
      expect(result.current.currentDate.toDateString()).toBe(expectedNextWeek.toDateString())

      act(() => {
        result.current.navigateRelative('prev')
      })
      act(() => {
        result.current.navigateRelative('prev')
      })

      const expectedPrevWeek = new Date('2024-06-08')
      expect(result.current.currentDate.toDateString()).toBe(expectedPrevWeek.toDateString())
    })

    it('日表示で前後に移動できる', () => {
      const initialDate = new Date('2024-06-15')
      const { result } = renderHook(() => useCalendarLayout({ initialViewType: 'day', initialDate }))

      act(() => {
        result.current.navigateRelative('next')
      })

      const expectedNextDay = new Date('2024-06-16')
      expect(result.current.currentDate.toDateString()).toBe(expectedNextDay.toDateString())

      act(() => {
        result.current.navigateRelative('prev')
      })
      act(() => {
        result.current.navigateRelative('prev')
      })

      const expectedPrevDay = new Date('2024-06-14')
      expect(result.current.currentDate.toDateString()).toBe(expectedPrevDay.toDateString())
    })
  })

  describe('日付範囲計算', () => {
    it('週表示で正しい日付範囲を計算する', () => {
      const initialDate = new Date('2024-06-15') // 土曜日
      const { result } = renderHook(() => useCalendarLayout({ initialViewType: 'week', initialDate }))

      const { start, end } = result.current.dateRange

      // 月曜日から日曜日までの範囲
      expect(start.getDate()).toBe(10) // 2024-06-10 (月)
      expect(end.getDate()).toBe(16) // 2024-06-16 (日)
    })

    it('日表示で同じ日付範囲を返す', () => {
      const initialDate = new Date('2024-06-15')
      const { result } = renderHook(() => useCalendarLayout({ initialViewType: 'day', initialDate }))

      const { start, end } = result.current.dateRange

      expect(start.toDateString()).toBe(initialDate.toDateString())
      expect(end.toDateString()).toBe(initialDate.toDateString())
    })
  })

  describe('LocalStorage永続化', () => {
    it('サイドバー状態がLocalStorageに保存される', () => {
      const { result } = renderHook(() =>
        useCalendarLayout({
          sidebarDefaultOpen: true,
          persistSidebarState: true,
        })
      )

      act(() => {
        result.current.setSidebarOpen(false)
      })

      expect(window.localStorage.getItem('calendar-sidebar-collapsed')).toBe('false')

      act(() => {
        result.current.setSidebarOpen(true)
      })

      expect(window.localStorage.getItem('calendar-sidebar-collapsed')).toBe('true')
    })

    it('カスタムストレージキーを使用できる', () => {
      const { result } = renderHook(() =>
        useCalendarLayout({
          sidebarDefaultOpen: true,
          persistSidebarState: true,
          sidebarStorageKey: 'custom-sidebar-key',
        })
      )

      act(() => {
        result.current.setSidebarOpen(false)
      })

      expect(window.localStorage.getItem('custom-sidebar-key')).toBe('false')
    })
  })

  describe('レスポンシブ判定', () => {
    it('デスクトップ幅でdesktop breakpointになる', () => {
      window.innerWidth = 1280
      const { result } = renderHook(() => useCalendarLayout())

      expect(result.current.currentBreakpoint).toBe('desktop')
      expect(result.current.isMobile).toBe(false)
    })

    it('タブレット幅でtablet breakpointになる', () => {
      window.innerWidth = 800
      const { result } = renderHook(() => useCalendarLayout())

      act(() => {
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current.currentBreakpoint).toBe('tablet')
      expect(result.current.isCompact).toBe(true)
    })

    it('モバイル幅でmobile breakpointになる', () => {
      window.innerWidth = 600
      const { result } = renderHook(() => useCalendarLayout())

      act(() => {
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current.currentBreakpoint).toBe('mobile')
      expect(result.current.isMobile).toBe(true)
    })
  })
})
