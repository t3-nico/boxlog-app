'use client'

import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const authSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('auth.errors.emailInvalid')),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      }),
    [t]
  )

  type AuthFormData = z.infer<typeof authSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        // サインイン処理
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

        if (signInError) {
          setError(signInError.message)
          return
        }

        // AALレベルをチェック（正しい方法）
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        console.log('Login successful. AAL Data:', aalData)

        if (aalError) {
          console.error('AAL check error:', aalError)
        }

        // currentLevel が aal1 で nextLevel が aal2 の場合、MFA検証が必要
        if (aalData && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
          // MFA検証が必要
          console.log('MFA verification required')
          router.push(`/${locale}/auth/mfa-verify`)
        } else {
          // MFAが不要、または既にaal2の場合は通常通りリダイレクト
          console.log('No MFA required, proceeding to calendar')
          router.refresh()
          router.push(`/${locale}/calendar`)
        }
      } else {
        // サインアップ処理
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          return
        }

        // メール確認画面へリダイレクト
        router.push('/auth/verify-email')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        setError(oauthError.message)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          className={cn(
            'border-border flex w-full items-center justify-center gap-3 rounded-md border',
            'bg-white px-4 py-2 text-sm font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400',
            'shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800',
            'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin('apple')}
          disabled={isLoading}
          className={cn(
            'border-border flex w-full items-center justify-center gap-3 rounded-md border',
            'bg-neutral-950 px-4 py-2 text-sm font-medium text-white',
            'shadow-sm hover:bg-gray-900',
            'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="border-input focus:border-ring focus:ring-ring/50 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none"
            placeholder="you@example.com"
          />
          {errors.email ? <p className="text-destructive mt-1 text-sm">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="border-input focus:border-ring focus:ring-ring/50 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none"
            placeholder="••••••••"
          />
          {errors.password ? <p className="text-destructive mt-1 text-sm">{errors.password.message}</p> : null}
        </div>

        {error != null && (
          <div className="bg-destructive/10 rounded-md p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-ring flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
