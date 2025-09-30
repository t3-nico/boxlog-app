/**
 * カードコンポーネント例
 * Tailwind公式準拠 + cn()ユーティリティ使用
 */

import { cn } from '@/lib/utils'
import { designTokens } from '@/config/design-tokens'

interface CardProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div
      className={cn(
        // ベーススタイル
        designTokens.colors.background.card,
        designTokens.spacing.component.card,
        designTokens.radius.md,
        designTokens.shadows.md,
        designTokens.effects.transition.default,

        // カスタムクラス
        className
      )}
    >
      {/* ヘッダー */}
      <div className={cn(designTokens.spacing.stack.md)}>
        <h3 className={cn(designTokens.typography.heading.h3, designTokens.colors.text.primary)}>{title}</h3>

        {description && (
          <p className={cn(designTokens.typography.body.sm, designTokens.colors.text.muted)}>{description}</p>
        )}
      </div>

      {/* コンテンツ */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}