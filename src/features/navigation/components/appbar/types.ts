import type { LucideIcon } from 'lucide-react';

/**
 * AppBarナビゲーションアイテムの型定義
 */
export interface AppBarNavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  url: string;
}

/**
 * ItemコンポーネントのProps
 */
export interface ItemProps {
  icon: LucideIcon;
  label: string;
  url: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
