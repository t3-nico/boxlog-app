import type { LucideIcon } from 'lucide-react';

/**
 * ナビゲーションタブアイテムの型定義
 */
export interface NavTabItem {
  id: string;
  icon: LucideIcon;
  label: string;
  url: string;
}
