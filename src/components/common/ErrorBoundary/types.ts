import { ErrorInfo, ReactNode } from 'react'

export interface GlobalErrorBoundaryProps {
  children: ReactNode
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error, errorInfo: ErrorInfo, retryCount: number) => void
  className?: string
}

export interface GlobalErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
  retryCount: number
  isRetrying: boolean
  autoRetryEnabled: boolean
  lastErrorTime: number
}
