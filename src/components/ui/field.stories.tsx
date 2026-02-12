import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSupportText,
} from './field';
import { Input } from './input';

const meta = {
  title: 'Components/Field',
  component: FieldLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FieldLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => (
    <div className="flex w-80 flex-col items-start gap-6">
      <div className="w-full space-y-1">
        <FieldLabel htmlFor="basic">ラベル</FieldLabel>
        <Input id="basic" placeholder="入力してください" />
      </div>

      <div className="w-full space-y-1">
        <FieldLabel htmlFor="req" required requiredLabel="必須">
          メールアドレス
        </FieldLabel>
        <Input id="req" type="email" />
      </div>

      <div className="w-full space-y-1">
        <FieldLabel htmlFor="support">タグ名</FieldLabel>
        <FieldSupportText>最大20文字まで</FieldSupportText>
        <Input id="support" />
      </div>

      <div className="w-full space-y-1">
        <FieldLabel htmlFor="err">入力項目</FieldLabel>
        <Input id="err" aria-invalid="true" defaultValue="不正な値" />
        <FieldError id="err-msg">有効な値を入力してください</FieldError>
      </div>

      <div className="w-full space-y-1">
        <FieldLabel htmlFor="desc">パスワード</FieldLabel>
        <Input id="desc" type="password" />
        <FieldDescription>8文字以上で設定してください</FieldDescription>
      </div>

      <FieldGroup className="w-full">
        <Field>
          <FieldLabel htmlFor="grp1">姓</FieldLabel>
          <Input id="grp1" />
        </Field>
        <Field>
          <FieldLabel htmlFor="grp2">名</FieldLabel>
          <Input id="grp2" />
        </Field>
      </FieldGroup>

      <FieldGroup className="w-full">
        <Field>
          <FieldLabel htmlFor="sep1">メールアドレス</FieldLabel>
          <Input id="sep1" type="email" />
        </Field>
        <FieldSeparator>または</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="sep2">電話番号</FieldLabel>
          <Input id="sep2" type="tel" />
        </Field>
      </FieldGroup>
    </div>
  ),
};
