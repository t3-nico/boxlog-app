'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Eye, EyeOff, Shield, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthContext } from '@/features/auth'
import { checkLockoutStatus, recordLoginAttempt, resetLoginAttempts } from '@/features/auth/lib/account-lockout'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useRecaptchaV2, useRecaptchaV3 } from '@/lib/recaptcha'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'ja'
  const { t } = useI18n(locale as 'en' | 'ja')
  const { signIn } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutMinutes, setLockoutMinutes] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showCaptchaV2, setShowCaptchaV2] = useState(false)
  const [captchaV2Token, setCaptchaV2Token] = useState<string | null>(null)

  // reCAPTCHA v3フック（3回失敗後から使用）
  const { generateToken: generateV3Token, isReady: isV3Ready } = useRecaptchaV3('login')

  // reCAPTCHA v2フック（ロックアウト解除後に使用）
  const { isReady: isV2Ready, renderWidget: renderV2Widget, execute: executeV2 } = useRecaptchaV2()
  const recaptchaV2ContainerRef = useRef<HTMLDivElement>(null)

  // ロックアウトステータスをチェック
  const checkLockout = useCallback(async () => {
    if (!email) return

    const supabase = createClient()
    const status = await checkLockoutStatus(supabase, email)

    setIsLocked(status.isLocked)
    setLockoutMinutes(status.remainingMinutes)
    setFailedAttempts(status.failedAttempts)

    if (status.isLocked) {
      setError(
        t('auth.errors.accountLocked', {
          minutes: status.remainingMinutes.toString(),
        })
      )
    }

    // ロックアウトが解除されていて、過去に失敗履歴があればCAPTCHA v2を表示
    if (!status.isLocked && status.failedAttempts >= 5) {
      setShowCaptchaV2(true)
    }
  }, [email, t])

  // メールアドレス変更時にロックアウトステータスをチェック
  useEffect(() => {
    if (email && email.includes('@')) {
      checkLockout()
    }
  }, [email, checkLockout])

  // reCAPTCHA v2ウィジェットを初期化（ロックアウト解除後）
  useEffect(() => {
    if (showCaptchaV2 && isV2Ready && recaptchaV2ContainerRef.current) {
      renderV2Widget('recaptcha-v2-container', (token) => {
        setCaptchaV2Token(token)
      })
    }
  }, [showCaptchaV2, isV2Ready, renderV2Widget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // ステップ1: ロックアウトステータスをチェック
      const lockoutStatus = await checkLockoutStatus(supabase, email)

      if (lockoutStatus.isLocked) {
        setIsLocked(true)
        setLockoutMinutes(lockoutStatus.remainingMinutes)
        setError(
          t('auth.errors.accountLocked', {
            minutes: lockoutStatus.remainingMinutes.toString(),
          })
        )
        setIsLoading(false)
        return
      }

      // ステップ2: reCAPTCHA検証（段階的）
      // 2a. ロックアウト解除後 → reCAPTCHA v2必須
      if (showCaptchaV2) {
        if (!captchaV2Token) {
          // v2トークンがない場合、実行を試みる
          executeV2()
          setError(t('auth.errors.captchaRequired'))
          setIsLoading(false)
          return
        }
        // TODO: サーバーサイドでv2トークンを検証（API Route経由）
      }

      // 2b. 3回以上失敗 → reCAPTCHA v3（バックグラウンド）
      if (lockoutStatus.failedAttempts >= 3 && isV3Ready) {
        const v3Token = await generateV3Token()
        if (v3Token) {
          // TODO: サーバーサイドでv3スコアを検証（API Route経由）
          console.log('[reCAPTCHA] v3 token generated for verification')
        }
      }

      // ステップ3: ログイン試行
      const { error, data } = await signIn(email, password)

      if (error) {
        // ログイン失敗を記録
        await recordLoginAttempt(supabase, email, false)

        // 新しいロックアウトステータスを取得
        const newStatus = await checkLockoutStatus(supabase, email)
        setFailedAttempts(newStatus.failedAttempts)

        if (newStatus.isLocked) {
          setIsLocked(true)
          setLockoutMinutes(newStatus.remainingMinutes)
          setError(
            t('auth.errors.accountLocked', {
              minutes: newStatus.remainingMinutes.toString(),
            })
          )
        } else {
          setError(error.message)
        }
      } else if (data) {
        // ログイン成功を記録してカウンターリセット
        await resetLoginAttempts(supabase, email)
        setFailedAttempts(0)

        // MFAが有効かチェック（AALレベルで判断）
        // セッション確立を待つ
        await new Promise((resolve) => setTimeout(resolve, 100))

        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        console.log('Login - AAL check:', aalData)

        // currentLevel が aal1 で nextLevel が aal2 の場合、MFAが必要
        if (aalData?.currentLevel === 'aal1' && aalData?.nextLevel === 'aal2') {
          // MFAが有効な場合、MFA検証ページへリダイレクト
          console.log('MFA required, redirecting to mfa-verify')
          router.push(`/${locale}/auth/mfa-verify`)
        } else {
          // MFAが無効な場合、直接カレンダーへ
          console.log('No MFA required, redirecting to calendar')
          router.push(`/${locale}/calendar`)
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')

      // エラーでも失敗として記録
      await recordLoginAttempt(supabase, email, false)
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
                <h1 className="text-2xl font-bold">{t('auth.loginForm.welcomeBack')}</h1>
                <p className="text-muted-foreground text-balance">{t('auth.loginForm.loginToAccount')}</p>
              </div>

              {isLocked && (
                <div className="bg-destructive/10 border-destructive/50 text-destructive flex items-start gap-3 rounded-md border p-4">
                  <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{t('auth.errors.accountLockedTitle')}</p>
                    <p className="text-sm">
                      {t('auth.errors.accountLocked', {
                        minutes: lockoutMinutes.toString(),
                      })}
                    </p>
                    {failedAttempts > 0 && (
                      <p className="text-xs opacity-80">
                        {t('auth.errors.failedAttempts', {
                          count: failedAttempts.toString(),
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && !isLocked && (
                <div className="text-destructive text-center text-sm" role="alert">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">{t('auth.loginForm.email')}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.loginForm.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t('auth.loginForm.password')}</FieldLabel>
                  <a href="/auth/password" className="ml-auto text-sm underline-offset-2 hover:underline">
                    {t('auth.loginForm.forgotPassword')}
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
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
                      {showPassword ? t('auth.loginForm.hidePassword') : t('auth.loginForm.showPassword')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Field>

              {/* reCAPTCHA v3保護インジケーター（3回以上失敗時） */}
              {failedAttempts >= 3 && !isLocked && !showCaptchaV2 && (
                <div className="bg-primary/10 border-primary/20 text-primary flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  <span>{t('auth.info.captchaProtectionActive')}</span>
                </div>
              )}

              {/* reCAPTCHA v2コンテナ（ロックアウト解除後） */}
              {showCaptchaV2 && (
                <div className="flex flex-col items-center gap-2">
                  <div id="recaptcha-v2-container" ref={recaptchaV2ContainerRef} />
                  <p className="text-muted-foreground text-center text-xs">{t('auth.info.captchaV2Required')}</p>
                </div>
              )}

              <Field>
                <Button
                  type="submit"
                  disabled={isLoading || isLocked || (showCaptchaV2 && !captchaV2Token)}
                  className="w-full"
                >
                  {isLoading && <Spinner className="mr-2" />}
                  {t('auth.loginForm.loginButton')}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('auth.loginForm.orContinueWith')}
              </FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">{t('auth.loginForm.loginWithApple')}</span>
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">{t('auth.loginForm.loginWithGoogle')}</span>
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">{t('auth.loginForm.loginWithMeta')}</span>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {t('auth.loginForm.noAccount')} <a href="/auth/signup">{t('auth.loginForm.signUp')}</a>
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
  )
}
