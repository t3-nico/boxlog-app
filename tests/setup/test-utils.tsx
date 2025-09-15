import React, { ReactElement } from 'react'

import { render, RenderOptions } from '@testing-library/react'

import { Providers } from '@/components/common'

// フィクスチャをインポート
export * from '../fixtures/user'

// カスタムrender関数（ProvidersをラップしたもERS)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <Providers>{children}</Providers>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// よく使うmatchers
export const expectToBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectToHaveTextContent = (element: HTMLElement | null, text: string) => {
  expect(element).toHaveTextContent(text)
}

// ユーザーイベントのヘルパー
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  const { waitForElementToBeRemoved: waitFor } = await import('@testing-library/react')
  return waitFor(element)
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render }