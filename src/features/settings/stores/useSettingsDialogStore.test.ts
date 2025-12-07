import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useSettingsDialogStore } from './useSettingsDialogStore'

describe('useSettingsDialogStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useSettingsDialogStore.getState().closeSettings()
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('初期状態', () => {
    it('デフォルトでダイアログは閉じている', () => {
      const { isOpen } = useSettingsDialogStore.getState()
      expect(isOpen).toBe(false)
    })

    it('デフォルトカテゴリはgeneral', () => {
      const { activeCategory } = useSettingsDialogStore.getState()
      expect(activeCategory).toBe('general')
    })

    it('スクロールターゲットはnull', () => {
      const { scrollToSection } = useSettingsDialogStore.getState()
      expect(scrollToSection).toBeNull()
    })
  })

  describe('openSettings', () => {
    it('ダイアログを開くことができる', () => {
      act(() => {
        useSettingsDialogStore.getState().openSettings()
      })

      const { isOpen } = useSettingsDialogStore.getState()
      expect(isOpen).toBe(true)
    })

    it('カテゴリを指定して開くことができる', () => {
      act(() => {
        useSettingsDialogStore.getState().openSettings('notifications')
      })

      const { isOpen, activeCategory } = useSettingsDialogStore.getState()
      expect(isOpen).toBe(true)
      expect(activeCategory).toBe('notifications')
    })

    it('スクロールターゲットを指定して開くことができる', () => {
      act(() => {
        useSettingsDialogStore.getState().openSettings('personalization', 'calendar')
      })

      const { isOpen, activeCategory, scrollToSection } = useSettingsDialogStore.getState()
      expect(isOpen).toBe(true)
      expect(activeCategory).toBe('personalization')
      expect(scrollToSection).toBe('calendar')
    })

    it('カテゴリを指定しない場合は現在のカテゴリを維持', () => {
      // まずnotificationsに設定
      act(() => {
        useSettingsDialogStore.getState().openSettings('notifications')
      })

      // 閉じる
      act(() => {
        useSettingsDialogStore.getState().closeSettings()
      })

      // カテゴリ指定なしで開く
      act(() => {
        useSettingsDialogStore.getState().openSettings()
      })

      const { activeCategory } = useSettingsDialogStore.getState()
      expect(activeCategory).toBe('notifications')
    })
  })

  describe('closeSettings', () => {
    it('ダイアログを閉じることができる', () => {
      // まず開く
      act(() => {
        useSettingsDialogStore.getState().openSettings()
      })
      expect(useSettingsDialogStore.getState().isOpen).toBe(true)

      // 閉じる
      act(() => {
        useSettingsDialogStore.getState().closeSettings()
      })

      const { isOpen } = useSettingsDialogStore.getState()
      expect(isOpen).toBe(false)
    })

    it('閉じるとスクロールターゲットがリセットされる', () => {
      // スクロールターゲット付きで開く
      act(() => {
        useSettingsDialogStore.getState().openSettings('personalization', 'tags')
      })
      expect(useSettingsDialogStore.getState().scrollToSection).toBe('tags')

      // 閉じる
      act(() => {
        useSettingsDialogStore.getState().closeSettings()
      })

      const { scrollToSection } = useSettingsDialogStore.getState()
      expect(scrollToSection).toBeNull()
    })
  })

  describe('setActiveCategory', () => {
    it('カテゴリを変更できる', () => {
      act(() => {
        useSettingsDialogStore.getState().setActiveCategory('account')
      })

      const { activeCategory } = useSettingsDialogStore.getState()
      expect(activeCategory).toBe('account')
    })

    it('カテゴリ変更時にスクロールターゲットがリセットされる', () => {
      // スクロールターゲット付きで開く
      act(() => {
        useSettingsDialogStore.getState().openSettings('personalization', 'calendar')
      })
      expect(useSettingsDialogStore.getState().scrollToSection).toBe('calendar')

      // カテゴリを変更
      act(() => {
        useSettingsDialogStore.getState().setActiveCategory('notifications')
      })

      const { scrollToSection } = useSettingsDialogStore.getState()
      expect(scrollToSection).toBeNull()
    })

    it('全てのカテゴリに変更できる', () => {
      const categories = [
        'general',
        'personalization',
        'notifications',
        'data-controls',
        'account',
        'subscription',
        'about',
      ] as const

      categories.forEach((category) => {
        act(() => {
          useSettingsDialogStore.getState().setActiveCategory(category)
        })
        expect(useSettingsDialogStore.getState().activeCategory).toBe(category)
      })
    })
  })

  describe('clearScrollTarget', () => {
    it('スクロールターゲットをクリアできる', () => {
      // スクロールターゲット付きで開く
      act(() => {
        useSettingsDialogStore.getState().openSettings('personalization', 'chronotype')
      })
      expect(useSettingsDialogStore.getState().scrollToSection).toBe('chronotype')

      // クリア
      act(() => {
        useSettingsDialogStore.getState().clearScrollTarget()
      })

      const { scrollToSection } = useSettingsDialogStore.getState()
      expect(scrollToSection).toBeNull()
    })

    it('既にnullの場合もエラーにならない', () => {
      expect(useSettingsDialogStore.getState().scrollToSection).toBeNull()

      act(() => {
        useSettingsDialogStore.getState().clearScrollTarget()
      })

      expect(useSettingsDialogStore.getState().scrollToSection).toBeNull()
    })
  })

  describe('永続化', () => {
    it('activeCategoryのみが永続化される', () => {
      // カテゴリを変更して閉じる
      act(() => {
        useSettingsDialogStore.getState().openSettings('subscription')
        useSettingsDialogStore.getState().closeSettings()
      })

      // isOpenはfalse（永続化されない）
      expect(useSettingsDialogStore.getState().isOpen).toBe(false)
      // activeCategoryは保持される
      expect(useSettingsDialogStore.getState().activeCategory).toBe('subscription')
    })
  })
})
