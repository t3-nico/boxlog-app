import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';

const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultOTP() {
    const [value, setValue] = useState('');
    return (
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
    );
  },
};

export const MFAVerification: Story = {
  render: function MFAVerificationStory() {
    const [verificationCode, setVerificationCode] = useState('');
    return (
      <div className="w-80 space-y-4">
        <p className="text-muted-foreground text-sm">
          認証アプリに表示されている6桁のコードを入力してください
        </p>
        <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-muted-foreground text-sm">入力値: {verificationCode || '（未入力）'}</p>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [value, setValue] = useState('');

    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">InputOTP - 実際の使用パターン</h1>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">MFA認証コード入力</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              MFASection.tsxで使用されているパターン
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
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">使用Props</h2>
            <ul className="text-muted-foreground list-inside list-disc text-sm">
              <li>
                <code>maxLength={'{6}'}</code> - 6桁固定
              </li>
              <li>
                <code>value</code> - 制御された値
              </li>
              <li>
                <code>onChange</code> - 値変更時のコールバック
              </li>
            </ul>
          </section>

          <section className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              <strong>Note:</strong> InputOTPSeparator, pattern, disabled は現在未使用
            </p>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
