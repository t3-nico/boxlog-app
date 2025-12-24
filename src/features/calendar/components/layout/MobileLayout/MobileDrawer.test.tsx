import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// 独自のmessagesを使うため、グローバルモックを解除
vi.unmock('next-intl')

import { DrawerMenuItem, MobileDrawer } from './MobileDrawer'

// next/image のモック
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const messages = {
  calendar: {
    mobile: {
      drawer: {
        calendar: 'カレンダー',
        settings: '設定',
        notifications: '通知',
        closeMenu: 'メニューを閉じる',
      },
    },
  },
  settings: {
    preferences: { title: '表示設定' },
    dataExport: { title: 'データエクスポート' },
  },
  actions: { create: '作成' },
  navigation: { settings: '設定' },
}

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="ja" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  )
}

describe('MobileDrawer', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  describe('表示/非表示', () => {
    it('isOpen=trueのとき表示される', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('isOpen=falseのとき非表示', () => {
      renderWithIntl(<MobileDrawer isOpen={false} onClose={mockOnClose} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('閉じる操作', () => {
    it('ESCキーで閉じる', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('閉じるボタンで閉じる', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: 'メニューを閉じる' })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('オーバーレイクリックで閉じる', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} />)

      // aria-hidden="true" のオーバーレイをクリック
      const overlay = document.querySelector('[aria-hidden="true"]')
      expect(overlay).toBeInTheDocument()
      fireEvent.click(overlay!)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('メニューアイテム', () => {
    it('デフォルトメニューアイテムが表示される', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('カレンダー')).toBeInTheDocument()
      // 「設定」はタイトルとメニューアイテムの2箇所に表示される
      expect(screen.getAllByText('設定')).toHaveLength(2)
      expect(screen.getByText('通知')).toBeInTheDocument()
    })

    it('カスタムメニューアイテムが表示される', () => {
      const customItems: DrawerMenuItem[] = [
        { id: 'custom1', label: 'カスタム1', icon: <span>Icon1</span> },
        { id: 'custom2', label: 'カスタム2', icon: <span>Icon2</span> },
      ]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={customItems} />)

      expect(screen.getByText('カスタム1')).toBeInTheDocument()
      expect(screen.getByText('カスタム2')).toBeInTheDocument()
    })

    it('メニューアイテムクリックでコールバック実行', () => {
      const mockItemClick = vi.fn()
      const items: DrawerMenuItem[] = [
        { id: 'test', label: 'テストアイテム', icon: <span>Icon</span>, onClick: mockItemClick },
      ]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={items} />)

      fireEvent.click(screen.getByText('テストアイテム'))

      expect(mockItemClick).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1) // クリック後に閉じる
    })

    it('disabled状態のアイテムはクリックできない', () => {
      const mockItemClick = vi.fn()
      const items: DrawerMenuItem[] = [
        {
          id: 'disabled',
          label: '無効アイテム',
          icon: <span>Icon</span>,
          onClick: mockItemClick,
          disabled: true,
        },
      ]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={items} />)

      // ボタン内にアイコンも含まれるため、テキストからボタンを取得
      const button = screen.getByText('無効アイテム').closest('button')
      expect(button).toBeDisabled()
    })

    it('dividerが正しく表示される', () => {
      const items: DrawerMenuItem[] = [
        { id: 'item1', label: 'アイテム1', icon: <span>Icon</span> },
        { id: 'divider', label: '', icon: null, divider: true },
        { id: 'item2', label: 'アイテム2', icon: <span>Icon</span> },
      ]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={items} />)

      // dividerはborder-tを持つdivとして表示される
      const dividers = document.querySelectorAll('.border-t')
      expect(dividers.length).toBeGreaterThan(0)
    })
  })

  describe('バッジ表示', () => {
    it('バッジが正しく表示される', () => {
      const items: DrawerMenuItem[] = [{ id: 'badged', label: 'バッジ付き', icon: <span>Icon</span>, badge: 5 }]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={items} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('99より大きいバッジは99+と表示', () => {
      const items: DrawerMenuItem[] = [
        { id: 'large-badge', label: '大きいバッジ', icon: <span>Icon</span>, badge: 150 },
      ]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={items} />)

      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('badge=0の場合は表示されない', () => {
      const items: DrawerMenuItem[] = [{ id: 'no-badge', label: 'バッジなし', icon: <span>Icon</span>, badge: 0 }]

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} items={items} />)

      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('ユーザー情報', () => {
    it('ユーザー情報が表示される', () => {
      const userInfo = {
        name: 'テストユーザー',
        email: 'test@example.com',
      }

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} userInfo={userInfo} />)

      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('アバター画像が表示される', () => {
      const userInfo = {
        name: 'テストユーザー',
        avatar: '/avatar.png',
      }

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} userInfo={userInfo} />)

      const img = screen.getByAltText('テストユーザー')
      expect(img).toBeInTheDocument()
    })

    it('アバターがない場合はデフォルトアイコンが表示される', () => {
      const userInfo = {
        name: 'テストユーザー',
      }

      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} userInfo={userInfo} />)

      // Userアイコンのコンテナが表示される
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    it('dialogロールを持つ', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('カスタムタイトルがaria-labelに設定される', () => {
      renderWithIntl(<MobileDrawer isOpen={true} onClose={mockOnClose} title="カスタムメニュー" />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-label', 'カスタムメニュー')
    })
  })
})
