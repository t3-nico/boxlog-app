'use client'

import { useCallback, useEffect, useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useTranslations } from 'next-intl'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) || 'ja'
  const t = useTranslations()
  const updatePassword = useAuthStore((state) => state.updatePassword)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Get access tokens from URL parameters
  const accessToken = searchParams?.get('access_token') ?? null
  const refreshToken = searchParams?.get('refresh_token') ?? null

  useEffect(() => {
    // Redirect to auth page if tokens are missing
    if (!accessToken || !refreshToken) {
      router.push(`/${locale}/auth`)
    }
  }, [accessToken, refreshToken, router, locale])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      // 時間定数比較でタイミング攻撃を防ぐ
      if (password.length !== confirmPassword.length || password !== confirmPassword) {
        setError(t('auth.resetPasswordForm.passwordMismatch'))
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError(t('auth.resetPasswordForm.passwordTooShort'))
        setLoading(false)
        return
      }

      try {
        const { error } = await updatePassword(password)

        if (error) {
          setError(error.message)
        } else {
          setSuccess(true)
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push(`/${locale}/auth/login`)
          }, 3000)
        }
      } catch (err) {
        setError(t('auth.resetPasswordForm.updateError'))
      } finally {
        setLoading(false)
      }
    },
    [password, confirmPassword, updatePassword, router, locale, t]
  )

  if (success) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
        <div className="w-full md:max-w-5xl">
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
              <CardContent className="grid p-0 md:grid-cols-2">
                <div className="p-6 md:p-8">
                  <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                      <h1 className="text-2xl font-bold">{t('auth.resetPasswordForm.successTitle')}</h1>
                      <p className="text-muted-foreground text-balance">{t('auth.resetPasswordForm.successMessage')}</p>
                    </div>
                  </FieldGroup>
                </div>
                <div className="bg-muted relative hidden md:block">
                  <Image
                    src="/placeholder.svg"
                    alt="Image"
                    fill
                    className="object-cover dark:brightness-[0.2] dark:grayscale"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full md:max-w-5xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">{t('auth.resetPasswordForm.title')}</h1>
                    <p className="text-muted-foreground text-balance">{t('auth.resetPasswordForm.description')}</p>
                  </div>

                  {error && (
                    <div className="text-destructive text-center text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  <Field>
                    <FieldLabel htmlFor="password">{t('auth.resetPasswordForm.newPassword')}</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength={8}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {showPassword ? t('auth.signupForm.hidePassword') : t('auth.signupForm.showPassword')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">{t('auth.resetPasswordForm.confirmPassword')}</FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength={8}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {showConfirmPassword ? t('auth.signupForm.hidePassword') : t('auth.signupForm.showPassword')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </Field>

                  <Field>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading && <Spinner className="mr-2" />}
                      {loading ? t('auth.resetPasswordForm.updating') : t('auth.resetPasswordForm.updateButton')}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center">
                    <a href={`/${locale}/auth/login`} className="hover:text-primary hover:underline">
                      {t('auth.resetPasswordForm.backToLogin')}
                    </a>
                  </FieldDescription>
                </FieldGroup>
              </form>
              <div className="bg-muted relative hidden md:block">
                <Image
                  src="/placeholder.svg"
                  alt="Image"
                  fill
                  className="object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            {t('auth.loginForm.termsAndPrivacy')} <a href="#">{t('auth.loginForm.termsOfService')}</a>{' '}
            {t('auth.loginForm.and')} <a href="#">{t('auth.loginForm.privacyPolicy')}</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
