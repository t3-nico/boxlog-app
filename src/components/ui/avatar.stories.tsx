import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage, AvatarUpload } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar size="sm">
      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar size="sm">
      <AvatarImage src="/invalid-url.png" alt="User" />
      <AvatarFallback>山田</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="xs">
        <AvatarFallback className="text-xs">A</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback className="text-sm">B</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>D</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>E</AvatarFallback>
      </Avatar>
      <Avatar size="2xl">
        <AvatarFallback>F</AvatarFallback>
      </Avatar>
      <Avatar size="3xl">
        <AvatarFallback>G</AvatarFallback>
      </Avatar>
    </div>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="flex items-end gap-4">
        <Avatar size="xs">
          <AvatarFallback className="text-xs">A</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback className="text-sm">B</AvatarFallback>
        </Avatar>
        <Avatar size="default">
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>D</AvatarFallback>
        </Avatar>
        <Avatar size="xl">
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-4">
        <Avatar size="xs">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar size="xs" className="rounded-2xl">
          <AvatarFallback className="rounded-2xl">B</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex gap-4">
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarImage src="/invalid.png" alt="User" />
          <AvatarFallback>山田</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
};

// =============================================================================
// AvatarUpload Stories
// =============================================================================

function AvatarUploadDemo({
  initialUrl,
  size = '2xl',
}: {
  initialUrl?: string;
  size?: '2xl' | '3xl';
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl || null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    // シミュレート: 1秒後にアップロード完了
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setIsUploading(false);
  };

  const handleRemove = async () => {
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAvatarUrl(null);
    setIsUploading(false);
  };

  return (
    <AvatarUpload
      currentAvatarUrl={avatarUrl}
      onUpload={handleUpload}
      onRemove={handleRemove}
      isUploading={isUploading}
      size={size}
    />
  );
}

export const Upload: Story = {
  render: () => <AvatarUploadDemo />,
  parameters: {
    docs: {
      description: {
        story: 'アバター画像のアップロード機能付きコンポーネント。ドラッグ&ドロップ対応。',
      },
    },
  },
};

export const UploadWithImage: Story = {
  render: () => <AvatarUploadDemo initialUrl="https://github.com/shadcn.png" />,
  parameters: {
    docs: {
      description: {
        story: '既存のアバター画像がある状態。',
      },
    },
  },
};

export const UploadSizes: Story = {
  render: () => (
    <div className="flex gap-8">
      <AvatarUploadDemo size="2xl" />
      <AvatarUploadDemo size="3xl" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'AvatarUploadのサイズバリエーション。',
      },
    },
  },
};

export const UploadUploading: Story = {
  render: () => (
    <AvatarUpload currentAvatarUrl={null} onUpload={async () => {}} isUploading={true} size="2xl" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'アップロード中の状態。',
      },
    },
  },
};
