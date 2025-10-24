// Auth feature exports
// Component exports - individually exported to avoid conflicts
export { AuthForm } from './components/AuthForm'
export { AuthGuard } from './components/AuthGuard'
export { AuthLayout } from './components/AuthLayout'
export { AuthPageLayout } from './components/AuthPageLayout'
export { LoginForm } from './components/LoginForm'
export { PasswordResetForm } from './components/PasswordResetForm'
export { default as ProtectedRoute } from './components/ProtectedRoute'
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
export { AUTH_CONFIG as authConfig } from './lib/auth-config'

// Note: AuthProvider and useAuthContext are deprecated - use useAuthStore instead
// Note: LoginFormDisabled and useAuthForm are currently unused and excluded from exports
