'use client'

import { Button } from '@/components/shadcn-ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function ErrorPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorInfo.description}
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            {errorInfo.suggestion}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Login
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="text-center">
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <a
              href="mailto:support@boxlog.com"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 