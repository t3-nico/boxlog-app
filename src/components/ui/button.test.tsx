import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from './button'

describe('Button', () => {
  describe('基本レンダリング', () => {
    it('テキストが正しく表示される', () => {
      render(<Button>クリック</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('クリック')
    })

    it('デフォルトでbutton要素としてレンダリングされる', () => {
      render(<Button>ボタン</Button>)
      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('type属性がデフォルトでbuttonになる', () => {
      render(<Button>ボタン</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })
  })

  describe('バリアント', () => {
    it('default variantが適用される', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-blue-600')
    })

    it('destructive variantが適用される', () => {
      render(<Button variant="destructive">Destructive</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-red-600')
    })

    it('outline variantが適用される', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
    })

    it('ghost variantが適用される', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('hover:bg-neutral-100')
    })

    it('link variantが適用される', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('underline-offset-4')
    })
  })

  describe('サイズ', () => {
    it('default sizeが適用される', () => {
      render(<Button size="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-9')
    })

    it('sm sizeが適用される', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-8')
    })

    it('lg sizeが適用される', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
    })

    it('icon sizeが適用される', () => {
      render(<Button size="icon">Icon</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('size-9')
    })
  })

  describe('インタラクション', () => {
    it('クリックイベントが発火する', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>クリック</Button>)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('disabled状態ではクリックイベントが発火しない', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button onClick={handleClick} disabled>
          クリック
        </Button>
      )

      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('disabled状態ではopacityが適用される', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('disabled:opacity-50')
    })
  })

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('asChild prop', () => {
    it('asChildがtrueの場合、子要素がレンダリングされる', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link Button')
    })
  })

  describe('アクセシビリティ', () => {
    it('aria-label属性が適用される', () => {
      render(<Button aria-label="送信ボタン">送信</Button>)
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '送信ボタン'
      )
    })

    it('aria-disabled属性が適用される', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })
  })

  describe('ref', () => {
    it('refが正しく転送される', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Button</Button>)
      expect(ref).toHaveBeenCalled()
    })
  })
})
