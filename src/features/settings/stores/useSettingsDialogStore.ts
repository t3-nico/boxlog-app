import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { SettingsCategory, SettingsSectionId } from '../types'

interface SettingsDialogStore {
  // 状態
  isOpen: boolean
  activeCategory: SettingsCategory
  scrollToSection: SettingsSectionId | null

  // アクション
  openSettings: (category?: SettingsCategory, scrollTo?: SettingsSectionId) => void
  closeSettings: () => void
  setActiveCategory: (category: SettingsCategory) => void
  clearScrollTarget: () => void
}

const DEFAULT_CATEGORY: SettingsCategory = 'general'

export const useSettingsDialogStore = create<SettingsDialogStore>()(
  persist(
    (set) => ({
      // 初期状態
      isOpen: false,
      activeCategory: DEFAULT_CATEGORY,
      scrollToSection: null,

      // Dialog開く
      openSettings: (category, scrollTo) =>
        set((state) => ({
          isOpen: true,
          activeCategory: category || state.activeCategory,
          scrollToSection: scrollTo || null,
        })),

      // Dialog閉じる
      closeSettings: () =>
        set({
          isOpen: false,
          scrollToSection: null,
        }),

      // カテゴリ切り替え
      setActiveCategory: (category) =>
        set({
          activeCategory: category,
          scrollToSection: null, // カテゴリ変更時はスクロール先をリセット
        }),

      // スクロール先をクリア
      clearScrollTarget: () =>
        set({
          scrollToSection: null,
        }),
    }),
    {
      name: 'settings-dialog',
      // isOpenは永続化しない（リロード時は常に閉じた状態）
      partialize: (state) => ({
        activeCategory: state.activeCategory,
      }),
    }
  )
)
