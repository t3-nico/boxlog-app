'use client'

import { useState } from 'react'

import { Check, Eye, EyeOff, X } from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useI18n } from '@/features/i18n/lib/hooks'
import { checkPasswordPwned } from '@/lib/auth/pwned-password'
import { cn } from '@/lib/utils'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'ja'
  const { t } = useI18n(locale as 'en' | 'ja')
  const signUp = useAuthStore((state) => state.signUp)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minPasswordLength = 8
  const isPasswordValid = password.length >= minPasswordLength
  const isPasswordMatching = confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // パスワード確認
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'))
      setIsLoading(false)
      return
    }

    // パスワード長さチェック
    if (password.length < minPasswordLength) {
      setError(t('auth.errors.weakPassword'))
      setIsLoading(false)
      return
    }

    // 漏洩パスワードチェック（Have I Been Pwned API）
    const isPwned = await checkPasswordPwned(password)
    if (isPwned) {
      setError(t('auth.errors.pwnedPassword'))
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push(`/${locale}/calendar`)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('auth.signupForm.createAccount')}</h1>
                <p className="text-muted-foreground text-sm text-balance">{t('auth.signupForm.enterEmail')}</p>
              </div>

              {error && (
                <div className="text-destructive text-center text-sm" role="alert">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">{t('auth.signupForm.email')}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signupForm.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <FieldDescription>{t('auth.signupForm.emailDescription')}</FieldDescription>
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">{t('auth.signupForm.password')}</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={8}
                        maxLength={64}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
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
                    <FieldLabel htmlFor="confirm-password">{t('auth.signupForm.confirmPassword')}</FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={8}
                        maxLength={64}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
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
                </Field>

                {/* パスワードバリデーション */}
                <div className="grid grid-cols-2 gap-4">
                  {password && (
                    <div className="flex items-center gap-2 text-sm">
                      {isPasswordValid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="text-muted-foreground h-4 w-4" />
                      )}
                      <span className={cn(isPasswordValid ? 'text-green-600' : 'text-muted-foreground')}>
                        {password.length} / {minPasswordLength}
                        {t('auth.passwordStrength.minCharacters')}
                      </span>
                    </div>
                  )}
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-sm">
                      {isPasswordMatching ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="text-muted-foreground h-4 w-4" />
                      )}
                      <span className={cn(isPasswordMatching ? 'text-green-600' : 'text-muted-foreground')}>
                        {isPasswordMatching
                          ? t('auth.signupForm.passwordMatch')
                          : t('auth.signupForm.passwordMismatch')}
                      </span>
                    </div>
                  )}
                </div>

                <FieldDescription>{t('auth.signupForm.passwordRequirement')}</FieldDescription>
              </Field>

              {/* 利用規約とプライバシーポリシーへの同意 */}
              <Field>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    disabled={isLoading}
                    aria-label={t('auth.register.agreeTerms')}
                  />
                  <label htmlFor="agree-terms" className="text-sm leading-relaxed">
                    {t('auth.signupForm.byContinuing')}{' '}
                    <Link href="/legal/terms" target="_blank" className="text-primary hover:underline">
                      {t('auth.signupForm.termsOfService')}
                    </Link>{' '}
                    {t('auth.signupForm.and')}{' '}
                    <Link href="/legal/privacy" target="_blank" className="text-primary hover:underline">
                      {t('auth.signupForm.privacyPolicy')}
                    </Link>
                    に同意します。
                  </label>
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading || !agreedToTerms} className="w-full">
                  {isLoading && <Spinner className="mr-2" />}
                  {t('auth.signupForm.createAccountButton')}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('auth.signupForm.orContinueWith')}
              </FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">{t('auth.signupForm.signupWithApple')}</span>
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">{t('auth.signupForm.signupWithGoogle')}</span>
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">{t('auth.signupForm.signupWithMeta')}</span>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {t('auth.signupForm.alreadyHaveAccount')}{' '}
                <Link href="/auth/login" className="text-primary hover:underline">
                  {t('auth.signupForm.login')}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <NextImage
              src="/placeholder.svg"
              alt="Image"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
