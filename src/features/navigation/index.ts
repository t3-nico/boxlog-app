/**
 * Navigation Feature - Public API
 *
 * サイドバー、モバイルメニュー、アサイドパネルなどのナビゲーション機能。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Components
// =============================================================================
export type { AsideType } from './components/aside/AsideSwitcher';
export { CreateActionSheet, useCreateActionSheet } from './components/mobile/CreateActionSheet';
export type { CreateActionType } from './components/mobile/CreateActionSheet';
export { AppSidebar } from './components/sidebar/app-sidebar';

// =============================================================================
// Hooks
// =============================================================================
export { useCreateMenuItems } from '@/hooks/useCreateMenuItems';
export type {
  CreateMenuEntry,
  CreateMenuItem,
  CreateMenuSeparator,
} from '@/hooks/useCreateMenuItems';

// =============================================================================
// Stores
// =============================================================================
// Layout state (sidebar + aside) is now in @/stores/useLayoutStore
export { useLayoutStore } from '@/stores/useLayoutStore';
export { usePageTitleStore } from './stores/usePageTitleStore';
