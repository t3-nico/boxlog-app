import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSupportText,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { HoverTooltip } from '@/components/ui/tooltip';

/**
 * 認証フォーム一覧（LoginForm / SignupForm / PasswordResetForm）
 *
 * 実コンポーネントは Supabase / useAuthStore / next-intl 等に依存するため、
 * Storybook では実 shadcn/ui コンポーネントを使ったビジュアルモックで表示。
 */
const meta = {
  title: 'Features/Auth/AuthForm',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Shared parts
// ---------------------------------------------------------------------------

function SocialButtons({ disabled = false }: { disabled?: boolean }) {
  return (
    <Field className="grid grid-cols-3 gap-4">
      <Button variant="outline" type="button" disabled={disabled}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Appleでログイン</span>
      </Button>
      <Button variant="outline" type="button" disabled={disabled}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Googleでログイン</span>
      </Button>
      <Button variant="outline" type="button" disabled={disabled}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-8.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Metaでログイン</span>
      </Button>
    </Field>
  );
}

function DecoPanel() {
  return (
    <div className="bg-muted relative hidden md:block">
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">装飾エリア</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock: LoginForm
// ---------------------------------------------------------------------------

function MockLoginForm({ serverError }: { serverError?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-[800px] flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">おかえりなさい</h1>
                <p className="text-muted-foreground text-balance">アカウントにログイン</p>
              </div>

              {serverError && (
                <FieldError announceImmediately className="text-center">
                  {serverError}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="login-email" required requiredLabel="必須">
                  メールアドレス
                </FieldLabel>
                <FieldSupportText id="login-email-support">例: m@example.com</FieldSupportText>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-describedby="login-email-support"
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="login-password" required requiredLabel="必須">
                    パスワード
                  </FieldLabel>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground ml-auto text-sm underline underline-offset-4"
                  >
                    パスワードをお忘れですか？
                  </a>
                </div>
                <FieldSupportText id="login-password-support">
                  登録したパスワードを入力
                </FieldSupportText>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-describedby="login-password-support"
                  />
                  <HoverTooltip
                    content={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    side="top"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      icon
                      className="absolute top-0 right-0 h-full px-4"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </HoverTooltip>
                </div>
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  ログイン
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                または続けて
              </FieldSeparator>

              <SocialButtons />

              <FieldDescription className="text-center">
                アカウントをお持ちでない方は <a href="#">新規登録</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <DecoPanel />
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        続けることで、<a href="#">利用規約</a>と<a href="#">プライバシーポリシー</a>
        に同意したものとみなされます。
      </FieldDescription>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock: SignupForm
// ---------------------------------------------------------------------------

function MockSignupForm({ serverError }: { serverError?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex w-[800px] flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">アカウントを作成</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  メールアドレスを入力してアカウントを作成
                </p>
              </div>

              {serverError && (
                <FieldError announceImmediately className="text-center">
                  {serverError}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="signup-email" required requiredLabel="必須">
                  メールアドレス
                </FieldLabel>
                <FieldSupportText id="signup-email-support">例: m@example.com</FieldSupportText>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-describedby="signup-email-support"
                />
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="signup-password" required requiredLabel="必須">
                      パスワード
                    </FieldLabel>
                    <FieldSupportText id="signup-password-support">
                      8文字以上で入力してください
                    </FieldSupportText>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-describedby="signup-password-support"
                      />
                      <HoverTooltip
                        content={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                        side="top"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          icon
                          className="absolute top-0 right-0 h-full px-4"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </HoverTooltip>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="signup-confirm" required requiredLabel="必須">
                      パスワード確認
                    </FieldLabel>
                    <FieldSupportText id="signup-confirm-support">
                      左と同じパスワードを入力
                    </FieldSupportText>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-describedby="signup-confirm-support"
                      />
                      <HoverTooltip
                        content={showConfirm ? 'パスワードを隠す' : 'パスワードを表示'}
                        side="top"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          icon
                          className="absolute top-0 right-0 h-full px-4"
                          onClick={() => setShowConfirm(!showConfirm)}
                          aria-label={showConfirm ? 'パスワードを隠す' : 'パスワードを表示'}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </HoverTooltip>
                    </div>
                  </Field>
                </Field>
              </Field>

              <Field>
                <div className="flex items-start gap-4">
                  <Checkbox
                    id="agree-terms-mock"
                    className="mt-1"
                    aria-label="利用規約とプライバシーポリシーに同意する"
                  />
                  <label htmlFor="agree-terms-mock" className="text-sm leading-relaxed">
                    続けることで、<a href="#">利用規約</a>と<a href="#">プライバシーポリシー</a>
                    に同意します。
                  </label>
                </div>
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  アカウント作成
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                または続けて
              </FieldSeparator>

              <SocialButtons />

              <FieldDescription className="text-center">
                既にアカウントをお持ちですか？ <a href="#">ログイン</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <DecoPanel />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock: PasswordResetForm
// ---------------------------------------------------------------------------

function MockPasswordResetForm() {
  return (
    <div className="flex w-[800px] flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">パスワードをリセット</h1>
                <p className="text-muted-foreground text-balance">
                  メールアドレスを入力してください。リセット用のリンクを送信します。
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="reset-email" required requiredLabel="必須">
                  メールアドレス
                </FieldLabel>
                <FieldSupportText id="reset-email-support">
                  登録したメールアドレスを入力
                </FieldSupportText>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-describedby="reset-email-support"
                />
              </Field>

              <Field>
                <Button type="submit">リセット用リンクを送信</Button>
              </Field>

              <FieldDescription className="text-center">
                パスワードを思い出しましたか？ <a href="#">ログイン</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <DecoPanel />
        </CardContent>
      </Card>
    </div>
  );
}

function MockPasswordResetSuccess() {
  return (
    <div className="flex w-[800px] flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">メールを確認してください</h1>
                <p className="text-muted-foreground text-balance">
                  パスワードリセット用のリンクを送信しました：{' '}
                  <span className="font-normal">user@example.com</span>
                </p>
              </div>
              <Field>
                <Button asChild>
                  <a href="#">ログインに戻る</a>
                </Button>
              </Field>
            </FieldGroup>
          </div>
          <DecoPanel />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock: MfaVerifyForm
// ---------------------------------------------------------------------------

function MockMfaVerifyForm({ serverError }: { serverError?: string }) {
  return (
    <div className="flex w-[800px] flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">2段階認証</h1>
                <p className="text-muted-foreground text-balance">
                  認証アプリの6桁のコードを入力してください
                </p>
              </div>

              {serverError && (
                <FieldError announceImmediately className="text-center">
                  {serverError}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="mfa-code" required requiredLabel="必須">
                  認証コード
                </FieldLabel>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  className="text-center text-lg tracking-widest"
                />
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  認証
                </Button>
              </Field>

              <div className="flex flex-col items-center gap-2 text-sm">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  デバイスにアクセスできませんか？
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  リカバリーコードを使用
                </a>
              </div>

              <FieldDescription className="text-center">
                <a href="#">ログインに戻る</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <DecoPanel />
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        続けることで、<a href="#">利用規約</a>と<a href="#">プライバシーポリシー</a>
        に同意したものとみなされます。
      </FieldDescription>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** セキュリティ監査スコアと実装要件の一覧。 */
export const SecurityOverview: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h2 className="text-foreground text-lg font-bold">セキュリティ監査スコア: 8.5 / 10</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          OWASP Authentication Cheat Sheet + NIST SP 800-63B 準拠。
        </p>
      </div>

      <div className="bg-card border-border rounded-xl border p-6">
        <h3 className="mb-4 text-base font-bold">実装済みセキュリティ要件</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="py-3 pr-4 text-left font-bold">カテゴリ</th>
                <th className="py-3 pr-4 text-left font-bold">対策</th>
                <th className="py-3 text-left font-bold">実装箇所</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">エラーメッセージ</td>
                <td className="py-3 pr-4">
                  Supabase 生エラーを i18n
                  キーにサニタイズ。ログインは常に「メールアドレスまたはパスワードが正しくありません」を返し、ユーザー列挙攻撃を防止
                </td>
                <td className="py-3 font-mono text-xs">
                  sanitize-auth-error.ts → LoginForm / SignupForm / useAuthStore
                </td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">パスワードポリシー</td>
                <td className="py-3 pr-4">
                  8文字以上64文字以内。NIST SP 800-63B
                  準拠で構成ルール（大文字/数字等）は非推奨のため課さない。漏洩チェック（HaveIBeenPwned）で実効性を担保
                </td>
                <td className="py-3 font-mono text-xs">auth.schema.ts (passwordSchema)</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">漏洩パスワード検出</td>
                <td className="py-3 pr-4">
                  Have I Been Pwned API（k-Anonymity モデル）でサインアップ時にチェック。API
                  障害時はスキップ（グレースフルデグラデーション）
                </td>
                <td className="py-3 font-mono text-xs">pwned-password.ts → SignupForm</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">セッション管理</td>
                <td className="py-3 pr-4">15分アイドルタイムアウト + アクティビティ追跡</td>
                <td className="py-3 font-mono text-xs">useSessionMonitor.ts</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">レートリミット</td>
                <td className="py-3 pr-4">
                  IP ベースのプログレッシブブロッキング（5回失敗で15分ロック）
                </td>
                <td className="py-3 font-mono text-xs">ip-rate-limit.ts</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">監査ログ</td>
                <td className="py-3 pr-4">ログイン成功/失敗、パスワード変更等の全イベントを記録</td>
                <td className="py-3 font-mono text-xs">audit-log.ts</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">MFA 対応</td>
                <td className="py-3 pr-4">
                  TOTP ベースの2段階認証。MFA チェック失敗時もバイパスさせない
                </td>
                <td className="py-3 font-mono text-xs">LoginForm.tsx (MFA redirect)</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3 pr-4 font-medium">OAuth</td>
                <td className="py-3 pr-4">
                  Google / Apple / Meta。コールバック URL はオリジン固定
                </td>
                <td className="py-3 font-mono text-xs">useAuthStore.ts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border-border rounded-xl border p-6">
        <h3 className="mb-4 text-base font-bold">残課題（10点への道）</h3>
        <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
          <li>
            パスワード強度メーター UI（
            <code className="text-foreground text-xs">PasswordStrengthIndicator</code>{' '}
            コンポーネント未実装）
          </li>
          <li>CAPTCHA 統合（reCAPTCHA v3 スコアベース → v2 フォールバック）</li>
          <li>アカウントロックアウト通知メール</li>
        </ul>
      </div>
    </div>
  ),
};

/** ログインフォーム。2カラムカード型レイアウト。実装: LoginForm.tsx */
export const Login: Story = {
  render: () => <MockLoginForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // メールアドレス入力
    const emailInput = canvas.getByLabelText(/メールアドレス/i);
    await userEvent.type(emailInput, 'test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    // パスワード入力（selector: 'input' でトグルボタンのaria-labelを除外）
    const passwordInput = canvas.getByLabelText(/パスワード/i, { selector: 'input' });
    await userEvent.type(passwordInput, 'password123');
    await expect(passwordInput).toHaveValue('password123');

    // パスワード表示トグル
    const toggleButton = canvas.getByRole('button', { name: /パスワードを表示/i });
    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // パスワード非表示に戻す
    const hideButton = canvas.getByRole('button', { name: /パスワードを隠す/i });
    await userEvent.click(hideButton);
    await expect(passwordInput).toHaveAttribute('type', 'password');
  },
};

/** ログインフォーム（サーバーエラー表示）。実装: LoginForm.tsx */
export const LoginWithError: Story = {
  render: () => <MockLoginForm serverError="メールアドレスまたはパスワードが正しくありません" />,
};

/** サインアップフォーム。パスワード確認 + 利用規約同意。実装: SignupForm.tsx */
export const Signup: Story = {
  render: () => <MockSignupForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // メールアドレス入力
    const emailInput = canvas.getByLabelText(/メールアドレス/i);
    await userEvent.type(emailInput, 'signup@example.com');
    await expect(emailInput).toHaveValue('signup@example.com');

    // パスワード入力（selector: 'input' でトグルボタンのaria-labelを除外）
    const passwordInput = canvas.getByLabelText(/^パスワード(?!確認)/i, { selector: 'input' });
    await userEvent.type(passwordInput, 'securePass1');
    await expect(passwordInput).toHaveValue('securePass1');

    // パスワード確認入力
    const confirmInput = canvas.getByLabelText(/パスワード確認/i, { selector: 'input' });
    await userEvent.type(confirmInput, 'securePass1');
    await expect(confirmInput).toHaveValue('securePass1');

    // 利用規約チェックボックスをクリック
    const termsCheckbox = canvas.getByRole('checkbox', {
      name: /利用規約とプライバシーポリシーに同意する/i,
    });
    await userEvent.click(termsCheckbox);
    await expect(termsCheckbox).toBeChecked();
  },
};

/** サインアップフォーム（漏洩パスワードエラー）。実装: SignupForm.tsx */
export const SignupWithError: Story = {
  render: () => (
    <MockSignupForm serverError="このパスワードは過去に漏洩しています。より安全なパスワードを使用してください。" />
  ),
};

/** 2段階認証（MFA）コード入力画面。ログイン後に MFA が必要な場合に表示。 */
export const MfaVerify: Story = {
  render: () => <MockMfaVerifyForm />,
};

/** 2段階認証（MFA）エラー表示。コードが無効な場合。 */
export const MfaVerifyWithError: Story = {
  render: () => (
    <MockMfaVerifyForm serverError="認証コードが正しくありません。再度入力してください。" />
  ),
};

/** パスワードリセットフォーム。実装: PasswordResetForm.tsx */
export const PasswordReset: Story = {
  render: () => <MockPasswordResetForm />,
};

/** パスワードリセット成功画面。実装: PasswordResetForm.tsx */
export const PasswordResetSuccess: Story = {
  render: () => <MockPasswordResetSuccess />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">ログイン</h3>
        <MockLoginForm />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">ログイン（エラー）</h3>
        <MockLoginForm serverError="メールアドレスまたはパスワードが正しくありません" />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">サインアップ</h3>
        <MockSignupForm />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">2段階認証（MFA）</h3>
        <MockMfaVerifyForm />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">パスワードリセット</h3>
        <MockPasswordResetForm />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">パスワードリセット（送信完了）</h3>
        <MockPasswordResetSuccess />
      </div>
    </div>
  ),
};
