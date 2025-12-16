// Auth feature exports
// Component exports - individually exported to avoid conflicts
export { AuthForm } from './components/AuthForm'
export { AuthGuard } from './components/AuthGuard'
export { AuthLayout } from './components/AuthLayout'
export { AuthPageLayout } from './components/AuthPageLayout'
export { LoginForm } from './components/LoginForm'
export { PasswordResetForm } from './components/PasswordResetForm'
export { ProtectedRoute } from './components/ProtectedRoute'
export { SessionMonitorProvider } from './components/SessionMonitorProvider'
export { SessionTimeoutDialog } from './components/SessionTimeoutDialog'
export { SignupForm } from './components/SignupForm'

// State management - Zustand store (Context APIから移行)
export { AuthStoreInitializer } from './stores/AuthStoreInitializer'
export {
  selectError,
  selectIsAuthenticated,
  selectLoading,
  selectSession,
  selectUser,
  useAuthStore,
} from './stores/useAuthStore'

// Hooks
export { useAuth } from './hooks/useAuth'
export { useSessionMonitor } from './hooks/useSessionMonitor'
export { AUTH_CONFIG as authConfig } from './lib/auth-config'

// Audit Log
export { getAuditLogs, getRecentLogins, recordAuthAuditLog } from './lib/audit-log'
export type { AuthAuditEventType, AuthAuditLogEntry, AuthAuditMetadata } from './lib/audit-log'
