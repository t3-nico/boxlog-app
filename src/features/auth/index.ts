// Auth feature exports
// Component exports - individually exported to avoid conflicts
export { AuthForm } from './components/AuthForm'
export { AuthGuard } from './components/AuthGuard'
export { AuthLayout } from './components/AuthLayout'
export { AuthPageLayout } from './components/AuthPageLayout'
export { LoginForm } from './components/LoginForm'
export { PasswordResetForm } from './components/PasswordResetForm'
export { default as ProtectedRoute } from './components/ProtectedRoute'
// export { SignupForm } from './components/SignupForm' // shadcn/ui公式signup-04を使用

// Context and hooks
export { AuthProvider, useAuthContext } from './contexts/AuthContext'
export { useAuth } from './hooks/useAuth'
export { AUTH_CONFIG as authConfig } from './lib/auth-config'

// Note: LoginFormDisabled and useAuthForm are currently unused and excluded from exports
