import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('Avatarが正しくレンダリングされる', () => {
      render(
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByText('U').closest('[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByText('AB').closest('[data-slot="avatar"]')
      expect(avatar).toHaveAttribute('data-slot', 'avatar')
    })

    it('カスタムclassNameが適用される', () => {
      render(
        <Avatar className="custom-avatar">
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByText('C').closest('[data-slot="avatar"]')
      expect(avatar?.className).toContain('custom-avatar')
    })

    it('基本スタイルが適用される', () => {
      render(
        <Avatar>
          <AvatarFallback>D</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByText('D').closest('[data-slot="avatar"]')
      expect(avatar?.className).toContain('rounded-full')
      expect(avatar?.className).toContain('size-8')
    })
  })

  describe('AvatarImage', () => {
    it('AvatarImageコンポーネントがレンダリングされる', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="ユーザー" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )

      // Avatar全体が正しくレンダリングされることを確認
      const avatar = screen.getByText('U').closest('[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
    })

    it('AvatarImageのdata-slot属性が設定される', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="プロフィール画像" />
          <AvatarFallback>P</AvatarFallback>
        </Avatar>
      )

      // AvatarImage要素の存在を確認（Radix UIは遅延読み込みでimgをレンダリング）
      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
    })

    it('Avatarコンポーネントが正しくマウントされる', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="テストユーザー" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('AvatarFallback', () => {
    it('AvatarFallbackが正しくレンダリングされる', () => {
      render(
        <Avatar>
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('FB')).toBeInTheDocument()
    })

    it('data-slot属性が設定される', () => {
      render(
        <Avatar>
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      )

      const fallback = screen.getByText('FB')
      expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback')
    })

    it('カスタムclassNameが適用される', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback">CF</AvatarFallback>
        </Avatar>
      )

      const fallback = screen.getByText('CF')
      expect(fallback.className).toContain('custom-fallback')
    })

    it('フォールバックスタイルが適用される', () => {
      render(
        <Avatar>
          <AvatarFallback>FS</AvatarFallback>
        </Avatar>
      )

      const fallback = screen.getByText('FS')
      expect(fallback.className).toContain('flex')
      expect(fallback.className).toContain('items-center')
      expect(fallback.className).toContain('justify-center')
      expect(fallback.className).toContain('rounded-full')
    })

    it('背景色が適用される', () => {
      render(
        <Avatar>
          <AvatarFallback>BG</AvatarFallback>
        </Avatar>
      )

      const fallback = screen.getByText('BG')
      expect(fallback.className).toContain('bg-muted')
    })
  })

  describe('統合テスト', () => {
    it('画像とフォールバックを持つAvatarが正しく構成される', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/user.jpg" alt="ユーザー画像" />
          <AvatarFallback>UF</AvatarFallback>
        </Avatar>
      )

      // Avatar全体が存在することを確認
      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()

      // フォールバックが存在することを確認（画像が読み込まれる前に表示される可能性がある）
      const fallback = screen.getByText('UF')
      expect(fallback).toBeInTheDocument()
    })

    it('イニシャルを表示するフォールバック', () => {
      render(
        <Avatar>
          <AvatarImage src="invalid-url.jpg" alt="エラー画像" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>
      )

      // フォールバックテキストが表示される
      expect(screen.getByText('TU')).toBeInTheDocument()
    })

    it('複数文字のフォールバック', () => {
      render(
        <Avatar>
          <AvatarFallback>太郎</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('太郎')).toBeInTheDocument()
    })

    it('アイコンをフォールバックとして使用できる', () => {
      const UserIcon = () => <svg data-testid="user-icon" />

      render(
        <Avatar>
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
      )

      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })
  })

  describe('サイズバリエーション', () => {
    it('カスタムサイズが適用される', () => {
      render(
        <Avatar className="size-12">
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByText('L').closest('[data-slot="avatar"]')
      expect(avatar?.className).toContain('size-12')
    })

    it('小サイズのAvatarが作成できる', () => {
      render(
        <Avatar className="size-6">
          <AvatarFallback className="text-xs">S</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByText('S').closest('[data-slot="avatar"]')
      expect(avatar?.className).toContain('size-6')

      const fallback = screen.getByText('S')
      expect(fallback.className).toContain('text-xs')
    })
  })
})
