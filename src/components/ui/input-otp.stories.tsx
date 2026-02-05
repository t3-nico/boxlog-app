import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';

const meta = {
  title: 'Components/InputOTP',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [value, setValue] = useState('');

    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">InputOTP</h1>
        <p className="text-muted-foreground mb-8">ワンタイムパスワード入力（6桁）</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">MFA認証コード入力</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              MFASection.tsx, mfa-verify/page.tsx で使用。6桁の認証コードを入力。
            </p>
            <InputOTP maxLength={6} value={value} onChange={setValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-muted-foreground mt-2 text-sm">入力値: {value || '（未入力）'}</p>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>MFASection.tsx - MFA設定画面</li>
              <li>mfa-verify/page.tsx - MFA認証ページ</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>InputOTP - ルートコンテナ（maxLength, value, onChange）</li>
                <li>InputOTPGroup - スロットのグループ</li>
                <li>InputOTPSlot - 各桁の入力スロット（index）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
