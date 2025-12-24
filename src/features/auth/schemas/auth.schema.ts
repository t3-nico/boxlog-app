import { z } from 'zod'

/**
 * ログインフォームのスキーマ
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * サインアップフォームのスキーマ
 */
export const signupSchema = z
  .object({
    email: z.string().min(1, 'メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .max(64, 'パスワードは64文字以内で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード確認を入力してください'),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: '利用規約への同意が必要です' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type SignupFormData = z.infer<typeof signupSchema>
