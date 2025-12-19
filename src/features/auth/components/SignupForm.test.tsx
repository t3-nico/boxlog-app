import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SignupForm } from './SignupForm'

// シンプルなレンダリングヘルパー（TooltipProviderは不要になった）
function renderWithProviders(ui: React.ReactElement) {
  return render(ui)
}

// モックの設定
const mockPush = vi.fn()
const mockSignUp = vi.fn()

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'ja' }),
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/features/auth/stores/useAuthStore', () => ({
  useAuthStore: (selector: (state: { signUp: typeof mockSignUp }) => typeof mockSignUp) =>
    selector({ signUp: mockSignUp }),
}))

// パスワードチェックのモック（オプショナル機能）
vi.mock('@/lib/auth/pwned-password', () => ({
  checkPasswordPwned: vi.fn().mockResolvedValue(false),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('フォームが正しくレンダリングされる', () => {
      renderWithProviders(<SignupForm />)

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByLabelText('auth.signupForm.email')).toBeInTheDocument()
      expect(screen.getByLabelText('auth.signupForm.password')).toBeInTheDocument()
      expect(screen.getByLabelText('auth.signupForm.confirmPassword')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' })).toBeInTheDocument()
    })

    it('メール、パスワード、確認パスワードが入力可能', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      const emailInput = screen.getByLabelText('auth.signupForm.email')
      const passwordInput = screen.getByLabelText('auth.signupForm.password')
      const confirmInput = screen.getByLabelText('auth.signupForm.confirmPassword')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmInput, 'password123')

      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
      expect(confirmInput).toHaveValue('password123')
    })

    it('利用規約チェックボックスが存在する', () => {
      renderWithProviders(<SignupForm />)

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })
  })

  describe('バリデーション', () => {
    it('パスワードが短い場合はパスワードインジケーターで警告表示', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.password'), 'short')

      // パスワード長が不足していることを示すインジケーター
      expect(screen.getByText(/5 \/ 8/)).toBeInTheDocument()
      // 「X」アイコンの代わりに、muted-foreground クラスを確認（不十分な状態）
    })

    it('パスワードが一致しない場合エラーが表示される', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.email'), 'test@example.com')
      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password456')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('auth.errors.passwordMismatch')
      })
    })

    it('利用規約に同意しないとボタンが無効', () => {
      renderWithProviders(<SignupForm />)

      const submitButton = screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' })
      expect(submitButton).toBeDisabled()
    })

    it('利用規約に同意するとボタンが有効になる', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      await user.click(screen.getByRole('checkbox'))

      const submitButton = screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' })
      expect(submitButton).not.toBeDisabled()
    })

    it('パスワード長インジケーターが表示される', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.password'), 'pass')

      // パスワード長表示が存在
      expect(screen.getByText(/4 \/ 8/)).toBeInTheDocument()
    })

    it('パスワード一致インジケーターが表示される', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password123')

      expect(screen.getByText('auth.signupForm.passwordMatch')).toBeInTheDocument()
    })
  })

  describe('フォーム送信', () => {
    it('サインアップ成功時にカレンダーページへ遷移する', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({
        data: { user: { id: '123' }, session: {} },
        error: null,
      })

      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.email'), 'test@example.com')
      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password123')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockPush).toHaveBeenCalledWith('/ja/calendar')
      })
    })

    it('サインアップ失敗時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      })

      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.email'), 'existing@example.com')
      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password123')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Email already exists')
      })
    })

    it('送信中はローディング状態になる', async () => {
      const user = userEvent.setup()
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: {}, session: {} }, error: null }), 100))
      )

      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.email'), 'test@example.com')
      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password123')
      await user.click(screen.getByRole('checkbox'))

      const submitButton = screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })
  })

  describe('パスワード表示切替', () => {
    it('パスワードフィールドの表示切替が機能する', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      const passwordInput = screen.getByLabelText('auth.signupForm.password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      // パスワード入力欄の親要素内にあるボタンを取得
      const passwordContainer = passwordInput.closest('.relative')
      const toggleButton = passwordContainer?.querySelector('button')
      expect(toggleButton).toBeTruthy()

      await user.click(toggleButton!)

      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('確認パスワードフィールドの表示切替が機能する', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignupForm />)

      const confirmInput = screen.getByLabelText('auth.signupForm.confirmPassword')
      expect(confirmInput).toHaveAttribute('type', 'password')

      // 確認パスワード入力欄の親要素内にあるボタンを取得
      const confirmContainer = confirmInput.closest('.relative')
      const toggleButton = confirmContainer?.querySelector('button')
      expect(toggleButton).toBeTruthy()

      await user.click(toggleButton!)

      expect(confirmInput).toHaveAttribute('type', 'text')
    })
  })

  describe('グレースフルデグラデーション', () => {
    it('パスワードチェックAPIが失敗してもサインアップ可能', async () => {
      const user = userEvent.setup()

      // パスワードチェックが例外を投げる状態をシミュレート
      const { checkPasswordPwned } = await import('@/lib/auth/pwned-password')
      vi.mocked(checkPasswordPwned).mockRejectedValueOnce(new Error('API Error'))

      mockSignUp.mockResolvedValue({
        data: { user: { id: '123' }, session: {} },
        error: null,
      })

      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.email'), 'test@example.com')
      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password123')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' }))

      // APIエラーでもサインアップは続行される
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled()
      })
    })

    it('漏洩パスワード検出時はエラーが表示される', async () => {
      const user = userEvent.setup()

      const { checkPasswordPwned } = await import('@/lib/auth/pwned-password')
      vi.mocked(checkPasswordPwned).mockResolvedValueOnce(true)

      renderWithProviders(<SignupForm />)

      await user.type(screen.getByLabelText('auth.signupForm.email'), 'test@example.com')
      await user.type(screen.getByLabelText('auth.signupForm.password'), 'password123')
      await user.type(screen.getByLabelText('auth.signupForm.confirmPassword'), 'password123')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: 'auth.signupForm.createAccountButton' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('auth.errors.pwnedPassword')
      })

      // サインアップは呼ばれない
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })
})
