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
  sidebar: {
    navigation: {
      calendar: 'カレンダー',
      plan: 'プラン',
      record: '記録',
      stats: '統計',
    },
  },
  common: {
    close: '閉じる',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    delete: '削除',
    edit: '編集',
    loading: '読み込み中...',
    deleting: '削除中...',
  },
  actions: {
    delete: '削除',
    cancel: 'キャンセル',
    deleting: '削除中...',
  },
  error: {
    loading: {
      default: '読み込み中...',
      title: '読み込み中',
      loadingData: 'データを読み込んでいます...',
      loadFailed: 'データの読み込みに失敗しました',
      retry: '再試行',
      noData: 'データがありません',
      loadingPage: 'ページを読み込み中',
      pleaseWait: 'しばらくお待ちください...',
    },
  },
  legal: {
    cookies: {
      banner: {
        title: 'Cookieの使用について',
        description: '当サイトは、サービスの向上と利用状況の分析のためにCookieを使用します。',
        learnMore: '詳しく見る',
        acceptAll: 'すべて同意',
        rejectAll: '必須のみ',
        customize: 'カスタマイズ',
      },
    },
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
      values: [], // 背景色選択は無効化（セマンティックトークンを使用）
      grid: {
        cellSize: 16, // 16pxグリッド
        cellAmount: 5, // 80px（5マス）ごとに強調線
        opacity: 0.6,
        offsetX: 16, // 左端1マス分オフセット
        offsetY: 16, // 上端1マス分オフセット
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Docs', 'Tokens', 'Components', 'Patterns'],
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'html-has-lang', enabled: false },
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region', enabled: false },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
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
        dynamicTitle: false,
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
          <Story />
        </NextIntlClientProvider>
      );
    },
  ],
};

export default preview;
