import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { SettingsCategory } from '../types'

interface SettingsDialogStore {
  // 状態
  isOpen: boolean
  activeCategory: SettingsCategory

  // アクション
  openSettings: (category?: SettingsCategory) => void
  closeSettings: () => void
  setActiveCategory: (category: SettingsCategory) => void
}

const DEFAULT_CATEGORY: SettingsCategory = 'account'

export const useSettingsDialogStore = create<SettingsDialogStore>()(
  persist(
    (set) => ({
      // 初期状態
      isOpen: false,
      activeCategory: DEFAULT_CATEGORY,

      // Dialog開く
      openSettings: (category) =>
        set((state) => ({
          isOpen: true,
          activeCategory: category || state.activeCategory,
        })),

      // Dialog閉じる
      closeSettings: () =>
        set({
          isOpen: false,
        }),

      // カテゴリ切り替え
      setActiveCategory: (category) =>
        set({
          activeCategory: category,
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
