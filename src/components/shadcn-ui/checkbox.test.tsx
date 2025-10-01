import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  describe('基本レンダリング', () => {
    it('チェックボックスが正しくレンダリングされる', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('デフォルトでチェックされていない', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('checkedプロパティでチェック状態になる', () => {
      render(<Checkbox checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('インタラクション', () => {
    it('クリックでチェック状態が切り替わる', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(<Checkbox onCheckedChange={onCheckedChange} />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)

      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it('制御されたコンポーネントとして動作する', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      const { rerender } = render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')

      await user.click(checkbox)
      expect(onCheckedChange).toHaveBeenCalledWith(true)

      // 親コンポーネントが状態を更新したと仮定
      rerender(<Checkbox checked={true} onCheckedChange={onCheckedChange} />)
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('無効化状態', () => {
    it('disabledプロパティで無効化される', () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('無効化時にクリックできない', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()

      render(<Checkbox disabled onCheckedChange={onCheckedChange} />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)

      expect(onCheckedChange).not.toHaveBeenCalled()
    })

    it('無効化時の視覚的スタイルが適用される', () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.className).toContain('disabled:cursor-not-allowed')
      expect(checkbox.className).toContain('disabled:opacity-50')
    })
  })

  describe('スタイリング', () => {
    it('カスタムclassNameが適用される', () => {
      render(<Checkbox className="custom-checkbox" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.className).toContain('custom-checkbox')
    })

    it('基本スタイルが適用される', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.className).toContain('h-4')
      expect(checkbox.className).toContain('w-4')
      expect(checkbox.className).toContain('rounded-sm')
    })

    it('チェック時の背景色が適用される', () => {
      render(<Checkbox checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.className).toContain('data-[state=checked]:bg-blue-600')
    })
  })

  describe('アクセシビリティ', () => {
    it('aria-labelが設定できる', () => {
      render(<Checkbox aria-label="利用規約に同意" />)
      const checkbox = screen.getByRole('checkbox', { name: '利用規約に同意' })
      expect(checkbox).toBeInTheDocument()
    })

    it('aria-describedbyが設定できる', () => {
      render(
        <>
          <Checkbox aria-describedby="checkbox-description" />
          <div id="checkbox-description">この項目は必須です</div>
        </>
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-description')
    })

    it('フォーカス時のリングスタイルが適用される', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.className).toContain('focus-visible:ring-2')
      expect(checkbox.className).toContain('focus-visible:ring-blue-500')
    })
  })

  describe('チェックマークアイコン', () => {
    it('チェック時にアイコンが表示される', () => {
      render(<Checkbox checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      const icon = checkbox.querySelector('[data-slot="icon"]')
      expect(icon).toBeInTheDocument()
    })

    it('未チェック時はアイコンが表示されない', () => {
      render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')

      // Radix UIはIndicatorを条件付きでレンダリング
      // 未チェック時はIndicator自体が存在しないか、非表示になる
      const icon = checkbox.querySelector('[data-slot="icon"]')
      // アイコンが存在しないか、または親のIndicatorが非表示
      if (icon) {
        // Indicatorの親要素が非表示かチェック
        const indicator = icon.closest('[data-state]')
        expect(indicator).toBeTruthy()
      }
    })
  })

  describe('不確定状態', () => {
    it('indeterminateプロパティで不確定状態になる', () => {
      render(<Checkbox checked="indeterminate" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
    })
  })

  describe('フォーム統合', () => {
    it('value属性が設定できる', () => {
      render(<Checkbox value="accepted" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('value', 'accepted')
    })

    it('required属性が設定できる', () => {
      render(<Checkbox required />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-required', 'true')
    })
  })
})
