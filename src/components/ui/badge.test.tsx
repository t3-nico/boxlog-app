import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  describe('基本レンダリング', () => {
    it('テキストが正しく表示される', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('デフォルトでspan要素としてレンダリングされる', () => {
      render(<Badge>Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge.tagName).toBe('SPAN')
    })
  })

  describe('バリアント', () => {
    it('default variantが適用される', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge.className).toContain('bg-primary')
      expect(badge.className).toContain('border-transparent')
    })

    it('secondary variantが適用される', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge.className).toContain('bg-secondary')
      expect(badge.className).toContain('border-transparent')
    })

    it('destructive variantが適用される', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge.className).toContain('bg-destructive')
      expect(badge.className).toContain('border-transparent')
    })

    it('outline variantが適用される', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge.className).toContain('text-foreground')
      expect(badge.className).toContain('border')
    })
  })

  describe('スタイリング', () => {
    it('カスタムclassNameが適用される', () => {
      render(<Badge className="custom-badge">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge.className).toContain('custom-badge')
    })

    it('基本スタイルが常に適用される', () => {
      render(<Badge>Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge.className).toContain('inline-flex')
      expect(badge.className).toContain('rounded-md')
      expect(badge.className).toContain('text-xs')
    })
  })

  describe('asChild prop', () => {
    it('asChildがtrueの場合、子要素がレンダリングされる', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link Badge')
    })
  })

  describe('アクセシビリティ', () => {
    it('aria-label属性が適用される', () => {
      render(<Badge aria-label="ステータスバッジ">Status</Badge>)
      expect(screen.getByText('Status')).toHaveAttribute('aria-label', 'ステータスバッジ')
    })

    it('data-slot属性が設定される', () => {
      render(<Badge>Badge</Badge>)
      expect(screen.getByText('Badge')).toHaveAttribute('data-slot', 'badge')
    })
  })

  describe('コンテンツ', () => {
    it('複数の子要素をレンダリングできる', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })

    it('SVGアイコンを含められる', () => {
      render(
        <Badge>
          <svg data-testid="icon" />
          Badge
        </Badge>
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Badge')).toBeInTheDocument()
    })
  })
})
