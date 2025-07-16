import '@testing-library/jest-dom'

// Mock for kiboUI components that might use browser APIs
Object.defineProperty(window, 'EyeDropper', {
  writable: true,
  value: class MockEyeDropper {
    async open() {
      return { sRGBHex: '#ff0000' }
    }
  },
})

// Mock IntersectionObserver
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: class MockIntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
})

// Mock ResizeObserver
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: class MockResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
})

// Mock PointerEvent for drag and drop testing
global.PointerEvent = class PointerEvent extends Event {
  constructor(type: string, init?: PointerEventInit) {
    super(type, init)
  }
} as any