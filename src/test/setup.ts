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

// @ts-expect-error - Mock ResizeObserver for testing environment (not available in jsdom)
global.ResizeObserver = ResizeObserverMock as any
// @ts-expect-error - Mock IntersectionObserver for testing environment (not available in jsdom)
global.IntersectionObserver = IntersectionObserverMock as any

// @ts-expect-error - Mock matchMedia for testing environment (not available in jsdom)
global.matchMedia = global.matchMedia || function () {
  return { matches: false, addListener() {}, removeListener() {} }
}


