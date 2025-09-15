import { describe, expect, it } from 'vitest'

import { render, screen } from './setup/test-utils'

// 簡単なコンポーネントをテスト
const TestComponent = () => {
  return <div>Hello, BoxLog Testing!</div>
}

describe('環境セットアップのテスト', () => {
  it('基本的なレンダリングが動作する', () => {
    render(<TestComponent />)
    expect(screen.getByText('Hello, BoxLog Testing!')).toBeInTheDocument()
  })

  it('数値の計算テスト', () => {
    expect(2 + 2).toBe(4)
  })

  it('文字列のマッチングテスト', () => {
    expect('BoxLog').toMatch(/Box/)
  })
})
