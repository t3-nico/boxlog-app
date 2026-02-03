import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './field';
import { Input } from './input';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
      <Input id="email" type="email" placeholder="email@example.com" />
    </Field>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="password">パスワード</FieldLabel>
      <FieldDescription>8文字以上で設定してください</FieldDescription>
      <Input id="password" type="password" />
    </Field>
  ),
};

export const Required: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="name" required>
        名前
      </FieldLabel>
      <Input id="name" required />
    </Field>
  ),
};

export const Optional: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="nickname" optional>
        ニックネーム
      </FieldLabel>
      <Input id="nickname" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field className="w-80" data-invalid="true">
      <FieldLabel htmlFor="email-error">メールアドレス</FieldLabel>
      <Input id="email-error" type="email" aria-invalid="true" defaultValue="invalid-email" />
      <FieldError>有効なメールアドレスを入力してください</FieldError>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-80">
      <FieldLabel htmlFor="toggle" className="flex-1">
        通知を受け取る
      </FieldLabel>
      <Checkbox id="toggle" />
    </Field>
  ),
};

export const FieldSetExample: Story = {
  render: () => (
    <FieldSet className="w-96">
      <FieldLegend>アカウント情報</FieldLegend>
      <FieldDescription>基本的なアカウント情報を入力してください</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fs-name" required>
            名前
          </FieldLabel>
          <Input id="fs-name" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fs-email" required>
            メールアドレス
          </FieldLabel>
          <Input id="fs-email" type="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fs-phone" optional>
            電話番号
          </FieldLabel>
          <Input id="fs-phone" type="tel" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <FieldSet className="w-80">
      <FieldLegend variant="label">配送方法</FieldLegend>
      <RadioGroup defaultValue="standard">
        <Field orientation="horizontal">
          <RadioGroupItem value="standard" id="standard" />
          <FieldContent>
            <FieldLabel htmlFor="standard">通常配送</FieldLabel>
            <FieldDescription>3〜5営業日でお届け</FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="express" id="express" />
          <FieldContent>
            <FieldLabel htmlFor="express">速達配送</FieldLabel>
            <FieldDescription>1〜2営業日でお届け</FieldDescription>
          </FieldContent>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Field - 全バリエーション</h1>

      <div className="space-y-12 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <Field>
            <FieldLabel htmlFor="basic">ラベル</FieldLabel>
            <Input id="basic" placeholder="入力してください" />
          </Field>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">説明付き</h2>
          <Field>
            <FieldLabel htmlFor="with-desc">ラベル</FieldLabel>
            <FieldDescription>補足説明テキスト</FieldDescription>
            <Input id="with-desc" />
          </Field>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">必須 / 任意</h2>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="req" required>
                必須項目
              </FieldLabel>
              <Input id="req" />
            </Field>
            <Field>
              <FieldLabel htmlFor="opt" optional>
                任意項目
              </FieldLabel>
              <Input id="opt" />
            </Field>
          </FieldGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">エラー状態</h2>
          <Field data-invalid="true">
            <FieldLabel htmlFor="err">入力項目</FieldLabel>
            <Input id="err" aria-invalid="true" />
            <FieldError>エラーメッセージ</FieldError>
          </Field>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">水平レイアウト</h2>
          <Field orientation="horizontal">
            <FieldLabel className="flex-1">オプション</FieldLabel>
            <Checkbox />
          </Field>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">コンポーネント構成</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><code>FieldSet</code> - フィールドグループのルート</li>
            <li><code>FieldLegend</code> - グループの見出し</li>
            <li><code>FieldGroup</code> - フィールドのコンテナ</li>
            <li><code>Field</code> - 個々のフィールド</li>
            <li><code>FieldLabel</code> - ラベル</li>
            <li><code>FieldDescription</code> - 説明テキスト</li>
            <li><code>FieldError</code> - エラーメッセージ</li>
            <li><code>FieldContent</code> - コンテンツラッパー</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
