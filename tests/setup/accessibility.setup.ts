/**
 * アクセシビリティテスト設定
 *
 * axe-coreとjest-axeを使用したWCAG AA準拠テストの基盤設定
 */

import { configureAxe } from 'jest-axe'
import { beforeAll, afterEach } from 'vitest'

// axe-coreの設定
export const axe = configureAxe({
  rules: {
    // WCAG AA準拠レベルに設定
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'semantic-markup': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  // 除外する要素（開発中のスケルトンなど）
  exclude: [
    '[data-testid="skeleton"]',
    '[data-testid="loading"]',
    '.animate-pulse',
  ],
})

// 共通のアクセシビリティテストヘルパー
export const testA11y = async (container: Element) => {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// React Testing Library用のヘルパー
export const testComponentA11y = async (component: any) => {
  const { container } = component
  await testA11y(container)
}

// 設定初期化
beforeAll(() => {
  // スクリーンリーダーのモック設定
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
    },
  })

  // メディアクエリのモック
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// テスト後のクリーンアップ
afterEach(() => {
  // フォーカス状態をリセット
  if (document.activeElement && document.activeElement !== document.body) {
    ;(document.activeElement as HTMLElement).blur()
  }
})

// アクセシビリティテスト用のカスタムマッチャー
expect.extend({
  toHaveNoViolations: (received) => {
    if (received.violations.length === 0) {
      return {
        pass: true,
        message: () => 'Expected violations but found none',
      }
    }

    const violationMessages = received.violations.map((violation: any) =>
      `${violation.id}: ${violation.description}\n` +
      violation.nodes.map((node: any) => `  - ${node.html}`).join('\n')
    ).join('\n\n')

    return {
      pass: false,
      message: () => `Expected no accessibility violations, but found:\n\n${violationMessages}`,
    }
  },
})

// TypeScript型定義
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toHaveNoViolations(): T
    }
  }
}