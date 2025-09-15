import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', '.next', 'coverage', '.eslint', 'tests/fixtures', 'tests/mocks', 'tests/setup'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'coverage/',
        '.eslint/',
        'config/',
        'scripts/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts', // エクスポートのみのファイル
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/tests': resolve(__dirname, './tests'),
    },
  },
})
