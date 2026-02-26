/**
 * Re-export from shared stores for backward compatibility
 * 実体は @/stores/useAuthStore に移動済み
 */
export {
  selectError,
  selectIsAuthenticated,
  selectLoading,
  selectSession,
  selectUser,
  useAuthStore,
} from '@/stores/useAuthStore';
