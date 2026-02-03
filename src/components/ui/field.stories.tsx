import type { Meta, StoryObj } from '@storybook/react';

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
    <div className="bg-background text-foreground min-h-screen p-8">
      <h1 className="mb-2 text-2xl font-bold">Field</h1>
      <p className="text-muted-foreground mb-8">フォームフィールド関連コンポーネント</p>

      <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
        <div>
          <h2 className="mb-2 text-lg font-bold">基本（ラベル + 入力）</h2>
          <p className="text-muted-foreground mb-4 text-sm">FieldLabel + Input の組み合わせ</p>
          <div className="space-y-1">
            <FieldLabel htmlFor="basic">ラベル</FieldLabel>
            <Input id="basic" placeholder="入力してください" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">必須表示</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            LoginForm, SignupForm で使用。required + requiredLabel
          </p>
          <div className="space-y-1">
            <FieldLabel htmlFor="req" required requiredLabel="必須">
              メールアドレス
            </FieldLabel>
            <Input id="req" type="email" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">サポートテキスト</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            tag-create-modal, tag-note-field で使用。入力形式の説明
          </p>
          <div className="space-y-1">
            <FieldLabel htmlFor="support">タグ名</FieldLabel>
            <FieldSupportText>最大20文字まで</FieldSupportText>
            <Input id="support" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">エラー状態</h2>
          <p className="text-muted-foreground mb-4 text-sm">FieldError でエラーメッセージを表示</p>
          <div className="space-y-1">
            <FieldLabel htmlFor="err">入力項目</FieldLabel>
            <Input id="err" aria-invalid="true" defaultValue="不正な値" />
            <FieldError id="err-msg">有効な値を入力してください</FieldError>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">説明テキスト</h2>
          <p className="text-muted-foreground mb-4 text-sm">FieldDescription で補足説明を表示</p>
          <div className="space-y-1">
            <FieldLabel htmlFor="desc">パスワード</FieldLabel>
            <Input id="desc" type="password" />
            <FieldDescription>8文字以上で設定してください</FieldDescription>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">フィールドグループ</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            FieldGroup で複数フィールドをグループ化
          </p>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="grp1">姓</FieldLabel>
              <Input id="grp1" />
            </Field>
            <Field>
              <FieldLabel htmlFor="grp2">名</FieldLabel>
              <Input id="grp2" />
            </Field>
          </FieldGroup>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">セパレーター</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            LoginForm, SignupForm で使用。「または」などの区切り
          </p>
          <FieldGroup>
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

        <div>
          <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>LoginForm.tsx, SignupForm.tsx, PasswordResetForm.tsx</li>
            <li>tag-create-modal.tsx, tag-rename-dialog.tsx, tag-note-field.tsx</li>
            <li>SettingField.tsx</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">コンポーネント</h2>
          <div className="bg-surface-container rounded-lg p-4">
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>Field - フィールドラッパー（orientation: vertical/horizontal）</li>
              <li>FieldGroup - 複数フィールドのグループ化</li>
              <li>FieldLabel - ラベル（required, requiredLabel）</li>
              <li>FieldDescription - 補足説明</li>
              <li>FieldSupportText - 入力形式の説明</li>
              <li>FieldError - エラーメッセージ（announceImmediately, noPrefix）</li>
              <li>FieldSeparator - 区切り線（「または」等）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};
