import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('Card Components', () => {
  describe('Card', () => {
    it('基本的なCardが正しくレンダリングされる', () => {
      render(<Card>カードコンテンツ</Card>)
      expect(screen.getByText('カードコンテンツ')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      const { container } = render(<Card>テスト</Card>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Card className="custom-card">テスト</Card>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('custom-card')
    })

    it('基本スタイルが適用される', () => {
      const { container } = render(<Card>テスト</Card>)
      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('rounded-xl')
      expect(card?.className).toContain('border')
    })
  })

  describe('CardHeader', () => {
    it('CardHeaderが正しくレンダリングされる', () => {
      render(<CardHeader>ヘッダー</CardHeader>)
      expect(screen.getByText('ヘッダー')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      const { container } = render(<CardHeader>ヘッダー</CardHeader>)
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('カスタムclassNameが適用される', () => {
      const { container } = render(<CardHeader className="custom-header">ヘッダー</CardHeader>)
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header?.className).toContain('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('CardTitleが正しくレンダリングされる', () => {
      render(<CardTitle>タイトル</CardTitle>)
      expect(screen.getByText('タイトル')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(<CardTitle>タイトル</CardTitle>)
      const title = screen.getByText('タイトル')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('フォントスタイルが適用される', () => {
      render(<CardTitle>タイトル</CardTitle>)
      const title = screen.getByText('タイトル')
      expect(title.className).toContain('font-semibold')
      expect(title.className).toContain('leading-none')
    })
  })

  describe('CardDescription', () => {
    it('CardDescriptionが正しくレンダリングされる', () => {
      render(<CardDescription>説明テキスト</CardDescription>)
      expect(screen.getByText('説明テキスト')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(<CardDescription>説明</CardDescription>)
      const description = screen.getByText('説明')
      expect(description).toHaveAttribute('data-slot', 'card-description')
    })

    it('テキストスタイルが適用される', () => {
      render(<CardDescription>説明</CardDescription>)
      const description = screen.getByText('説明')
      expect(description.className).toContain('text-sm')
    })
  })

  describe('CardAction', () => {
    it('CardActionが正しくレンダリングされる', () => {
      render(<CardAction>アクション</CardAction>)
      expect(screen.getByText('アクション')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(<CardAction>アクション</CardAction>)
      const action = screen.getByText('アクション')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })

    it('配置スタイルが適用される', () => {
      render(<CardAction>アクション</CardAction>)
      const action = screen.getByText('アクション')
      expect(action.className).toContain('col-start-2')
      expect(action.className).toContain('justify-self-end')
    })
  })

  describe('CardContent', () => {
    it('CardContentが正しくレンダリングされる', () => {
      render(<CardContent>コンテンツ</CardContent>)
      expect(screen.getByText('コンテンツ')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(<CardContent>コンテンツ</CardContent>)
      const content = screen.getByText('コンテンツ')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })

    it('パディングが適用される', () => {
      render(<CardContent>コンテンツ</CardContent>)
      const content = screen.getByText('コンテンツ')
      expect(content.className).toContain('px-6')
    })
  })

  describe('CardFooter', () => {
    it('CardFooterが正しくレンダリングされる', () => {
      render(<CardFooter>フッター</CardFooter>)
      expect(screen.getByText('フッター')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(<CardFooter>フッター</CardFooter>)
      const footer = screen.getByText('フッター')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })

    it('フレックスレイアウトが適用される', () => {
      render(<CardFooter>フッター</CardFooter>)
      const footer = screen.getByText('フッター')
      expect(footer.className).toContain('flex')
      expect(footer.className).toContain('items-center')
    })
  })

  describe('統合テスト', () => {
    it('完全なCardが正しく構成される', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>カードタイトル</CardTitle>
            <CardDescription>カード説明</CardDescription>
            <CardAction>
              <button>編集</button>
            </CardAction>
          </CardHeader>
          <CardContent>メインコンテンツ</CardContent>
          <CardFooter>フッターアクション</CardFooter>
        </Card>
      )

      expect(screen.getByText('カードタイトル')).toBeInTheDocument()
      expect(screen.getByText('カード説明')).toBeInTheDocument()
      expect(screen.getByText('編集')).toBeInTheDocument()
      expect(screen.getByText('メインコンテンツ')).toBeInTheDocument()
      expect(screen.getByText('フッターアクション')).toBeInTheDocument()
    })

    it('子要素にReactコンポーネントを含められる', () => {
      const CustomComponent = () => <div>カスタムコンポーネント</div>

      render(
        <Card>
          <CardContent>
            <CustomComponent />
          </CardContent>
        </Card>
      )

      expect(screen.getByText('カスタムコンポーネント')).toBeInTheDocument()
    })
  })
})
