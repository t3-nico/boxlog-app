// Cookie consent
export { CookieConsentBanner } from './cookie-consent-banner'

// Error handling
export { GlobalErrorBoundary } from './ErrorBoundary'
export type { GlobalErrorBoundaryProps, GlobalErrorBoundaryState } from './ErrorBoundary'

// Loading states
export {
  DataLoading,
  LoadingButton,
  LoadingCard,
  LoadingOverlay,
  LoadingSpinner,
  LoadingStates,
  PresetLoadings,
  RefreshSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonText,
} from './Loading'
export type { LoadingButtonProps, LoadingCardProps, LoadingOverlayProps, LoadingSpinnerProps } from './Loading'

// Preload
export { PreloadResources, initializeCacheStrategy } from './Preload'
export type { PreloadConfig } from './Preload'

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
