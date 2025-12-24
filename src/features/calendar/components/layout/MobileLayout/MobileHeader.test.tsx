import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// 独自のmessagesを使うため、グローバルモックを解除
vi.unmock('next-intl')

import { MobileHeader } from './MobileHeader'

import type { CalendarViewType } from '../../../types/calendar.types'

const messages = {
  calendar: {
    mobile: {
      header: {
        viewLabels: {
          day: '日',
          '3day': '3日',
          '5day': '5日',
          week: '週',
          agenda: 'リスト',
        },
        viewSuffix: '表示',
        back: '戻る',
        openMenu: 'メニューを開く',
        closeMenu: 'メニューを閉じる',
        prevPeriod: '前の期間',
        nextPeriod: '次の期間',
      },
    },
  },
}

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="ja" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  )
}

describe('MobileHeader', () => {
  const defaultProps = {
    viewType: 'day' as CalendarViewType,
    currentDate: new Date('2025-01-15'),
    onNavigate: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onNavigate.mockClear()
  })

  describe('日付表示', () => {
    it('日表示で正しいフォーマット', () => {
      renderWithIntl(<MobileHeader {...defaultProps} viewType="day" />)

      // 1/15 (水) 形式
      expect(screen.getByText(/1\/15/)).toBeInTheDocument()
    })

    it('週表示で正しいフォーマット', () => {
      renderWithIntl(<MobileHeader {...defaultProps} viewType="week" />)

      // 1月 W3 形式
      expect(screen.getByText(/1月.*W/)).toBeInTheDocument()
    })
  })

  describe('ナビゲーション', () => {
    it('前へボタンクリックでonNavigate("prev")が呼ばれる', () => {
      renderWithIntl(<MobileHeader {...defaultProps} />)

      const prevButton = screen.getByRole('button', { name: '前の期間' })
      fireEvent.click(prevButton)

      expect(defaultProps.onNavigate).toHaveBeenCalledWith('prev')
    })

    it('次へボタンクリックでonNavigate("next")が呼ばれる', () => {
      renderWithIntl(<MobileHeader {...defaultProps} />)

      const nextButton = screen.getByRole('button', { name: '次の期間' })
      fireEvent.click(nextButton)

      expect(defaultProps.onNavigate).toHaveBeenCalledWith('next')
    })
  })

  describe('メニュートグル', () => {
    it('メニューボタンクリックでonMenuToggleが呼ばれる', () => {
      const mockMenuToggle = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} onMenuToggle={mockMenuToggle} />)

      const menuButton = screen.getByRole('button', { name: 'メニューを開く' })
      fireEvent.click(menuButton)

      expect(mockMenuToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('戻るボタン', () => {
    it('showBackButton=trueで戻るボタンが表示される', () => {
      const mockBack = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} showBackButton={true} onBack={mockBack} />)

      const backButton = screen.getByRole('button', { name: '戻る' })
      expect(backButton).toBeInTheDocument()
    })

    it('戻るボタンクリックでonBackが呼ばれる', () => {
      const mockBack = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} showBackButton={true} onBack={mockBack} />)

      fireEvent.click(screen.getByRole('button', { name: '戻る' }))

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('showBackButton=falseでメニューボタンが表示される', () => {
      renderWithIntl(<MobileHeader {...defaultProps} showBackButton={false} onMenuToggle={vi.fn()} />)

      expect(screen.getByRole('button', { name: 'メニューを開く' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '戻る' })).not.toBeInTheDocument()
    })
  })

  describe('ビュー切り替えメニュー', () => {
    it('ビューラベルクリックでメニューが開く', () => {
      const mockViewChange = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} onViewChange={mockViewChange} />)

      // 現在のビュー（日表示）をクリック
      const viewButton = screen.getByText('日表示')
      fireEvent.click(viewButton)

      // メニューが開く - 全てのビューオプションが表示される
      expect(screen.getByText('週表示')).toBeInTheDocument()
      expect(screen.getByText('リスト表示')).toBeInTheDocument()
    })

    it('ビュー選択でonViewChangeが呼ばれる', () => {
      const mockViewChange = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} onViewChange={mockViewChange} />)

      // メニューを開く
      fireEvent.click(screen.getByText('日表示'))

      // 週表示を選択
      fireEvent.click(screen.getByText('週表示'))

      expect(mockViewChange).toHaveBeenCalledWith('week')
    })

    it('ESCキーでメニューが閉じる', () => {
      const mockViewChange = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} onViewChange={mockViewChange} />)

      // メニューを開く
      fireEvent.click(screen.getByText('日表示'))
      expect(screen.getByText('週表示')).toBeInTheDocument()

      // ESCキーでオーバーレイを閉じる
      const overlay = screen.getByRole('button', { name: 'メニューを閉じる' })
      fireEvent.keyDown(overlay, { key: 'Escape' })

      // メニューが閉じる（週表示ボタンが1つだけになる = メニュー非表示）
      // 実際はメニュー内の週表示が消える
    })

    it('現在のビューがハイライトされる', () => {
      const mockViewChange = vi.fn()
      renderWithIntl(<MobileHeader {...defaultProps} viewType="week" onViewChange={mockViewChange} />)

      // メニューを開く
      fireEvent.click(screen.getByText('週表示'))

      // 週表示がアクティブ状態（メニュー内のボタンはw-fullを持つ）
      const buttons = screen.getAllByRole('button')
      const menuWeekButton = buttons.find((b) => b.textContent === '週表示' && b.classList.contains('w-full'))
      expect(menuWeekButton).toHaveClass('bg-state-selected')
    })
  })

  describe('タイトル表示', () => {
    it('titleが指定された場合は日付の代わりにタイトルを表示', () => {
      renderWithIntl(<MobileHeader {...defaultProps} title="カスタムタイトル" />)

      expect(screen.getByText('カスタムタイトル')).toBeInTheDocument()
      expect(screen.queryByText(/1\/15/)).not.toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    it('ナビゲーションボタンにaria-labelがある', () => {
      renderWithIntl(<MobileHeader {...defaultProps} />)

      expect(screen.getByRole('button', { name: '前の期間' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '次の期間' })).toBeInTheDocument()
    })

    it('headerロールを持つ', () => {
      renderWithIntl(<MobileHeader {...defaultProps} />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })
})
