import React from 'react'

import { vi } from 'vitest'

// Next.js Navigation のモック
export const mockNextRouter = {
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}

// Next.js Image のモック
export const mockNextImage = {
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props })
  },
}

// モックの適用
vi.mock('next/navigation', () => mockNextRouter)
vi.mock('next/image', () => mockNextImage)
