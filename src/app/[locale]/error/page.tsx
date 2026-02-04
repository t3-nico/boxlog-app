'use client';

import { useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { AlertCircle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ErrorPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = (searchParams || new URLSearchParams()).get('error');
  const message = (searchParams || new URLSearchParams()).get('message');

  const getErrorMessage = () => {
    if (message) {
      return {
        title: 'Error',
        description: message,
        suggestion: 'Please try again or contact support if the problem persists.',
      };
    }

    switch (error) {
      case 'auth':
        return {
          title: 'Authentication Error',
          description:
            'There was a problem verifying your email or authentication link. The link may have expired or already been used.',
          suggestion: 'Please try logging in again or request a new verification email.',
        };
      case 'verification':
        return {
          title: 'Email Verification Failed',
          description:
            "We couldn't verify your email address. The verification link may be invalid or expired.",
          suggestion:
            'Please check your email for a new verification link or contact support if the problem persists.',
        };
      default:
        return {
          title: 'Something went wrong',
          description: 'An unexpected error occurred while processing your request.',
          suggestion: 'Please try again or contact support if the problem continues.',
        };
    }
  };

  const errorInfo = getErrorMessage();

  const handleGoToLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className={cn('flex w-full max-w-md flex-col gap-8')}>
        <div className="text-center">
          <div className="border-destructive mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2">
            <AlertCircle className="text-destructive h-8 w-8" />
          </div>
          <h2 className="text-foreground mt-6 text-4xl font-bold tracking-tight">
            {errorInfo.title}
          </h2>
          <p className="text-foreground mt-2 text-sm">{errorInfo.description}</p>
          <p className="text-muted-foreground mt-4 text-sm">{errorInfo.suggestion}</p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleGoToLogin}
            className="flex w-full items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Login
          </Button>

          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex w-full items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mt-2 text-xs">
            Need help?{' '}
            <a
              href="mailto:support@boxlog.com"
              className="text-primary hover:text-primary/80 font-normal"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
