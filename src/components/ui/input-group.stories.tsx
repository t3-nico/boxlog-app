import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';
import { HoverTooltip } from './tooltip';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col items-start gap-6">
        <InputGroup className="w-80">
          <InputGroupInput
            type={showPassword ? 'text' : 'password'}
            placeholder="パスワードを入力"
          />
          <InputGroupAddon align="inline-end">
            <HoverTooltip content={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}>
              <InputGroupButton
                variant="ghost"
                size="sm"
                icon
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              >
                {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </InputGroupButton>
            </HoverTooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>
    );
  },
};
