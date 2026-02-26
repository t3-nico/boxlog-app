/**
 * Navigation Feature - Public API
 *
 * サイドバー、モバイルメニュー、アサイドパネルなどのナビゲーション機能。
 * 内部モジュールへの直接参照（deep import）は避け、ここからのみ import すること。
 */

// =============================================================================
// Components
// =============================================================================
export { AppAside } from './components/aside/AppAside';
export { AsideSwitcher } from './components/aside/AsideSwitcher';
export type { AsideType } from './components/aside/AsideSwitcher';
export { CreateActionSheet, useCreateActionSheet } from './components/mobile/CreateActionSheet';
export type { CreateActionType } from './components/mobile/CreateActionSheet';
export { MobileMenuButton } from './components/mobile/MobileMenuButton';
export { AppSidebar } from './components/sidebar/app-sidebar';
export { SidebarSection } from './components/sidebar/SidebarSection';

// =============================================================================
// Hooks
// =============================================================================
export { useCreateMenuItems } from './hooks/useCreateMenuItems';
export type {
  CreateMenuEntry,
  CreateMenuItem,
  CreateMenuSeparator,
} from './hooks/useCreateMenuItems';

// =============================================================================
// Stores
// =============================================================================
// Re-export from shared stores for backward compatibility
export { useAppAsideStore } from '@/stores/useAppAsideStore';
export { usePageTitleStore } from './stores/usePageTitleStore';
// Re-export from shared stores for backward compatibility
export { useSidebarStore } from '@/stores/useSidebarStore';
