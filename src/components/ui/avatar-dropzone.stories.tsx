import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AvatarDropzone } from './avatar-dropzone';

const meta = {
  title: 'Components/AvatarDropzone',
  component: AvatarDropzone,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AvatarDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  args: {
    onUpload: async () => {},
  },
  render: function AvatarDropzoneStory() {
    const [isUploading1, setIsUploading1] = useState(false);
    const [isUploading2, setIsUploading2] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const simulateUpload = async (setUploading: (v: boolean) => void) => {
      setUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploading(false);
    };

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">AvatarDropzone</h1>
        <p className="text-muted-foreground mb-8">
          プロフィール画像のアップロード。ドラッグ&ドロップ、円形プレビュー対応。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '48rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">未設定状態</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              初期状態。クリックまたはドラッグ&ドロップでアップロード。
            </p>
            <AvatarDropzone
              currentAvatarUrl={null}
              onUpload={async (file) => {
                await simulateUpload(setIsUploading1);
                // 実際にはここでアップロード処理
                setAvatarUrl(URL.createObjectURL(file));
              }}
              isUploading={isUploading1}
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">画像設定済み</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              アバター設定済み。変更・削除ボタンが表示される。
            </p>
            <AvatarDropzone
              currentAvatarUrl={avatarUrl || '/avatars/default.png'}
              onUpload={async (file) => {
                await simulateUpload(setIsUploading2);
                setAvatarUrl(URL.createObjectURL(file));
              }}
              onRemove={async () => {
                setAvatarUrl(null);
              }}
              isUploading={isUploading2}
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">サイズバリエーション</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              sizeプロップでサイズを変更可能。デフォルトは96px。
            </p>
            <div className="flex items-end gap-8">
              <div className="text-center">
                <AvatarDropzone currentAvatarUrl={null} onUpload={async () => {}} size={64} />
                <p className="text-muted-foreground mt-2 text-xs">64px</p>
              </div>
              <div className="text-center">
                <AvatarDropzone currentAvatarUrl={null} onUpload={async () => {}} size={96} />
                <p className="text-muted-foreground mt-2 text-xs">96px（デフォルト）</p>
              </div>
              <div className="text-center">
                <AvatarDropzone currentAvatarUrl={null} onUpload={async () => {}} size={128} />
                <p className="text-muted-foreground mt-2 text-xs">128px</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">無効状態</h2>
            <p className="text-muted-foreground mb-4 text-sm">disabled=trueで操作不可。</p>
            <AvatarDropzone currentAvatarUrl={null} onUpload={async () => {}} disabled />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">機能</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>ドラッグ&ドロップ対応（react-dropzone使用）</li>
                <li>画像ファイルのみ受付（jpg, png, gif, webp）</li>
                <li>最大ファイルサイズ制限（デフォルト5MB）</li>
                <li>アップロード中のローディング表示</li>
                <li>ホバー時のオーバーレイ表示</li>
                <li>削除確認ダイアログ</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>AvatarChangeDialog - プロフィール画像変更</li>
              <li>ProfileSection - 設定画面のプロフィール編集</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
