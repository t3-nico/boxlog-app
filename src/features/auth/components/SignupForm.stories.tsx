import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FieldError, FieldGroup } from '@/components/ui/field';
import { Link } from '@/i18n/navigation';

import { SignupForm } from './SignupForm';

/** SignupForm - サインアップフォーム */
const meta = {
  title: 'Features/Auth/SignupForm',
  component: SignupForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Visual Variants
// ─────────────────────────────────────────────────────────

function EmailSentExample() {
  const [email] = useState('user@example.com');

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-muted-foreground text-balance">
                  We sent a confirmation link to <span className="font-normal">{email}</span>
                </p>
              </div>
              <Button asChild>
                <Link href="/auth/login">Back to login</Link>
              </Button>
            </FieldGroup>
          </div>
          <div className="bg-container relative hidden md:block" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** デフォルト表示 */
export const Default: Story = {};

/** フォーム入力の操作テスト */
export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // メール入力
    const emailInput = canvas.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'newuser@example.com');
    await expect(emailInput).toHaveValue('newuser@example.com');

    // パスワード入力
    const passwordInput = canvas.getByLabelText(/^password/i);
    await userEvent.type(passwordInput, 'SecureP@ss123');

    // 確認パスワード入力
    const confirmInput = canvas.getByLabelText(/confirm/i);
    await userEvent.type(confirmInput, 'SecureP@ss123');
    await expect(confirmInput).toHaveValue('SecureP@ss123');
  },
};

/** メール確認送信後の画面 */
export const EmailSent: Story = {
  render: () => <EmailSentExample />,
};

/** エラーメッセージ一覧 */
export const ErrorMessages: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4 p-6">
      <p className="text-muted-foreground text-sm font-medium">SignupForm error variations</p>
      <FieldError announceImmediately className="text-center">
        This email is already registered. Please try logging in.
      </FieldError>
      <FieldError announceImmediately className="text-center">
        Too many requests. Please wait a moment and try again.
      </FieldError>
      <FieldError announceImmediately className="text-center">
        Password must be at least 8 characters long
      </FieldError>
      <FieldError announceImmediately className="text-center">
        This password has been exposed in a data breach. Please use a more secure password.
      </FieldError>
      <FieldError announceImmediately className="text-center">
        An unexpected error occurred
      </FieldError>
    </div>
  ),
};
