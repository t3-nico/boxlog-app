// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'path';

import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@vueless/storybook-dark-mode',
    '@storybook/addon-vitest',
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
    {
      name: '@storybook/addon-mcp',
      options: {
        toolsets: {
          dev: true,
          docs: true,
        },
      },
    },
  ],
  features: {
    experimentalComponentsManifest: true,
  },
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
      // next-intl（React未定義エラー回避）
      'next-intl/navigation': path.resolve(__dirname, './mocks/next-intl-navigation.tsx'),
      'next-intl/routing': path.resolve(__dirname, './mocks/next-intl-routing.ts'),
      // Sentry（@sentry/nextjs が Next.js 内部の process 依存のため Storybook ではモック化）
      '@sentry/nextjs': path.resolve(__dirname, './mocks/sentry-nextjs.ts'),
      // Storybook 10: @storybook/blocks は @storybook/addon-docs/blocks に統合
      '@storybook/blocks': '@storybook/addon-docs/blocks',
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
