/**
 * ボタンコンポーネント例
 * Tailwind公式準拠 + cn()ユーティリティ使用
 */

import { cn } from '@/lib/utils'
import { designTokens } from '@/config/design-tokens'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // ベーススタイル
        designTokens.patterns.button.base,

        // サイズ
        designTokens.patterns.button.sizes[size],

        // バリアント別スタイル
        variant === 'primary' &&
          cn(
            designTokens.colors.primary.default,
            designTokens.colors.primary.hover,
            designTokens.colors.primary.active,
            designTokens.colors.primary.text
          ),

        variant === 'secondary' &&
          cn(
            designTokens.colors.secondary.default,
            designTokens.colors.secondary.hover,
            designTokens.colors.secondary.active,
            designTokens.colors.secondary.text
          ),

        variant === 'ghost' &&
          cn(
            'bg-transparent',
            designTokens.colors.text.secondary,
            'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          ),

        variant === 'danger' &&
          cn(
            designTokens.colors.semantic.error.default,
            designTokens.colors.semantic.error.hover,
            designTokens.colors.text.white
          ),

        // カスタムクラス（上書き可能）
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}