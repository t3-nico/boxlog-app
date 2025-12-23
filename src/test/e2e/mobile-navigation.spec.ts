import { test, expect, devices } from '@playwright/test'

/**
 * モバイルナビゲーションのE2Eテスト
 *
 * モバイルデバイスでのみ実行される
 * ボトムナビゲーション、設定画面のスタック遷移などをテスト
 */

// iPhone 14でテスト
test.use(devices['iPhone 14'])

test.describe('モバイルナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    // 認証が必要な場合はここでログイン処理
    // await page.goto('/auth/login')
    // ...
  })

  test.describe('ボトムナビゲーション', () => {
    test('ボトムナビゲーションが表示される', async ({ page }) => {
      await page.goto('/ja/calendar')

      // ボトムナビゲーションの存在確認
      const nav = page.getByRole('navigation', { name: /mobile navigation/i })
      await expect(nav).toBeVisible()

      // 4つのナビゲーション項目が表示される
      await expect(page.getByRole('link', { name: /calendar/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /inbox/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /tags/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /more/i })).toBeVisible()
    })

    test('ナビゲーションタップでページ遷移する', async ({ page }) => {
      await page.goto('/ja/calendar')

      // Inboxをタップ
      await page.getByRole('link', { name: /inbox/i }).tap()
      await expect(page).toHaveURL(/\/inbox/)

      // Tagsをタップ
      await page.getByRole('link', { name: /tags/i }).tap()
      await expect(page).toHaveURL(/\/tags/)

      // Calendarに戻る
      await page.getByRole('link', { name: /calendar/i }).tap()
      await expect(page).toHaveURL(/\/calendar/)
    })

    test('アクティブ状態が正しく表示される', async ({ page }) => {
      await page.goto('/ja/calendar')

      // Calendarがアクティブ
      const calendarLink = page.getByRole('link', { name: /calendar/i })
      await expect(calendarLink).toHaveAttribute('aria-current', 'page')

      // Inboxに遷移
      await page.getByRole('link', { name: /inbox/i }).tap()
      await page.waitForURL(/\/inbox/)

      // Inboxがアクティブ
      const inboxLink = page.getByRole('link', { name: /inbox/i })
      await expect(inboxLink).toHaveAttribute('aria-current', 'page')
    })
  })

  test.describe('Moreアクションシート', () => {
    test('Moreボタンでシートが開く', async ({ page }) => {
      await page.goto('/ja/calendar')

      // Moreボタンをタップ
      await page.getByRole('button', { name: /more/i }).tap()

      // シートが表示される
      const sheet = page.getByRole('dialog')
      await expect(sheet).toBeVisible()

      // メニュー項目が表示される
      await expect(page.getByText(/検索|search/i)).toBeVisible()
      await expect(page.getByText(/通知|notification/i)).toBeVisible()
      await expect(page.getByText(/統計|stats/i)).toBeVisible()
    })

    test('ユーザーカードタップで設定画面に遷移', async ({ page }) => {
      await page.goto('/ja/calendar')

      // Moreボタンをタップ
      await page.getByRole('button', { name: /more/i }).tap()

      // ユーザーカード（設定へのリンク）をタップ
      // ユーザー名またはメールアドレスが表示されているボタン
      const userCard = page.locator('button').filter({ hasText: /@/ }).first()
      if (await userCard.isVisible()) {
        await userCard.tap()
        await expect(page).toHaveURL(/\/settings/)
      }
    })
  })

  test.describe('設定画面スタック遷移', () => {
    test('設定画面でカテゴリ一覧が表示される', async ({ page }) => {
      await page.goto('/ja/settings')

      // カテゴリ一覧が表示される（モバイルのみ）
      await expect(page.getByText(/一般|general/i)).toBeVisible()
      await expect(page.getByText(/アカウント|account/i)).toBeVisible()
    })

    test('カテゴリタップで詳細画面に遷移', async ({ page }) => {
      await page.goto('/ja/settings')

      // 一般をタップ
      await page.getByText(/一般|general/i).first().tap()
      await expect(page).toHaveURL(/\/settings\/general/)

      // 戻るボタンで一覧に戻る
      const backButton = page.getByRole('button', { name: /戻る|back/i })
      if (await backButton.isVisible()) {
        await backButton.tap()
        await expect(page).toHaveURL(/\/settings$/)
      }
    })
  })

  test.describe('タッチターゲットサイズ', () => {
    test('ボトムナビゲーションのタッチターゲットが48px以上', async ({ page }) => {
      await page.goto('/ja/calendar')

      // ナビゲーションリンクのサイズを確認
      const navLinks = page.getByRole('navigation', { name: /mobile navigation/i }).getByRole('link')
      const count = await navLinks.count()

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i)
        const box = await link.boundingBox()
        if (box) {
          // 高さが48px以上（ボトムナビは64pxなので余裕がある）
          expect(box.height).toBeGreaterThanOrEqual(48)
        }
      }
    })
  })
})

test.describe('デスクトップでのモバイルUI非表示', () => {
  // デスクトップ設定でテスト
  test.use(devices['Desktop Chrome'])

  test('ボトムナビゲーションが非表示', async ({ page }) => {
    await page.goto('/ja/calendar')

    // ボトムナビゲーションが非表示
    const nav = page.getByRole('navigation', { name: /mobile navigation/i })
    await expect(nav).not.toBeVisible()
  })
})
