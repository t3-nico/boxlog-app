/**
 * Re-export from shared components for backward compatibility
 * 実体は @/components/layout/AppAside に移動済み
 *
 * 具象パネルコンテンツの注入は composition layer（@/components/layout/ または src/app/）で行う
 */
export { AppAside, type AsideType } from '@/components/layout/AppAside';
