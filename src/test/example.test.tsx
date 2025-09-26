import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

// 基本的なユーティリティ関数のテスト例
describe('Utility Functions', () => {
  test('basic math function', () => {
    const add = (a: number, b: number) => a + b
    expect(add(2, 3)).toBe(5)
  })
})

// シンプルなReactコンポーネントのテスト例
function TestButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick}>{children}</button>
}

describe('TestButton Component', () => {
  test('renders with correct text', () => {
    const mockFn = vi.fn()
    render(<TestButton onClick={mockFn}>Click me</TestButton>)

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('calls onClick when clicked', async () => {
    const mockFn = vi.fn()
    render(<TestButton onClick={mockFn}>Click me</TestButton>)

    const button = screen.getByText('Click me')
    await button.click()

    expect(mockFn).toHaveBeenCalledOnce()
  })
})
