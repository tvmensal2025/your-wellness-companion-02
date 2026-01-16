import '@testing-library/jest-dom'
import 'vitest-canvas-mock'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

// Mock ResizeObserver for testing environment (not available in jsdom)
Object.defineProperty(global, 'ResizeObserver', { value: ResizeObserverMock })
// Mock IntersectionObserver for testing environment (not available in jsdom)
Object.defineProperty(global, 'IntersectionObserver', { value: IntersectionObserverMock })

// Mock matchMedia for testing environment (not available in jsdom)
Object.defineProperty(global, 'matchMedia', {
  value: () => ({ matches: false, addListener() {}, removeListener() {} })
})


