import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'cypress',
      'compass',
      '**/e2e/**', // Playwright E2Eテストを除外
      '**/integration/**', // 統合テストを除外（npm run test:integrationで実行）
    ],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'dist/',
        '.next/',
        'cypress/',
        'compass/',
      ],
      // 固定閾値は使用しない（CIで「低下のみFail」方式を採用）
      // baseline比較は .github/workflows/coverage.yml で実施
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
