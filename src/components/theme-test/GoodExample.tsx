/**
 * Theme Enforcement テスト用 - 良い例
 * 正しいtheme systemの使用例
 */

import { colors, rounded, spacing, typography } from '@/config/theme'

export const GoodExample = () => {
  return (
    <div
      className={`${colors.primary.DEFAULT} ${colors.text.inverted} ${spacing.component.lg} ${rounded.component.card.md}`}
    >
      <h1 className={`${typography.heading.h2} ${spacing.stack.sm}`}>正しいtheme system使用例</h1>
      <p className={`${typography.body.sm} ${colors.text.inverted} opacity-80`}>
        このコンポーネントはtheme systemを正しく使用しています
      </p>
      <button
        className={`${colors.semantic.error.DEFAULT} hover:${colors.semantic.error.hover} ${spacing.button.md} ${rounded.component.button.md} ${spacing.stack.md}`}
      >
        正しいボタン
      </button>
    </div>
  )
}
