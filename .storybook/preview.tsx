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
    previous: '前へ',
    next: '次へ',
    openMenu: 'メニューを開く',
  },
  comingSoon: '近日公開',
  createNew: {
    tag: 'タグを作成',
  },
  createSheet: {
    history: '履歴から作成',
    plan: '予定',
    record: '記録',
    template: 'テンプレート',
  },
  navUser: {
    account: 'アカウント',
    help: 'ヘルプ',
    helpSubmenu: {
      contact: 'お問い合わせ',
      documentation: 'ドキュメント',
      privacyPolicy: 'プライバシーポリシー',
      releaseNotes: 'リリースノート',
      security: 'セキュリティ',
      termsOfService: '利用規約',
      tokushoho: '特定商取引法に基づく表記',
    },
    logout: 'ログアウト',
    personalize: 'パーソナライズ',
    settings: '設定',
    upgradePlan: 'プランをアップグレードする',
  },
  tags: {
    page: {
      searchPlaceholder: 'タグを検索...',
      noTags: 'タグがありません',
    },
    modal: {
      createTitle: '新規タグ作成',
      createDescription: '新しいタグを作成します',
      editTitle: 'タグを編集',
      updating: '更新中...',
      update: '更新',
    },
    form: {
      tagName: 'タグ名',
      examplePlaceholder: '時間記録を分類するためのラベル',
      color: 'カラー',
      group: 'グループ',
      groupSupportText: '同じ種類のタグをまとめて管理できます',
      duplicateName: '同名のTagsがすでに存在します',
      namePlaceholder: 'タグ名を入力',
      description: '説明（任意）',
      descriptionPlaceholder: 'このタグの用途や説明を入力...',
    },
    validation: {
      nameEmpty: 'タグ名を入力してください',
      nameRequired: 'タグ名は必須です',
      nameLimitReached: 'タグ名は{max}文字までです',
    },
    errors: {
      createFailed: 'タグの作成に失敗しました',
      updateFailed: 'タグの更新に失敗しました',
    },
    sidebar: {
      uncategorized: '未分類',
    },
  },
  calendar: {
    title: 'カレンダー',
    filter: {
      ungrouped: '未分類',
      tagMenu: 'タグメニュー',
      rename: '名前を変更',
      changeColor: 'カラーを変更',
      editNote: 'ノートを編集',
      noteLabel: 'ノート',
      noteHint: 'ツールチップに表示されます',
      notePlaceholder: 'ノートを追加...',
      merge: '他のタグに統合',
      showOnlyThis: 'このタグだけ表示',
      addChildTag: '子タグを追加',
      changeParent: '親タグを変更',
      noParent: '親タグなし',
    },
    toast: {
      conflictDescription: 'この時間帯には既に予定があります',
    },
    event: {
      noTitle: '新しい予定',
      noTimeSet: '時間未設定',
      reminderSet: 'リマインダー設定あり',
      adjustEndTime: '終了時間を調整',
      markComplete: '完了にする',
      markIncomplete: '未完了に戻す',
    },
    agenda: 'アジェンダ',
    actions: {
      goToToday: '今日に戻る',
      close: '閉じる',
    },
    views: {
      agenda: 'アジェンダ',
      day: '日',
      daysSubmenu: '日数',
      generalSettings: '一般設定',
      multiday: '{count}日間',
      showWeekNumbers: '週数を表示',
      showWeekends: '週末を表示',
      viewSettings: 'ビューの設定',
      week: '週',
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
    overdue: {
      badge: '{count}件の保留中',
      title: '保留中のタスク',
      period: '過去365日間',
      helpText: '期限を迎えた未完了タスクが表示されます。',
      noTitle: '(タイトルなし)',
      timeUnset: '時間は未指定',
      popoverTitle: '期限切れのプラン',
      overdueBy: '{time}超過',
    },
    panel: {
      loading: '読み込み中...',
      open: 'パネルを開く',
      sortBy: '並び替え',
      groupBy: 'グループ',
      reset: 'リセット',
      sort: {
        createdAt: '作成日',
        updatedAt: '更新日',
        dueDate: '期限',
        title: 'タイトル',
        asc: '昇順',
        desc: '降順',
      },
      group: {
        none: 'なし',
        dueDate: '期限',
        tags: 'タグ',
      },
      status: {
        label: 'ステータス',
        all: 'すべて',
        open: '未完了',
        closed: '完了',
        overdue: '期限切れ',
      },
      schedule: {
        label: '日付',
        all: 'すべて',
        scheduled: '予定済み',
        unscheduled: 'スケジュールなし',
      },
      recordSearchPlaceholder: '記録を検索...',
      noRecords: '記録はありません',
      createRecord: '記録を作成',
      recordThis: '記録する',
      noTitle: '(タイトルなし)',
      duration: '{minutes}分',
      fulfillment: '充実度',
      recordSort: {
        workedAt: '作業日',
        durationMinutes: '所要時間',
        fulfillmentScore: '充実度',
        createdAt: '作成日',
        updatedAt: '更新日',
        asc: '昇順',
        desc: '降順',
      },
      recordGroup: {
        none: 'なし',
        workedAt: '日付',
        tags: 'タグ',
        fulfillmentScore: '充実度',
      },
      recordDateFilter: {
        label: '期間',
        all: 'すべて',
        today: '今日',
        thisWeek: '今週',
        thisMonth: '今月',
      },
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
      disable: true,
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
        order: ['Docs', 'Tokens', 'Components', 'Features', 'Patterns'],
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
            <main>
              <Story />
            </main>
          </NextIntlClientProvider>
        </TRPCMockProvider>
      );
    },
  ],
};

export default preview;
