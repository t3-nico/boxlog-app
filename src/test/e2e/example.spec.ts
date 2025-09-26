import { test, expect } from '@playwright/test'

/**
 * 基本的なE2Eテストの例
 *
 * このファイルは企業級品質保証のためのE2Eテスト必須設定の一部です。
 * 実際のテストケースに置き換えて使用してください。
 */

test.describe('BoxLog App - 基本機能', () => {
  test('ホームページが正しく表示される', async ({ page }) => {
    await page.goto('/')

    // ページタイトルを確認
    await expect(page).toHaveTitle(/BoxLog/)

    // メイン要素の存在確認
    await expect(page.locator('main')).toBeVisible()
  })

  test('ナビゲーションが機能する', async ({ page }) => {
    await page.goto('/')

    // ナビゲーションリンクの存在確認
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')

    // メイン要素の表示確認
    const main = page.locator('main')
    await expect(main).toBeVisible()

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(main).toBeVisible()
  })
})

test.describe('アクセシビリティ', () => {
  test('基本的なアクセシビリティ要件を満たしている', async ({ page }) => {
    await page.goto('/')

    // フォーカス可能な要素の確認
    const focusableElements = await page.locator('button, a, input, select, textarea').count()
    expect(focusableElements).toBeGreaterThan(0)

    // 見出し構造の確認
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count()
    expect(headings).toBeGreaterThan(0)
  })
})

test.describe('パフォーマンス', () => {
  test('ページ読み込み時間が適切である', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')

    // DOMContentLoadedまでの時間を測定
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start

    // 5秒以内での読み込みを期待
    expect(loadTime).toBeLessThan(5000)
  })
})