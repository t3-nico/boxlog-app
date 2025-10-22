// Cookie consent
export { CookieConsentBanner } from './cookie-consent-banner'

// Error handling
export { GlobalErrorBoundary } from './ErrorBoundary'
export type { GlobalErrorBoundaryProps, GlobalErrorBoundaryState } from './ErrorBoundary'

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
