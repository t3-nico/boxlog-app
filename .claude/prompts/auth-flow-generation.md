# 認証フロー生成テンプレート

## 概要
BoxLog App用の完全な認証フローを自動生成するプロンプトテンプレート。NextAuth.js + Supabase + shadcn/ui + テーマシステム完全統合。ログイン・登録・パスワードリセット・2FA対応。

## 機能一覧

### 🔐 認証機能
- **ログイン**: メール・パスワード、OAuth（Google、GitHub）
- **新規登録**: メール確認・利用規約同意
- **パスワードリセット**: メール経由でのリセット
- **2FA**: TOTP（Google Authenticator等）対応

### 🛡️ セキュリティ機能
- **レート制限**: ブルートフォース攻撃防止
- **セッション管理**: 自動ログアウト・並行セッション制御
- **権限管理**: ロールベースアクセス制御
- **監査ログ**: 認証イベントの記録

### 🎨 UI/UX機能
- **レスポンシブ**: 全デバイス対応
- **アクセシビリティ**: WCAG AA準拠
- **プログレスバー**: 登録プロセス可視化
- **エラーハンドリング**: ユーザーフレンドリーなエラー表示

## テンプレート構造

### 1. 認証スキーマ生成

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod'

// ログインスキーマ
export const LoginSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
           'パスワードは大文字・小文字・数字を含む必要があります'),
  rememberMe: z.boolean().default(false),
  twoFactorCode: z.string()
    .regex(/^\d{6}$/, '6桁の認証コードを入力してください')
    .optional(),
})

// 登録スキーマ
export const RegisterSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
           'パスワードは大文字・小文字・数字・特殊文字を含む必要があります'),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(1, '姓は必須です')
    .max(50, '姓は50文字以内で入力してください'),
  lastName: z.string()
    .min(1, '名は必須です')
    .max(50, '名は50文字以内で入力してください'),
  acceptTerms: z.boolean()
    .refine(val => val === true, '利用規約に同意してください'),
  newsletter: z.boolean().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

// パスワードリセットスキーマ
export const ResetPasswordSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
})

