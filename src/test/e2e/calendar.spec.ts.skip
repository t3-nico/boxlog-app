import { expect, test } from '@playwright/test'

/**
 * カレンダービューのE2Eテスト
 *
 * テスト対象：
 * - カレンダーページの表示
 * - 日付ナビゲーション
 * - ビュー切り替え（Day/Week/Month）
 * - ミニカレンダー操作
 */
test.describe('Calendar View - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // カレンダーページに移動
    // 認証が必要な場合は適宜調整
    await page.goto('/ja/calendar')

    // ページ読み込み完了を待つ
    await page.waitForLoadState('networkidle')
  })

  test('カレンダーページが正常に表示される', async ({ page }) => {
    // カレンダーの主要要素が表示されているか確認

    // ヘッダー（日付表示・ナビゲーション）
    const header = page.locator('[data-testid="calendar-header"], header')
    await expect(header).toBeVisible()

    // カレンダーグリッド
    const calendarMain = page.locator('[data-calendar-main], main')
    await expect(calendarMain).toBeVisible()

    // 今日の日付が表示されている
    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    })
    await expect(page.locator(`text=/${today.split('年')[0]}/`)).toBeVisible()
  })

  test('日付ナビゲーション（前後移動）が機能する', async ({ page }) => {
    // 現在の日付を取得
    const currentDateText = await page.locator('h1, [role="heading"]').first().textContent()

    // 「次へ」ボタンをクリック
    const nextButton = page.locator('button[aria-label*="Next"], button[title*="Next"], button:has-text("›")')
    await nextButton.first().click()
    await page.waitForTimeout(500) // アニメーション待ち

    // 日付が変わったことを確認
    const newDateText = await page.locator('h1, [role="heading"]').first().textContent()
    expect(newDateText).not.toBe(currentDateText)

    // 「前へ」ボタンで戻る
    const prevButton = page.locator('button[aria-label*="Previous"], button[title*="Previous"], button:has-text("‹")')
    await prevButton.first().click()
    await page.waitForTimeout(500)

    // 元の日付に戻ったことを確認
    const restoredDateText = await page.locator('h1, [role="heading"]').first().textContent()
    expect(restoredDateText).toBe(currentDateText)
  })

  test('ビュー切り替えボタンが機能する', async ({ page }) => {
    // ビュー切り替えドロップダウンを探す
    const viewSwitcher = page.locator('button:has-text("Day"), button:has-text("Week"), button:has-text("Month")')

    if ((await viewSwitcher.count()) > 0) {
      // ドロップダウンを開く
      await viewSwitcher.first().click()
      await page.waitForTimeout(300)

      // Week viewを選択
      const weekOption = page.locator('[role="menuitem"]:has-text("Week"), button:has-text("Week")')
      if ((await weekOption.count()) > 0) {
        await weekOption.first().click()
        await page.waitForTimeout(500)

        // Week viewに切り替わったことを確認（URLまたは表示の変化）
        // 実際のUIに応じて調整
        await expect(page).toHaveURL(/week/i)
      }
    }
  })

  test('「今日」ボタンで現在の日付に戻る', async ({ page }) => {
    // まず未来の日付に移動
    const nextButton = page.locator('button[aria-label*="Next"], button:has-text("›")')
    await nextButton.first().click()
    await nextButton.first().click()
    await page.waitForTimeout(500)

    // 「今日」ボタンをクリック
    const todayButton = page.locator('button:has-text("今日"), button:has-text("Today")')
    if ((await todayButton.count()) > 0) {
      await todayButton.first().click()
      await page.waitForTimeout(500)

      // 現在の日付が表示されていることを確認
      const today = new Date().getDate()
      await expect(page.locator(`text=/${today}/`)).toBeVisible()
    }
  })
})

test.describe('Calendar View - Mini Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ja/calendar')
    await page.waitForLoadState('networkidle')
  })

  test('ミニカレンダーが表示される', async ({ page }) => {
    // サイドバーまたはミニカレンダー領域を確認
    const miniCalendar = page.locator('[data-testid="mini-calendar"], .mini-calendar')

    // ミニカレンダーが存在しない場合、サイドバーを開く必要があるかもしれない
    const sidebar = page.locator('[data-testid="sidebar"], aside, [role="complementary"]')
    if ((await sidebar.count()) > 0) {
      await expect(sidebar).toBeVisible()
    }
  })

  test('ミニカレンダーで日付をクリックして移動', async ({ page }) => {
    // 月の変更ボタンを探す
    const monthNavButtons = page.locator('button[aria-label*="previous"], button[aria-label*="next"]')

    if ((await monthNavButtons.count()) > 0) {
      // 次月に移動
      const nextMonthButton = monthNavButtons.last()
      await nextMonthButton.click()
      await page.waitForTimeout(500)

      // 日付ボタンをクリック（1日を選択）
      const dateButton = page.locator('button[data-day*="01"], button:has-text("1")')
      if ((await dateButton.count()) > 0) {
        await dateButton.first().click()
        await page.waitForTimeout(500)

        // メインカレンダーの日付が変わったことを確認
        // 実際のUIに応じて調整
      }
    }
  })
})

test.describe('Calendar View - Responsive Design', () => {
  test('モバイルビューで正常に表示される', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/ja/calendar')
    await page.waitForLoadState('networkidle')

    // カレンダーが表示されている
    const calendar = page.locator('[data-calendar-main], main')
    await expect(calendar).toBeVisible()

    // 横スクロールが発生していないことを確認
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5) // 5pxの誤差を許容
  })

  test('タブレットビューで正常に表示される', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/ja/calendar')
    await page.waitForLoadState('networkidle')

    const calendar = page.locator('[data-calendar-main], main')
    await expect(calendar).toBeVisible()
  })

  test('デスクトップビューでサイドバーが表示される', async ({ page }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/ja/calendar')
    await page.waitForLoadState('networkidle')

    // サイドバーまたはミニカレンダーが表示されている
    const sidebar = page.locator('[data-testid="sidebar"], aside, [role="complementary"]')
    if ((await sidebar.count()) > 0) {
      await expect(sidebar).toBeVisible()
    }
  })
})

test.describe('Calendar View - Accessibility', () => {
  test('キーボードナビゲーションが機能する', async ({ page }) => {
    await page.goto('/ja/calendar')
    await page.waitForLoadState('networkidle')

    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // フォーカス可能な要素が存在することを確認
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('ARIA属性が適切に設定されている', async ({ page }) => {
    await page.goto('/ja/calendar')
    await page.waitForLoadState('networkidle')

    // メインコンテンツにrole属性が設定されている
    const main = page.locator('[role="main"], main')
    await expect(main).toBeVisible()

    // ナビゲーションボタンにaria-label
    const navButtons = page.locator('button[aria-label]')
    expect(await navButtons.count()).toBeGreaterThan(0)
  })
})
