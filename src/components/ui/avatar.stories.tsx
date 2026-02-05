import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage, AvatarUpload } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
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
      <div className="text-center">
        <Avatar size="xs">
          <AvatarFallback className="text-xs">A</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">xs (24px)</p>
      </div>
      <div className="text-center">
        <Avatar size="sm">
          <AvatarFallback className="text-sm">B</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">sm (32px)</p>
      </div>
      <div className="text-center">
        <Avatar size="default">
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">default (40px)</p>
      </div>
      <div className="text-center">
        <Avatar size="lg">
          <AvatarFallback>D</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">lg (48px)</p>
      </div>
      <div className="text-center">
        <Avatar size="xl">
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">xl (64px)</p>
      </div>
      <div className="text-center">
        <Avatar size="2xl">
          <AvatarFallback>F</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">2xl (96px)</p>
      </div>
      <div className="text-center">
        <Avatar size="3xl">
          <AvatarFallback>G</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground mt-2 text-xs">3xl (120px)</p>
      </div>
    </div>
  ),
};

export const AllPatterns: Story = {
  render: () => (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Avatar - 実使用パターン</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">サイズ（size variant）</h2>
          <div className="flex items-end gap-4">
            <div className="text-center">
              <Avatar size="xs">
                <AvatarFallback className="text-xs">A</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">xs</p>
            </div>
            <div className="text-center">
              <Avatar size="sm">
                <AvatarFallback className="text-sm">B</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">sm</p>
            </div>
            <div className="text-center">
              <Avatar size="default">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">default</p>
            </div>
            <div className="text-center">
              <Avatar size="lg">
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">lg</p>
            </div>
            <div className="text-center">
              <Avatar size="xl">
                <AvatarFallback>E</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">xl</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">角丸バリエーション</h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Avatar size="xs">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">デフォルト</p>
            </div>
            <div className="text-center">
              <Avatar size="xs" className="rounded-2xl">
                <AvatarFallback className="rounded-2xl">B</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">rounded-2xl</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">画像 + フォールバック</h2>
          <div className="flex gap-4">
            <div className="text-center">
              <Avatar size="sm">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">画像あり</p>
            </div>
            <div className="text-center">
              <Avatar size="sm">
                <AvatarImage src="/invalid.png" alt="User" />
                <AvatarFallback>山田</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">フォールバック</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
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
      <div className="text-center">
        <AvatarUploadDemo size="2xl" />
        <p className="text-muted-foreground mt-4 text-sm">2xl (96px)</p>
      </div>
      <div className="text-center">
        <AvatarUploadDemo size="3xl" />
        <p className="text-muted-foreground mt-4 text-sm">3xl (120px)</p>
      </div>
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
