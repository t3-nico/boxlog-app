import type { Preview } from '@storybook/react-vite';
import { useDarkMode } from '@vueless/storybook-dark-mode';
import { NextIntlClientProvider } from 'next-intl';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

import '../src/styles/globals.css';
import { DocsTemplate } from './DocsTemplate';
import { ThemedDocsContainer } from './ThemedDocsContainer';
import { dayoptDarkTheme, dayoptLightTheme } from './dayoptTheme';
import { TRPCMockProvider } from './mocks/trpc';
import './prose.css';

// 実際のメッセージファイルからインポート（手動管理を排除し、キー不足を防止）
import appMessages from '../messages/ja/app.json';
import authMessages from '../messages/ja/auth.json';
import avatarDropzoneMessages from '../messages/ja/avatarDropzone.json';
import calendarMessages from '../messages/ja/calendar.json';
import commonMessages from '../messages/ja/common.json';
import errorMessages from '../messages/ja/error.json';
import legalMessages from '../messages/ja/legal.json';
import navigationMessages from '../messages/ja/navigation.json';
import notificationMessages from '../messages/ja/notification.json';
import planMessages from '../messages/ja/plan.json';
import recordMessages from '../messages/ja/record.json';
import settingsMessages from '../messages/ja/settings.json';
import tagMessages from '../messages/ja/tag.json';

const messages = {
  ...appMessages,
  ...authMessages,
  ...avatarDropzoneMessages,
  ...calendarMessages,
  ...commonMessages,
  ...errorMessages,
  ...legalMessages,
  ...navigationMessages,
  ...notificationMessages,
  ...planMessages,
  ...recordMessages,
  ...settingsMessages,
  ...tagMessages,
};

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
      },
    },
    backgrounds: {
      options: {},
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
        order: ['Docs', 'Foundations', 'Primitives', 'Recipes', 'Features', 'Patterns'],
      },
    },
    darkMode: {
      dark: dayoptDarkTheme,
      light: dayoptLightTheme,
      stylePreview: true,
      classTarget: 'html',
    },
    docs: {
      codePanel: true,
      container: ThemedDocsContainer,
      page: DocsTemplate,
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          // Storybook iframe構造に起因する誤検出を無効化
          { id: 'html-has-lang', enabled: false },
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region', enabled: false },
          // Story単体表示では見出し階層が不完全になるのは構造上正常
          { id: 'heading-order', enabled: false },
          // Radix UI の内部実装による aria-checked 等の誤検出
          { id: 'aria-prohibited-attr', enabled: false },
        ],
      },

      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
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
