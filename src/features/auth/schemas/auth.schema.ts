import { z } from 'zod';

/**
 * ログインフォームのスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * パスワードスキーマ（NIST SP 800-63B 準拠）
 *
 * 要件: 8文字以上64文字以内のみ。
 * 構成ルール（大文字/数字/特殊文字）は課さない。
 *
 * 理由:
 * - NIST SP 800-63B は構成ルールを非推奨としている
 * - 構成ルールは形式的に通る弱いパスワード（Password1!）を助長する
 * - 漏洩パスワードチェック（Have I Been Pwned）の方が実効性が高い
 *
 * @see https://pages.nist.gov/800-63-3/sp800-63b.html#memsecret
 */
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .max(64, 'パスワードは64文字以内で入力してください');

/**
 * サインアップフォームのスキーマ
 */
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'パスワード確認を入力してください'),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: '利用規約への同意が必要です' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
