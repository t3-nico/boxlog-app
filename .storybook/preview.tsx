import type { Preview } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import { useDarkMode } from 'storybook-dark-mode';

import '../src/styles/globals.css';
import { DocsTemplate } from './DocsTemplate';
import { dayoptDarkTheme, dayoptLightTheme } from './dayoptTheme';
import { TRPCMockProvider } from './mocks/trpc';
import './prose.css';

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
      search: '検索',
    },
    quickCreate: '作成',
    theme: 'テーマ',
    closeSidebar: 'サイドバーを閉じる',
    openSidebar: 'サイドバーを開く',
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
    aria: {
      selectDate: '{date}を選択',
    },
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
  calendar: {
    event: {
      noTitle: '新しい予定',
      noTimeSet: '時間未設定',
      reminderSet: 'リマインダー設定あり',
      adjustEndTime: '終了時間を調整',
    },
    actions: {
      goToToday: '今日に戻る',
    },
    navigation: {
      previous: '前へ',
      next: '次へ',
    },
    headerActions: {
      settings: '設定',
      export: 'エクスポート',
      import: 'インポート',
      moreOptions: 'その他',
    },
    sleepHours: {
      collapsed: '{start} - {end} 睡眠時間帯',
      planCount: '{count}件の予定',
    },
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
      grid: {
        cellSize: 16,
        cellAmount: 5,
        opacity: 0.6,
        offsetX: 16,
        offsetY: 16,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Docs', 'Tokens', 'Components', 'Patterns'],
      },
    },
    darkMode: {
      dark: dayoptDarkTheme,
      light: dayoptLightTheme,
      darkClass: 'dark',
      lightClass: 'light',
      stylePreview: true,
      current: 'light',
    },
    docs: {
      theme: dayoptLightTheme,
      page: DocsTemplate,
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
  decorators: [
    (Story) => {
      const isDark = useDarkMode();

      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      }

      return (
        <TRPCMockProvider>
          <NextIntlClientProvider locale="ja" messages={messages}>
            <Story />
          </NextIntlClientProvider>
        </TRPCMockProvider>
      );
    },
  ],
};

export default preview;
