import type { Preview } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';

import '../src/styles/globals.css';

// Storybook用のメッセージ（必要なものだけ）
const messages = {
  avatarDropzone: {
    avatarAlt: 'プロフィール画像',
    upload: '画像を選択',
    change: '変更',
    remove: '削除',
    uploading: 'アップロード中...',
    fileRequirements: 'JPG, PNG, GIF, WebP ({maxSize}以下)',
    fileTooLarge: 'ファイルサイズは{maxSize}以下にしてください',
    invalidFileType: '画像ファイルのみアップロード可能です',
    uploadFailed: 'アップロードに失敗しました',
    deleteFailed: '削除に失敗しました',
    deleteConfirm: 'プロフィール画像を削除しますか？',
  },
  common: {
    close: '閉じる',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    loading: '読み込み中...',
  },
  aria: {
    selectColor: '{color}を選択',
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // セマンティックトークンを使うため無効化
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Docs', 'Tokens', 'Components'],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';

      // ダークモード切り替え + Radix Portal用のbodyスタイル
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        // Radix UIのPortalはdocument.bodyにレンダリングされるため、
        // bodyにもテーマクラスを適用してモーダル等が正しく表示されるようにする
        document.body.classList.add('bg-background', 'text-foreground');
      }

      return (
        <NextIntlClientProvider locale="ja" messages={messages}>
          <div className="bg-background text-foreground p-4">
            <Story />
          </div>
        </NextIntlClientProvider>
      );
    },
  ],
};

export default preview;
