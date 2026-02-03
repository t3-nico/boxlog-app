import type { Meta, StoryObj } from '@storybook/react';
import { Search, Mail, Eye, EyeOff, Copy, Check, AtSign } from 'lucide-react';
import { useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from './input-group';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search className="size-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="検索..." />
    </InputGroup>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupInput type="email" placeholder="username" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@gmail.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: function WithButtonStory() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <InputGroup className="w-80">
        <InputGroupInput defaultValue="https://example.com/share/abc123" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleCopy} aria-label="コピー">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
};

export const PasswordToggle: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <InputGroup className="w-80">
        <InputGroupAddon>
          <AtSign className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
};

export const Email: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Mail className="size-4" />
      </InputGroupAddon>
      <InputGroupInput type="email" placeholder="email@example.com" />
    </InputGroup>
  ),
};

export const BothSides: Story = {
  render: () => (
    <InputGroup className="w-96">
      <InputGroupAddon>
        <InputGroupText>¥</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput type="number" placeholder="0" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.00</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">InputGroup - 全バリエーション</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">アイコン付き</h2>
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="検索..." />
          </InputGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">テキストプレフィックス</h2>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="your-site.com" />
          </InputGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">テキストサフィックス</h2>
          <InputGroup>
            <InputGroupInput placeholder="username" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>@company.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">ボタン付き</h2>
          <InputGroup>
            <InputGroupInput defaultValue="share-link" readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="コピー">
                <Copy className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">両側</h2>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>¥</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput type="number" placeholder="金額" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>円</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">コンポーネント構成</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><code>InputGroup</code> - コンテナ</li>
            <li><code>InputGroupAddon</code> - アドオン領域</li>
            <li><code>InputGroupInput</code> - 入力フィールド</li>
            <li><code>InputGroupButton</code> - ボタン</li>
            <li><code>InputGroupText</code> - テキスト</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
