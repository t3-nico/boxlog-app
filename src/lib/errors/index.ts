/**
 * Error Utilities - Public API
 */

export { getApiErrorMessage, getErrorMessage, normalizeError } from './get-error-message'
export {
  formatErrorResponse,
  hideInternalDetails,
  logSecureError,
  removeFilePaths,
  removeStackTrace,
  sanitizeDatabaseError,
  sanitizeError,
  type SecureErrorResponse,
} from './secure-error-handler'
