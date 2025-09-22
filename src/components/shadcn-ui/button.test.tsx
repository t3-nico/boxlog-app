/**
 * Button Component - Accessibility Tests
 *
 * WCAG AA準拠のアクセシビリティテスト
 */

import { render } from '@testing-library/react'
import { describe, it } from 'vitest'
import { testComponentA11y } from '@/tests/setup/accessibility.setup'

import { Button } from './button'

describe('Button - Accessibility Tests', () => {
  it('should have no accessibility violations with default props', async () => {
    const component = render(<Button>Click me</Button>)
    await testComponentA11y(component)
  })

  it('should have no accessibility violations with different variants', async () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

    for (const variant of variants) {
      const component = render(<Button variant={variant}>Click me</Button>)
      await testComponentA11y(component)
      component.unmount()
    }
  })

  it('should have no accessibility violations when disabled', async () => {
    const component = render(<Button disabled>Disabled Button</Button>)
    await testComponentA11y(component)
  })

  it('should have proper ARIA attributes for loading state', async () => {
    const component = render(<Button disabled>Loading...</Button>)
    await testComponentA11y(component)
  })

  it('should have no accessibility violations with custom ARIA labels', async () => {
    const component = render(
      <Button aria-label="Custom button action" aria-describedby="button-description">
        <span id="button-description" className="sr-only">
          This button performs a custom action
        </span>
        Action
      </Button>
    )
    await testComponentA11y(component)
  })

  it('should be keyboard accessible', async () => {
    const component = render(<Button>Keyboard Test</Button>)
    const button = component.getByRole('button')

    // ボタンがフォーカス可能であることを確認
    expect(button).toHaveAttribute('tabIndex', '0')

    await testComponentA11y(component)
  })

  it('should have proper contrast ratios', async () => {
    // 各バリアントのコントラスト比をテスト
    const variants = ['default', 'destructive', 'outline', 'secondary'] as const

    for (const variant of variants) {
      const component = render(<Button variant={variant}>Contrast Test</Button>)
      await testComponentA11y(component)
      component.unmount()
    }
  })
})