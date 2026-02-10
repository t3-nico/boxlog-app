import path from 'path';

import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    // パスエイリアス設定
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      // Next.js 関連をStorybook用モックに置換
      'next/image': path.resolve(__dirname, './mocks/next-image.tsx'),
      'next/link': path.resolve(__dirname, './mocks/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './mocks/next-navigation.tsx'),
      // Sentry（@sentry/nextjs が Next.js 内部の process 依存のため Storybook ではモック化）
      '@sentry/nextjs': path.resolve(__dirname, './mocks/sentry-nextjs.ts'),
    };
    // React自動JSXランタイム設定
    config.esbuild = {
      ...config.esbuild,
      jsx: 'automatic',
    };
    return config;
  },
};

export default config;
