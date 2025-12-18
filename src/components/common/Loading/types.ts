import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  'aria-label'?: string
}

export interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
  spinnerSize?: LoadingSpinnerProps['size']
}

export interface LoadingCardProps {
  title?: string
  message?: string
  className?: string
}

export interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost'
}
