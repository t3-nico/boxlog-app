// Auth feature exports
// Component exports - individually exported to avoid conflicts
export { AuthLayout } from './components/AuthLayout';
export { LoginForm } from './components/LoginForm';
export { PasswordResetForm } from './components/PasswordResetForm';
export { ResetPasswordForm } from './components/ResetPasswordForm';
export { SessionMonitorProvider } from './components/SessionMonitorProvider';
export { SessionTimeoutDialog } from './components/SessionTimeoutDialog';
export { SignupForm } from './components/SignupForm';

// State management - Zustand store (Context APIから移行)
export { AuthStoreInitializer } from './stores/AuthStoreInitializer';
// Re-export from shared stores for backward compatibility
export {
  selectError,
  selectIsAuthenticated,
  selectLoading,
  selectSession,
  selectUser,
  useAuthStore,
} from '@/stores/useAuthStore';

// Hooks
export { useSessionMonitor } from './hooks/useSessionMonitor';
export { AUTH_CONFIG as authConfig } from './lib/auth-config';

// Audit Log
export { getAuditLogs, getRecentLogins, recordAuthAuditLog } from './lib/audit-log';
export type { AuthAuditEventType, AuthAuditLogEntry, AuthAuditMetadata } from './lib/audit-log';
