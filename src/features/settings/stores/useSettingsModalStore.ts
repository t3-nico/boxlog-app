import { create } from 'zustand';

import type { SettingsCategory } from '../types';

/**
 * 設定モーダルの状態管理
 *
 * Notion風フルスクリーンモーダルの開閉とカテゴリ選択を管理
 */
interface SettingsModalStore {
  isOpen: boolean;
  selectedCategory: SettingsCategory;
  openModal: (category?: SettingsCategory) => void;
  closeModal: () => void;
  setCategory: (category: SettingsCategory) => void;
}

export const useSettingsModalStore = create<SettingsModalStore>((set) => ({
  isOpen: false,
  selectedCategory: 'general',
  openModal: (category = 'general') => set({ isOpen: true, selectedCategory: category }),
  closeModal: () => set({ isOpen: false }),
  setCategory: (category) => set({ selectedCategory: category }),
}));
