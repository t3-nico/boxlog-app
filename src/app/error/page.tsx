'use client'

import { useCallback } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { AlertCircle, Home, RefreshCw } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { colors, typography, spacing, layout } from '@/config/theme'

const ErrorPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const getErrorMessage = () => {
    if (message) {
      return {
        title: 'Error',
        description: message,
        suggestion: 'Please try again or contact support if the problem persists.'
      }
    }

    switch (error) {
      case 'auth':
        return {
          title: 'Authentication Error',
          description: 'There was a problem verifying your email or authentication link. The link may have expired or already been used.',
          suggestion: 'Please try logging in again or request a new verification email.'
        }
      case 'verification':
        return {
          title: 'Email Verification Failed',
          description: 'We couldn\'t verify your email address. The verification link may be invalid or expired.',
          suggestion: 'Please check your email for a new verification link or contact support if the problem persists.'
        }
      default:
        return {
          title: 'Something went wrong',
          description: 'An unexpected error occurred while processing your request.',
          suggestion: 'Please try again or contact support if the problem continues.'
        }
    }
  }

  const errorInfo = getErrorMessage()

  const handleGoToLogin = useCallback(() => {
    router.push('/auth/login')
  }, [router])

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

  return (
    <div className={`min-h-screen flex items-center justify-center ${colors.background.base} ${spacing.page.default}`}>
      <div className={`${layout.container.small} w-full ${spacing.stack.xl}`}>
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center ${layout.heights.header.large} w-16 rounded-full ${colors.semantic.error.background}`}>
            <AlertCircle className={`${layout.heights.header.xs} w-8 ${colors.semantic.error.DEFAULT}`} />
          </div>
          <h2 className={`mt-6 ${typography.heading.h1} ${colors.text.primary}`}>
            {errorInfo.title}
          </h2>
          <p className={`mt-2 ${typography.body.sm} ${colors.text.secondary}`}>
            {errorInfo.description}
          </p>
          <p className={`mt-4 ${typography.body.sm} ${colors.text.tertiary}`}>
            {errorInfo.suggestion}
          </p>
        </div>

        <div className={`mt-8 ${spacing.stack.md}`}>
          <Button
            onClick={handleGoToLogin}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className={`${layout.heights.button.sm} w-4`} />
            Go to Login
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className={`${layout.heights.button.sm} w-4`} />
            Go Back
          </Button>
        </div>

        <div className="text-center">
          <p className={`mt-2 ${typography.body.xs} ${colors.text.tertiary}`}>
            Need help?{' '}
            <a
              href="mailto:support@boxlog.com"
              className={`${typography.body.medium} ${colors.primary.DEFAULT} hover:${colors.primary.hover}`}
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage 