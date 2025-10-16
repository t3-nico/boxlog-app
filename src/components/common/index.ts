// Cookie consent
export { CookieConsentBanner } from './cookie-consent-banner'

// Error handling
export { GlobalErrorBoundary } from './ErrorBoundary'
export type { GlobalErrorBoundaryProps, GlobalErrorBoundaryState } from './ErrorBoundary'

// Providers
export { Providers } from './Providers'
export type { ProvidersProps } from './Providers'

// Auto-retry hooks
export { useApiRetry, default as useAutoRetry, useDataFetchRetry, useUserActionRetry } from '../../hooks/useAutoRetry'

// Error patterns system
export {
  createErrorToast,
  getDetailedErrorInfo,
  getErrorPattern,
  getRecommendedActions,
  getUserFriendlyMessage,
  isAutoRecoverable,
} from '../../config/error-patterns'