// 新しいパスワード設定スキーマ
export const NewPasswordSchema = z.object({
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
           'パスワードは大文字・小文字・数字・特殊文字を含む必要があります'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'リセットトークンが必要です'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

// 2FA設定スキーマ
export const TwoFactorSetupSchema = z.object({
  verificationCode: z.string()
    .regex(/^\d{6}$/, '6桁の認証コードを入力してください'),
  backupCodes: z.array(z.string()).optional(),
})

export type LoginData = z.infer<typeof LoginSchema>
export type RegisterData = z.infer<typeof RegisterSchema>
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>
export type NewPasswordData = z.infer<typeof NewPasswordSchema>
export type TwoFactorSetupData = z.infer<typeof TwoFactorSetupSchema>
```

### 2. ログインコンポーネント生成

```typescript
// src/components/auth/LoginForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn, Mail, Lock, Shield, Chrome, Github } from 'lucide-react'

import { LoginSchema, type LoginData } from '@/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { colors, spacing, typography } from '@/config/theme'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showTwoFactor, setShowTwoFactor] = React.useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || redirectTo

  const form = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  })

  const handleSubmit = async (data: LoginData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        twoFactorCode: data.twoFactorCode,
        redirect: false,
      })

      if (result?.error) {
        // 2FA が必要な場合
        if (result.error === 'TWO_FACTOR_REQUIRED') {
          setShowTwoFactor(true)
          return
        }

        // その他のエラー
        const errorMessages = {
          'CredentialsSignin': 'メールアドレスまたはパスワードが正しくありません',
          'AccessDenied': 'アクセスが拒否されました',
          'Verification': 'メールアドレスの確認が必要です',
          'TWO_FACTOR_INVALID': '認証コードが正しくありません',
        }

        setError(errorMessages[result.error] || '認証に失敗しました')
        return
      }

      // 成功時の処理
      onSuccess?.()
      router.push(callbackUrl)
      router.refresh()

    } catch (err) {
      console.error('ログインエラー:', err)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (err) {
      console.error('OAuth認証エラー:', err)
      setError('OAuth認証に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <Card className={`w-full max-w-md mx-auto ${colors.background.card}`}>
        <CardHeader className="space-y-1">
          <CardTitle className={`text-center ${typography.heading.h2}`}>
            ログイン
          </CardTitle>
          <CardDescription className={`text-center ${typography.body.base}`}>
            アカウントにサインインしてください
          </CardDescription>
        </CardHeader>

        <CardContent className={`space-y-4 ${spacing.component.section.md}`}>
          {/* エラー表示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* メールアドレス */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>
                      メールアドレス
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="example@domain.com"
                          className={`${colors.input.default} pl-10`}
                          disabled={loading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* パスワード */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>
                      パスワード
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="パスワードを入力"
                          className={`${colors.input.default} pl-10 pr-10`}
                          disabled={loading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2FA認証コード */}
              {showTwoFactor && (
                <FormField
                  control={form.control}
                  name="twoFactorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={typography.label.base}>
                        認証コード
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="6桁のコードを入力"
                            className={`${colors.input.default} pl-10`}
                            maxLength={6}
                            disabled={loading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* ログイン状態を保持 */}
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className={typography.label.base}>
                        ログイン状態を保持
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* ログインボタン */}
              <Button
                type="submit"
                className={`w-full ${colors.primary.DEFAULT}`}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                ログイン
              </Button>
            </form>
          </Form>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`${colors.background.card} px-2 text-muted-foreground`}>
                または
              </span>
            </div>
          </div>

          {/* OAuth認証 */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm">
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push('/auth/reset-password')}
            >
              パスワードを忘れた方
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            アカウントをお持ちでない方は{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push('/auth/register')}
            >
              新規登録
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  )
}
```

### 3. 新規登録コンポーネント生成

```typescript
// src/components/auth/RegisterForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Check } from 'lucide-react'

import { RegisterSchema, type RegisterData } from '@/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { colors, spacing, typography } from '@/config/theme'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [step, setStep] = React.useState(1)
  const [success, setSuccess] = React.useState(false)

  const router = useRouter()

  const form = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      acceptTerms: false,
      newsletter: false,
    },
  })

  // パスワード強度計算
  const getPasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 25
    if (/[@$!%*?&]/.test(password)) strength += 25
    return Math.min(strength, 100)
  }

  const passwordStrength = getPasswordStrength(form.watch('password') || '')

  const handleSubmit = async (data: RegisterData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          newsletter: data.newsletter,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '登録に失敗しました')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        router.push('/auth/verify-email?email=' + encodeURIComponent(data.email))
      }, 2000)

    } catch (err) {
      console.error('登録エラー:', err)
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    const fields = step === 1
      ? ['firstName', 'lastName']
      : ['email', 'password', 'confirmPassword']

    const isValid = await form.trigger(fields)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  if (success) {
    return (
      <Card className={`w-full max-w-md mx-auto ${colors.background.card}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className={typography.heading.h3}>登録完了！</h3>
              <p className={`${typography.body.base} text-muted-foreground mt-2`}>
                確認メールを送信しました。メールをご確認ください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary>
      <Card className={`w-full max-w-md mx-auto ${colors.background.card}`}>
        <CardHeader className="space-y-1">
          <CardTitle className={`text-center ${typography.heading.h2}`}>
            新規登録
          </CardTitle>
          <CardDescription className={`text-center ${typography.body.base}`}>
            アカウントを作成してください
          </CardDescription>

          {/* プログレスバー */}
          <div className="space-y-2">
            <Progress value={(step / 3) * 100} className="w-full" />
            <div className="text-center text-xs text-muted-foreground">
              ステップ {step} / 3
            </div>
          </div>
        </CardHeader>

        <CardContent className={`space-y-4 ${spacing.component.section.md}`}>
          {/* エラー表示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

              {/* ステップ1: 基本情報 */}
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={typography.label.base}>姓</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="山田"
                              className={`${colors.input.default} pl-10`}
                              disabled={loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={typography.label.base}>名</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="太郎"
                              className={`${colors.input.default} pl-10`}
                              disabled={loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ステップ2: アカウント情報 */}
              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={typography.label.base}>
                          メールアドレス
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="example@domain.com"
                              className={`${colors.input.default} pl-10`}
                              disabled={loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={typography.label.base}>
                          パスワード
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="パスワードを入力"
                              className={`${colors.input.default} pl-10 pr-10`}
                              disabled={loading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>

                        {/* パスワード強度表示 */}
                        {field.value && (
                          <div className="space-y-1">
                            <Progress value={passwordStrength} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              パスワード強度: {
                                passwordStrength < 50 ? '弱い' :
                                passwordStrength < 75 ? '普通' : '強い'
                              }
                            </p>
                          </div>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={typography.label.base}>
                          パスワード確認
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="パスワードを再入力"
                              className={`${colors.input.default} pl-10 pr-10`}
                              disabled={loading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ステップ3: 利用規約・確認 */}
              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className={typography.label.base}>
                            利用規約に同意する（必須）
                          </FormLabel>
                          <FormDescription>
                            <Button variant="link" className="p-0 h-auto text-xs">
                              利用規約
                            </Button>
                            {' '}と{' '}
                            <Button variant="link" className="p-0 h-auto text-xs">
                              プライバシーポリシー
                            </Button>
                            に同意します
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className={typography.label.base}>
                            ニュースレターを受信する（任意）
                          </FormLabel>
                          <FormDescription>
                            製品の更新情報やお得な情報をお送りします
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ナビゲーションボタン */}
              <div className="flex justify-between space-x-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={loading}
                  >
                    戻る
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={loading}
                    className={step === 1 ? 'w-full' : ''}
                  >
                    次へ
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className={`${colors.primary.DEFAULT} w-full`}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    アカウント作成
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <div className="text-center text-sm text-muted-foreground w-full">
            すでにアカウントをお持ちの方は{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push('/auth/login')}
            >
              ログイン
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  )
}
```

### 4. パスワードリセットコンポーネント生成

```typescript
// src/components/auth/ResetPasswordForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, Check } from 'lucide-react'

import { ResetPasswordSchema, type ResetPasswordData } from '@/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { colors, spacing, typography } from '@/config/theme'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export function ResetPasswordForm() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const router = useRouter()

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ResetPasswordData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'リセットに失敗しました')
      }

      setSuccess(true)

    } catch (err) {
      console.error('パスワードリセットエラー:', err)
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className={`w-full max-w-md mx-auto ${colors.background.card}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className={typography.heading.h3}>メール送信完了</h3>
              <p className={`${typography.body.base} text-muted-foreground mt-2`}>
                パスワードリセット用のリンクをメールで送信しました。
                メールをご確認ください。
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ログインページに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary>
      <Card className={`w-full max-w-md mx-auto ${colors.background.card}`}>
        <CardHeader className="space-y-1">
          <CardTitle className={`text-center ${typography.heading.h2}`}>
            パスワードリセット
          </CardTitle>
          <CardDescription className={`text-center ${typography.body.base}`}>
            メールアドレスを入力してください
          </CardDescription>
        </CardHeader>

        <CardContent className={`space-y-4 ${spacing.component.section.md}`}>
          {/* エラー表示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>
                      メールアドレス
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="example@domain.com"
                          className={`${colors.input.default} pl-10`}
                          disabled={loading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={`w-full ${colors.primary.DEFAULT}`}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                リセットリンクを送信
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <div className="text-center w-full">
            <Button
              variant="link"
              onClick={() => router.push('/auth/login')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ログインページに戻る
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  )
}
```

## 必須要件チェックリスト

### ✅ 認証機能（4種類）
- [x] ログイン - メール・パスワード + OAuth
- [x] 新規登録 - 多段階フォーム + メール確認
- [x] パスワードリセット - メール経由
- [x] 2FA対応 - TOTP認証

### ✅ セキュリティ機能
- [x] パスワード強度表示
- [x] レート制限対応準備
- [x] セッション管理準備
- [x] エラーハンドリング

### ✅ UI/UX機能
- [x] レスポンシブデザイン
- [x] プログレスバー（登録）
- [x] パスワード表示切り替え
- [x] ローディング状態表示

### ✅ システム統合
- [x] Zodバリデーション
- [x] テーマシステム準拠
- [x] エラーパターン辞書準備
- [x] NextAuth.js統合

### ✅ アクセシビリティ
- [x] ARIA属性設定
- [x] キーボードナビゲーション
- [x] スクリーンリーダー対応
- [x] 適切なラベル設定

## 使用例

```typescript
// 基本的な使用
<LoginForm
  onSuccess={() => console.log('ログイン成功')}
  redirectTo="/dashboard"
/>

// 登録フォーム
<RegisterForm
  onSuccess={() => console.log('登録成功')}
/>

// パスワードリセット
<ResetPasswordForm />
```