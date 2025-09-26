// Error handling
export { ErrorBoundary, ErrorDisplay, useErrorHandler, withErrorBoundary } from './ErrorBoundary'
export {
  APIErrorFallback,
  AuthErrorFallback,
  DatabaseErrorFallback,
  GenericErrorFallback,
  LoadingFallback,
  NetworkErrorFallback,
  SmartErrorBoundary,
  UIErrorFallback,
  selectErrorFallback,
} from './ErrorFallbacks'
export { GlobalErrorBoundary } from './GlobalErrorBoundary'

// Loading states
export {
  DataLoading,
  LoadingButton,
  LoadingCard,
  LoadingOverlay,
  LoadingSpinner,
  default as LoadingStates,
  PresetLoadings,
  RefreshSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonText,
} from './LoadingStates'

// Auto-retry hooks
export { useApiRetry, default as useAutoRetry, useDataFetchRetry, useUserActionRetry } from '../../hooks/useAutoRetry'

// Unified error handling system
export {
  UnifiedErrorHandler,
  getGlobalErrorStats,
  handleAsyncError,
  handleGlobalError,
  useUnifiedErrorHandler,
} from '../../lib/unified-error-handler'

// Error patterns system
export {
  createErrorToast,
  getDetailedErrorInfo,
  getErrorPattern,
  getRecommendedActions,
  getUserFriendlyMessage,
  isAutoRecoverable,
} from '../../config/error-patterns'

// Providers
export { Providers } from './providers'
